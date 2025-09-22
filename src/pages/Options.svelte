<script>
    import { onMount } from "svelte"
    import {
        addToList,
        removeFromList,
        settings,
        testAria2Connection,
    } from "../stores.js";

    /**
     * @typedef {'unknown' | 'success' | 'failure'} ConnectionStatus
     * @typedef {'blocklist' | 'allowlist'} FilterMode
     * @typedef {{key: string, value: string}} Header
     */

    // Form input state using Svelte 5's state runes
    let newBlockListItem = $state("");
    let newAllowListItem = $state("");
    let newDisallowedExtension = $state("");
    let newHeaderKey = $state("");
    let newHeaderValue = $state("");

    // Connection test state
    /** @type {ConnectionStatus} */
    let connectionStatus = $state("unknown");
    let isTestingConnection = $state(false);

    // Theme handling - derived state automatically updates when settings.theme changes
    const isDarkMode = $derived($settings.theme === "dark");

    // This effect runs whenever isDarkMode changes
    $effect(() => {
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", isDarkMode);
        }
        // Ensure theme is applied when the component first loads
        document.documentElement.classList.toggle(
            "dark",
            $settings.theme === "dark",
        );
    });

    /**
     * Toggle between light and dark theme
     */
    function toggleTheme() {
        settings.update((s) => ({
            ...s,
            theme: s.theme === "light" ? "dark" : "light",
        }));
    }

    /**
     * Add item to block list
     */
    function addBlockListItem() {
        if (newBlockListItem.trim()) {
            addToList("blockList", newBlockListItem.trim());
            newBlockListItem = "";
        }
    }

    /**
     * Add item to allow list
     */
    function addAllowListItem() {
        if (newAllowListItem.trim()) {
            addToList("allowList", newAllowListItem.trim());
            newAllowListItem = "";
        }
    }

    /**
     * Add file extension to disallowed list
     */
    function addExtension() {
        if (newDisallowedExtension.trim()) {
            let ext = newDisallowedExtension.trim();
            if (!ext.startsWith(".")) ext = "." + ext;
            addToList("disallowedExtensions", ext);
            newDisallowedExtension = "";
        }
    }

    /**
     * Add custom header
     */
    function addHeader() {
        if (newHeaderKey.trim() && newHeaderValue.trim()) {
            addToList("persistentHeaders", {
                key: newHeaderKey.trim(),
                value: newHeaderValue.trim(),
            });
            newHeaderKey = "";
            newHeaderValue = "";
        }
    }

    /**
     * Test Aria2 connection
     * @returns {Promise<void>}
     */
    async function testConnection() {
        if (!$settings.rpcUrl.trim()) return;

        isTestingConnection = true;
        connectionStatus = "unknown";

        try {
            const success = await testAria2Connection($settings.rpcUrl);
            connectionStatus = success ? "success" : "failure";
        } catch (error) {
            console.error("Connection test failed:", error);
            connectionStatus = "failure";
        } finally {
            isTestingConnection = false;
        }
    }

    /**
     * Handle Enter key press for form inputs
     * @param {KeyboardEvent} event
     * @param {Function} action
     */
    function handleKeyPress(event, action) {
        if (event.key === "Enter") {
            event.preventDefault();
            action();
        }
    }
</script>

<main
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
>
    <div class="container mx-auto max-w-6xl px-4 py-8">
        <!-- Header -->
        <header class="mb-8 text-center">
            <div class="flex items-center justify-center mb-4">
                <div
                    class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mr-4"
                >
                    <svg
                        class="w-8 h-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                        />
                    </svg>
                </div>
                <div>
                    <h1
                        class="text-4xl font-bold text-gray-800 dark:text-white"
                    >
                        Varia Redirect
                    </h1>
                    <p class="text-lg text-gray-600 dark:text-gray-300">
                        Download Management Settings
                    </p>
                </div>
            </div>

            <!-- Theme Toggle -->
            <div class="flex justify-center mb-6">
                <button
                    onclick={toggleTheme}
                    class="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                    <span
                        class="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {isDarkMode ? "🌙 Dark" : "☀️ Light"} Mode
                    </span>
                </button>
            </div>
        </header>

        <div class="grid lg:grid-cols-2 gap-8">
            <!-- Left Column -->
            <div class="space-y-6">
                <!-- Connection Settings -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                    >
                        <div class="flex items-center">
                            <div
                                class="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3"
                            >
                                <svg
                                    class="w-5 h-5 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                                    />
                                </svg>
                            </div>
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-white"
                            >
                                Aria2 Connection
                            </h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label
                                for="rpcUrl"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                RPC Server URL
                            </label>
                            <input
                                type="url"
                                id="rpcUrl"
                                bind:value={$settings.rpcUrl}
                                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="http://localhost:6801/jsonrpc"
                            />
                        </div>

                        <div class="flex items-center gap-3 mt-4">
                            <button
                                onclick={testConnection}
                                disabled={isTestingConnection ||
                                    !$settings.rpcUrl.trim()}
                                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm"
                            >
                                {#if isTestingConnection}
                                    <svg
                                        class="animate-spin w-4 h-4 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            class="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            stroke-width="4"
                                        ></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Testing...
                                {:else}
                                    Test Connection
                                {/if}
                            </button>

                            {#if connectionStatus === "success"}
                                <div
                                    class="flex items-center text-green-600 dark:text-green-400 text-sm font-medium"
                                >
                                    <svg
                                        class="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Connected Successfully!
                                </div>
                            {:else if connectionStatus === "failure"}
                                <div
                                    class="flex items-center text-red-600 dark:text-red-400 text-sm font-medium"
                                >
                                    <svg
                                        class="w-5 h-5 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Connection Failed
                                </div>
                            {/if}
                        </div>
                    </div>
                </section>

                <!-- Filtering Rules -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                    >
                        <div class="flex items-center">
                            <div
                                class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3"
                            >
                                <svg
                                    class="w-5 h-5 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                            </div>
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-white"
                            >
                                Filtering Rules
                            </h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <div class="mb-4">
                            <label
                                for="minSize"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Minimum Download Size (MiB)
                            </label>
                            <input
                                type="number"
                                id="minSize"
                                bind:value={$settings.minDownloadSize}
                                class="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                min="0"
                                step="0.1"
                            />
                            <p
                                class="text-xs text-gray-500 dark:text-gray-400 mt-1"
                            >
                                Files smaller than this will use the browser's
                                default downloader.
                            </p>
                        </div>

                        <div class="mb-4">
                            <span
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >Website Filter Mode</span
                            >
                            <div class="space-y-3">
                                <label
                                    class="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <input
                                        type="radio"
                                        bind:group={$settings.filterMode}
                                        value="blocklist"
                                        class="mt-1 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                                    />
                                    <span class="flex flex-col">
                                        <span class="font-medium"
                                            >Blocklist Mode</span
                                        >
                                        <span
                                            class="text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            Block downloads from specified
                                            sites.
                                        </span>
                                    </span>
                                </label>
                                <label
                                    class="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    <input
                                        type="radio"
                                        bind:group={$settings.filterMode}
                                        value="allowlist"
                                        class="mt-1 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                                    />
                                    <span class="flex flex-col">
                                        <span class="font-medium"
                                            >Allowlist Mode</span
                                        >
                                        <span
                                            class="text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            Only allow downloads from specified
                                            sites.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- File Extensions -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                    >
                        <div class="flex items-center">
                            <div
                                class="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3"
                            >
                                <svg
                                    class="w-5 h-5 text-orange-600 dark:text-orange-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-white"
                            >
                                Disallowed File Extensions
                            </h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <p
                            class="text-xs text-gray-500 dark:text-gray-400 mb-4"
                        >
                            Files with these extensions will not be redirected
                            to Aria2.
                        </p>

                        <div class="flex gap-2 mb-4">
                            <input
                                type="text"
                                bind:value={newDisallowedExtension}
                                onkeypress={(e) =>
                                    handleKeyPress(e, addExtension)}
                                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="e.g., .txt, .jpg, exe"
                            />
                            <button
                                onclick={addExtension}
                                class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                            >
                                Add Extension
                            </button>
                        </div>

                        <div class="flex flex-wrap gap-2">
                            {#each $settings.disallowedExtensions as ext}
                                <div
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                >
                                    <span>{ext}</span>
                                    <button
                                        onclick={() =>
                                            removeFromList(
                                                "disallowedExtensions",
                                                ext,
                                            )}
                                        class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-lg leading-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            {/each}
                            {#if !$settings.disallowedExtensions || $settings.disallowedExtensions.length === 0}
                                <p
                                    class="text-gray-500 dark:text-gray-400 text-sm italic"
                                >
                                    No extensions blocked.
                                </p>
                            {/if}
                        </div>
                    </div>
                </section>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
                <!-- Website Lists -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                    >
                        <div class="flex items-center">
                            <div
                                class="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3"
                            >
                                <svg
                                    class="w-5 h-5 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9V3"
                                    />
                                </svg>
                            </div>
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-white"
                            >
                                {$settings.filterMode === "blocklist"
                                    ? "Blocked"
                                    : "Allowed"} Websites
                            </h2>
                        </div>
                    </div>
                    <div class="p-6">
                        {#if $settings.filterMode === "blocklist"}
                            <p
                                class="text-xs text-gray-500 dark:text-gray-400 mb-4"
                            >
                                Downloads from these domains will NOT be
                                redirected to Aria2.
                            </p>

                            <div class="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    bind:value={newBlockListItem}
                                    onkeypress={(e) =>
                                        handleKeyPress(e, addBlockListItem)}
                                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="e.g., example.com"
                                />
                                <button
                                    onclick={addBlockListItem}
                                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                                >
                                    Add Domain
                                </button>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                {#each $settings.blockList as site}
                                    <div
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                    >
                                        <span>{site}</span>
                                        <button
                                            onclick={() =>
                                                removeFromList(
                                                    "blockList",
                                                    site,
                                                )}
                                            class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                {/each}
                                {#if !$settings.blockList || $settings.blockList.length === 0}
                                    <p
                                        class="text-gray-500 dark:text-gray-400 text-sm italic"
                                    >
                                        No domains blocked.
                                    </p>
                                {/if}
                            </div>
                        {:else}
                            <p
                                class="text-xs text-gray-500 dark:text-gray-400 mb-4"
                            >
                                ONLY downloads from these domains will be
                                redirected to Aria2.
                            </p>

                            <div class="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    bind:value={newAllowListItem}
                                    onkeypress={(e) =>
                                        handleKeyPress(e, addAllowListItem)}
                                    class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="e.g., github.com"
                                />
                                <button
                                    onclick={addAllowListItem}
                                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                                >
                                    Add Domain
                                </button>
                            </div>

                            <div class="flex flex-wrap gap-2">
                                {#each $settings.allowList as site}
                                    <div
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    >
                                        <span>{site}</span>
                                        <button
                                            onclick={() =>
                                                removeFromList(
                                                    "allowList",
                                                    site,
                                                )}
                                            class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                {/each}
                                {#if !$settings.allowList || $settings.allowList.length === 0}
                                    <p
                                        class="text-gray-500 dark:text-gray-400 text-sm italic"
                                    >
                                        No domains allowed.
                                    </p>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </section>

                <!-- Persistent Headers -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                    <div
                        class="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
                    >
                        <div class="flex items-center">
                            <div
                                class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3"
                            >
                                <svg
                                    class="w-5 h-5 text-indigo-600 dark:text-indigo-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h2
                                class="text-xl font-semibold text-gray-800 dark:text-white"
                            >
                                Persistent Headers
                            </h2>
                        </div>
                    </div>
                    <div class="p-6">
                        <p
                            class="text-xs text-gray-500 dark:text-gray-400 mb-4"
                        >
                            These HTTP headers will be added to all download
                            requests.
                        </p>

                        <div class="grid grid-cols-2 gap-2 mb-4">
                            <input
                                type="text"
                                bind:value={newHeaderKey}
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Header Name (e.g., User-Agent)"
                            />
                            <input
                                type="text"
                                bind:value={newHeaderValue}
                                onkeypress={(e) => handleKeyPress(e, addHeader)}
                                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="Header Value"
                            />
                        </div>
                        <button
                            onclick={addHeader}
                            class="w-full mb-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                        >
                            Add Header
                        </button>

                        <div class="space-y-2">
                            {#each $settings.persistentHeaders as header}
                                <div
                                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                                >
                                    <div class="flex-1 overflow-hidden">
                                        <p
                                            class="font-mono text-sm font-medium text-gray-800 dark:text-gray-200 truncate"
                                        >
                                            {header.key}:
                                            <span
                                                class="font-normal text-gray-600 dark:text-gray-400"
                                                >{header.value}</span
                                            >
                                        </p>
                                    </div>
                                    <button
                                        onclick={() =>
                                            removeFromList(
                                                "persistentHeaders",
                                                header,
                                            )}
                                        class="ml-4 text-gray-400 hover:text-red-500 font-bold text-lg"
                                    >
                                        ×
                                    </button>
                                </div>
                            {/each}
                            {#if !$settings.persistentHeaders || $settings.persistentHeaders.length === 0}
                                <p
                                    class="text-gray-500 dark:text-gray-400 text-sm italic"
                                >
                                    No persistent headers defined.
                                </p>
                            {/if}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</main>
