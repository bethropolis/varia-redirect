import browser from "webextension-polyfill";
import { defaultSettings, parseSettings } from "./settings";

/*
 * typedef {import("./settings.js").Settings} Settings
 */

class settingsDB {
  constructor() {
    if (!this.getSyncSettings()) {
      this.settings = this.get();
    }
  }

  /*
   * Initializes the settings database.
   * @param {Settings} defaultSettings - The default settings to use.
   * @returns {Promise<void>}
   */
  getSyncSettings() {
    let foundData = false;
    browser.storage.sync
      .get(defaultSettings)
      .then((storedSettings) => {
        console.log("Loaded settings from storage:", storedSettings);
        this.settings = parseSettings(storedSettings);
        foundData = true;
      })
      .catch((error) => {
        console.error("Failed to load settings from storage:", error);
      });

    return foundData;
  }

  browserSyncUpdate() {
    browser.storage.sync.set(parseSettings(this.settings)).catch((error) => {
      console.error("Failed to update settings in storage:", error);
    });
  }

  /**
   * Stores the current settings object in localStorage.
   * @returns {void}
   */
  set() {
    localStorage.setItem("settings", JSON.stringify(this.settings));
    this.browserSyncUpdate();
  }

  /**
   * Retrieves the settings object from localStorage.
   */
  get() {
    const value = localStorage.getItem("settings");
    return value ? JSON.parse(value) : defaultSettings;
  }

  /**
   * Updates the settings object in localStorage.
   * @param {any} newSettings - The new settings object to set.
   * @returns {void}
   */
  update(newSettings) {
    this.settings = newSettings;
    this.set();
  }

  /**
   * Clears all values stored in localStorage.
   * @returns {void}
   */
  clear() {
    localStorage.clear();
  }
}

export const DB = new settingsDB();
