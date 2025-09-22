import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    browser.storage.sync.set({ enabled: true });
  }
});

// Listen for when a download begins
browser.downloads.onCreated.addListener(async (downloadItem) => {
  // 1. Get current settings and temporary session data
  const settings = await browser.storage.sync.get(null);
  const session = await browser.storage.session.get({ tempCookie: "" });

  console.log("Varia Redirect: Download created:", downloadItem);
  console.log("settings", settings);
  console.log("session", session);

  // --- Start Filtering Logic ---

  // Rule 1: Is the extension globally disabled?
  if (!settings.enabled) {
    console.log("Varia Redirect: Disabled globally.");
    return;
  }

  // Rule 2: Does the download have a valid URL?
  if (!downloadItem.url || !downloadItem.url.startsWith("http")) {
    return; // Ignore downloads without a valid web URL (e.g., blobs)
  }
  const downloadUrl = new URL(downloadItem.url);
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

  // --- If all checks pass, send to Aria2 ---
  sendToAria2(downloadItem, settings, session);
});

async function sendToAria2(downloadItem, settings, session) {
  // Construct the headers array
  const headers = settings.persistentHeaders.map((h) => `${h.key}: ${h.value}`);

  if (downloadItem.referrer) {
    headers.push(`Referer: ${downloadItem.referrer}`);
  }
  if (session.tempCookie) {
    headers.push(`Cookie: ${session.tempCookie}`);
  }

  // --- NEW: Download Directory Logic ---
  let finalDir = settings.downloadDirectory || "";

  // Append date subfolder if enabled
  if (settings.organizeByDate) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const dateSubfolder = `${year}-${month}-${day}`;
    // Use path joining that works on Linux/macOS
    finalDir = finalDir ? `${finalDir}/${dateSubfolder}` : dateSubfolder;
  }

  // Append domain subfolder if enabled
  if (settings.organizeByDomain) {
    const domain = new URL(downloadItem.url).hostname;
    finalDir = finalDir ? `${finalDir}/${domain}` : domain;
  }
  // --- END of New Logic ---

  const filename = downloadItem.filename.split("/").pop().split("\\").pop();

  const params = {
    out: filename,
    header: headers,
  };

  // Only add the 'dir' parameter if we've constructed a path.
  // This prevents sending an empty 'dir', which could cause errors.
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

// A simple listener to clear the session cookie when the popup closes.
browser.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(async () => {
      await browser.storage.session.set({ tempCookie: "" });
      console.log("Popup closed, temporary cookie cleared.");
    });
  }
});
