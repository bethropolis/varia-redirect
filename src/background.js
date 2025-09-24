import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.storage.sync.set({ enabled: true });
  }

  console.log(
    "Extension installed/updated: testing Aria2 connection for icon.",
  );
  testConnectionAndSetIcon();
});

browser.runtime.onStartup.addListener(() => {
  console.log("Browser startup: testing Aria2 connection for icon.");
  testConnectionAndSetIcon();
});

/**
 * Updates the browser action icon based on connection status.
 * @param {boolean} isConnected - Whether the connection to Aria2 is successful.
 */
function updateBrowserIcon(isConnected) {
  const status = isConnected ? "connected" : "disconnected";
  const iconPaths = {
    16: `icon/icon-${status}-16.png`,
    32: `icon/icon-${status}-32.png`,
    48: `icon/icon-${status}-48.png`,
    128: `icon/icon-${status}-128.png`,
  };

  try {
    if (browser.action && browser.action.setIcon) {
      console.log("Using browser.action.setIcon");
      browser.action.setIcon({ path: iconPaths });
    } else if (browser.browserAction && browser.browserAction.setIcon) {
      console.log("Using browser.browserAction.setIcon");
      browser.browserAction.setIcon({ path: iconPaths });
    } else {
      console.error("Browser action API not available:", {
        action: browser.action,
        browserAction: browser.browserAction,
        manifest: browser.runtime.getManifest(),
      });
    }
  } catch (error) {
    console.error("Failed to update browser icon:", error);
    console.error("Icon paths:", iconPaths);
  }
}

/**
 * Tests the connection to the Aria2 RPC server and updates the icon.
 */
async function testConnectionAndSetIcon() {
  try {
    const settings = await browser.storage.sync.get("rpcUrl");
    if (!settings.rpcUrl) {
      updateBrowserIcon(false);
      return;
    }

    const response = await fetch(settings.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "icon-test",
        method: "aria2.getVersion",
        params: [],
      }),
    });

    const data = await response.json();
    updateBrowserIcon(!!data.result);
  } catch (error) {
    console.error("Icon connection test failed:", error);
    updateBrowserIcon(false);
  }
}

// Listen for when a download begins
browser.downloads.onCreated.addListener(async (downloadItem) => {
  const settings = await browser.storage.sync.get(null);
  const session = await browser.storage.session.get({ tempCookie: "" });

  console.log("Varia Redirect: Download created:", downloadItem);
  console.log("settings", settings);
  console.log("session", session);

  // Rule 1: Is the extension globally disabled?
  if (!settings.enabled) {
    console.log("Varia Redirect: Disabled globally.");
    return;
  }

  // Rule 2: Does the download have a valid URL?
  if (!downloadItem.url || !downloadItem.url.startsWith("http")) {
    return;
  }
  const downloadUrl = new URL(downloadItem.referrer);
  const domain = downloadUrl.hostname;

  // Rule 3: Check against Blocklist/Allowlist
  if (settings.filterMode === "blocklist") {
    if (settings.blockList.includes(domain)) {
      console.log(
        `Varia Redirect: Domain '${domain}' is on the blocklist. Skipping.`,
      );
      return;
    }
  } else {
    // Allowlist mode
    if (!settings.allowList.includes(domain)) {
      console.log(
        `Varia Redirect: Domain '${domain}' is not on the allowlist. Skipping.`,
      );
      return;
    }
  }

  // Rule 4: Check file extension
  const filename = downloadItem.filename.toLowerCase();
  const fileExtension = filename.substring(filename.lastIndexOf("."));
  if (fileExtension && settings.disallowedExtensions.includes(fileExtension)) {
    console.log(
      `Varia Redirect: File extension '${fileExtension}' is disallowed. Skipping.`,
    );
    return;
  }

  // Rule 5: Check minimum size (if available)
  const minSizeBytes = (settings.minDownloadSize || 0) * 1024 * 1024;
  if (downloadItem.totalBytes > 0 && downloadItem.totalBytes < minSizeBytes) {
    console.log(`Varia Redirect: File size is below minimum. Skipping.`);
    return;
  }

  // Rule 6: Execute Custom JavaScript Filter ---
  if (settings.customFilterScript) {
    const safeDownloadInfo = {
      url: downloadItem.url,
      filename: downloadItem.filename.split("/").pop().split("\\").pop(),
      fileSize: downloadItem.totalBytes,
      mime: downloadItem.mime,
      referrer: downloadItem.referrer || "",
    };

    try {
      const userFunction = new Function(
        "download",
        `'use strict'; ${settings.customFilterScript}; return filter(download);`,
      );
      const result = userFunction(safeDownloadInfo);

      if (typeof result === "object" && typeof result.skip === "boolean") {
        if (result.skip) {
          console.log("Varia Redirect: Skipped by custom user script.");
          return;
        }

        console.log("Varia Redirect: Custom script processed.", result);
        sendToAria2(downloadItem, settings, session, result);
        return;
      } else {
        console.warn(
          "Varia Redirect: Custom script did not return a valid object. Ignoring.",
          result,
        );
      }
    } catch (error) {
      console.error(
        "Varia Redirect: Error executing custom user script. Skipping redirect.",
        error,
      );

      browser.notifications.create(`custom-script-fail-${Date.now()}`, {
        type: "basic",
        iconUrl: browser.runtime.getURL("icon/128.png"),
        title: "Custom Script Error",
        message: `Your custom filter script failed to execute: ${error.message}`,
      });
      return;
    }
  }

  // --- If all checks pass, send to Aria2 ---
  sendToAria2(downloadItem, settings, session);
});

async function sendToAria2(downloadItem, settings, session, customResult = {}) {
  const headers = settings.persistentHeaders.map((h) => `${h.key}: ${h.value}`);

  if (downloadItem.referrer) {
    headers.push(`Referer: ${downloadItem.referrer}`);
  }
  if (session.tempCookie) {
    headers.push(`Cookie: ${session.tempCookie}`);
  }

  let finalDir = customResult.dir || settings.downloadDirectory || "";

  // Append date subfolder if enabled (currently the feature may not work)
  if (settings.organizeByDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateSubfolder = `${year}-${month}-${day}`;
    finalDir = finalDir ? `${finalDir}/${dateSubfolder}` : dateSubfolder;
  }

  // Append domain subfolder if enabled (same here)
  if (settings.organizeByDomain) {
    const domain = new URL(downloadItem.url).hostname;
    finalDir = finalDir ? `${finalDir}/${domain}` : domain;
  }

  const filename =
    customResult.filename ||
    downloadItem.filename.split("/").pop().split("\\").pop();

  const params = {
    out: filename,
    header: headers,
  };

  if (finalDir) {
    params.dir = finalDir;
  }

  console.log("Sending to Aria2 with params:", params);

  try {
    const response = await fetch(settings.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: `varia-redirect-${Date.now()}`,
        method: "aria2.addUri",
        params: [[downloadItem.url], params],
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    if (data.result) {
      console.log("Aria2 accepted download:", data.result);
      await browser.downloads.cancel(downloadItem.id);
      await browser.downloads.erase({ id: downloadItem.id });
    }
  } catch (error) {
    console.error("Failed to send to Aria2:", error);
    browser.notifications.create(`aria2-fail-${downloadItem.id}`, {
      type: "basic",
      iconUrl: browser.runtime.getURL("icon/128.png"),
      title: "Aria2 Redirect Failed",
      message: `Could not send download to Aria2. Error: ${error.message}`,
    });
  } finally {
    await browser.storage.session.set({ tempCookie: "" });
  }
}

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(async () => {
      await browser.storage.session.set({ tempCookie: "" });
      console.log("Popup closed, temporary cookie cleared.");
    });
  }
});

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "sync" && changes.rpcUrl) {
    console.log("RPC URL changed: re-testing connection for icon.");
    testConnectionAndSetIcon();
  }
});

// Handle messages from options page for testing custom filter scripts
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TEST_CUSTOM_FILTER") {
    const { script, testData } = message;

    try {
      // Execute the user's filter script with test data
      const userFunction = new Function(
        "download",
        `'use strict'; ${script}; return filter(download);`,
      );
      const result = userFunction(testData);

      // Validate the result format
      if (typeof result !== "object" || result === null) {
        sendResponse({
          success: false,
          error: "Function must return an object",
        });
        return;
      }

      if (typeof result.skip !== "boolean") {
        sendResponse({
          success: false,
          error: 'Return object must have a "skip" property that is boolean',
        });
        return;
      }

      if (result.filename && typeof result.filename !== "string") {
        sendResponse({
          success: false,
          error: 'If provided, "filename" must be a string',
        });
        return;
      }

      if (result.dir && typeof result.dir !== "string") {
        sendResponse({
          success: false,
          error: 'If provided, "dir" must be a string',
        });
        return;
      }

      // Test passed
      sendResponse({
        success: true,
        result: result,
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
      });
    }

    return true; // Keep the message channel open for async response
  }
});
