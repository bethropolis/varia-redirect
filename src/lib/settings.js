/**
 * @typedef {Object} HeaderItem
 * @property {string} key - Header name
 * @property {string} value - Header value
 */

/**
 * @typedef {Object} Settings
 * @property {boolean} enabled - Whether the extension is enabled globally
 * @property {'light'|'dark'} theme - UI theme preference
 * @property {string} rpcUrl - Aria2 RPC server URL
 * @property {number} minDownloadSize - Minimum download size in MiB
 * @property {'blocklist'|'allowlist'} filterMode - Website filtering mode
 * @property {string[]} blockList - List of blocked website domains
 * @property {string[]} allowList - List of allowed website domains
 * @property {string[]} disallowedExtensions - List of file extensions to not redirect
 * @property {HeaderItem[]} persistentHeaders - Headers to add to all downloads
 * @property {string} downloadDirectory - The base directory for downloads
 * @property {boolean} organizeByDomain - Whether to create a subfolder for the domain
 * @property {boolean} organizeByDate - Whether to create a subfolder for the date
 */

/**
 * Default settings for the extension
 * @type {Settings}
 */
export const defaultSettings = {
  enabled: true,
  theme: "light",
  rpcUrl: "http://localhost:6801/jsonrpc",
  minDownloadSize: 0,
  filterMode: "blocklist",
  blockList: ["example.com"],
  allowList: ["github.com"],
  disallowedExtensions: [".exe", ".dmg"],
  persistentHeaders: [
    { key: "User-Agent", value: "Varia-Redirect-Extension/1.0" },
  ],
  downloadDirectory: "",
  organizeByDomain: false,
  organizeByDate: false,
};

/**
 * Safely converts unknown storage data to Settings type
 * @param {Record<string, unknown>} data - Raw data from storage
 * @returns {Settings} - Properly typed settings
 */
export function parseSettings(data) {
  return {
    enabled:
      typeof data.enabled === "boolean"
        ? data.enabled
        : defaultSettings.enabled,
    theme:
      data.theme === "light" || data.theme === "dark"
        ? data.theme
        : defaultSettings.theme,
    rpcUrl:
      typeof data.rpcUrl === "string" ? data.rpcUrl : defaultSettings.rpcUrl,
    minDownloadSize:
      typeof data.minDownloadSize === "number"
        ? data.minDownloadSize
        : defaultSettings.minDownloadSize,
    filterMode:
      data.filterMode === "blocklist" || data.filterMode === "allowlist"
        ? data.filterMode
        : defaultSettings.filterMode,
    blockList: Array.isArray(data.blockList)
      ? data.blockList
      : defaultSettings.blockList,
    allowList: Array.isArray(data.allowList)
      ? data.allowList
      : defaultSettings.allowList,
    disallowedExtensions: Array.isArray(data.disallowedExtensions)
      ? data.disallowedExtensions
      : defaultSettings.disallowedExtensions,
    persistentHeaders: Array.isArray(data.persistentHeaders)
      ? data.persistentHeaders
      : defaultSettings.persistentHeaders,
    downloadDirectory:
      typeof data.downloadDirectory === "string"
        ? data.downloadDirectory
        : defaultSettings.downloadDirectory,
    organizeByDomain:
      typeof data.organizeByDomain === "boolean"
        ? data.organizeByDomain
        : defaultSettings.organizeByDomain,
    organizeByDate:
      typeof data.organizeByDate === "boolean"
        ? data.organizeByDate
        : defaultSettings.organizeByDate,
  };
}
