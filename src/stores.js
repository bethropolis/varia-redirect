import { writable } from "svelte/store";
import browser from "webextension-polyfill";
import { DB } from "./lib/DB";

/*
 * typedef {import("./lib/settings.js").Settings} Settings
 */

/**
 * @typedef {Object} HeaderItem
 * @property {string} key - Header name
 * @property {string} value - Header value
 */

/**
 * @typedef {Object} SessionData
 * @property {string} tempCookie - Temporary cookie for current session
 * @property {string} currentTabDomain - Domain of the current active tab
 * @property {boolean} isConnected - Whether Aria2 connection is active
 */

/**
 * Default session data
 * @type {SessionData}
 */
const defaultSessionData = {
  tempCookie: "",
  currentTabDomain: "",
  isConnected: false,
};

/**
 * Main settings store - automatically syncs with browser storage
 */
export const settings = writable(DB.get());

/**
 * Session store for temporary data (not persisted)
 * @type {import('svelte/store').Writable<SessionData>}
 */
export const sessionStore = writable(defaultSessionData);

// Subscribe to changes in the store and save them to storage
settings.subscribe((value) => {
  DB.update(value);
  console.log("Settings updated:", value);
});

/**
 * Helper function to add an item to a list setting
 * @param {string} listName - Name of the list setting (e.g., 'blockList', 'allowList')
 * @param {string|HeaderItem} newItem - Item to add to the list
 */
export function addToList(listName, newItem) {
  settings.update((currentSettings) => {
    const currentList = currentSettings[listName] || [];

    // For headers, check if key already exists
    if (listName === "persistentHeaders" && typeof newItem === "object") {
      const existingIndex = currentList.findIndex((h) => h.key === newItem.key);
      if (existingIndex !== -1) {
        // Update existing header
        currentList[existingIndex] = newItem;
      } else {
        // Add new header
        currentList.push(newItem);
      }
    } else if (typeof newItem === "string" && !currentList.includes(newItem)) {
      // Add string item if not already present
      currentList.push(newItem);
    }

    return {
      ...currentSettings,
      [listName]: [...currentList],
    };
  });
}

/**
 * Helper function to remove an item from a list setting
 * @param {string} listName - Name of the list setting
 * @param {string|HeaderItem} itemToRemove - Item to remove from the list
 */
export function removeFromList(listName, itemToRemove) {
  settings.update((currentSettings) => {
    const currentList = currentSettings[listName] || [];

    let filteredList;
    if (listName === "persistentHeaders" && typeof itemToRemove === "object") {
      // Remove header by key
      filteredList = currentList.filter((h) => h.key !== itemToRemove.key);
    } else {
      // Remove string item
      filteredList = currentList.filter((item) => item !== itemToRemove);
    }

    return {
      ...currentSettings,
      [listName]: filteredList,
    };
  });
}

/**
 * Test connection to Aria2 server
 * @param {string} rpcUrl - RPC URL to test
 * @returns {Promise<boolean>} - Whether connection was successful
 */
export async function testAria2Connection(rpcUrl) {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "test",
        method: "aria2.getVersion",
        params: [],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const isConnected = Boolean(data.result);

    // Update session store with connection status
    sessionStore.update((session) => ({
      ...session,
      isConnected,
    }));

    return isConnected;
  } catch (error) {
    console.error("Aria2 connection test failed:", error);

    // Update session store with failed connection
    sessionStore.update((session) => ({
      ...session,
      isConnected: false,
    }));

    return false;
  }
}

/**
 * Get current tab domain and update session store
 */
export async function updateCurrentTabDomain() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0 && tabs[0].url) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;

      sessionStore.update((session) => ({
        ...session,
        currentTabDomain: domain,
      }));

      return domain;
    }
  } catch (error) {
    console.error("Failed to get current tab domain:", error);
  }

  return "";
}
