<script>
    import browser from "webextension-polyfill";
    import {
        addToList,
        sessionStore,
        settings,
        testAria2Connection,
    } from "../stores.js";

    // --- Local State for the Popup ---
    let connectionStatus = $state("unknown"); // 'unknown', 'success', 'failure'
    let currentTabDomain = $state("");

    // --- Derived State (these automatically update when their dependencies change) ---
    const isDarkMode = $derived($settings.theme === "dark");

    const isCurrentSiteOnBlocklist = $derived(
        currentTabDomain
            ? $settings.blockList.includes(currentTabDomain)
            : false,
    );

    const isCurrentSiteOnAllowlist = $derived(
        currentTabDomain
            ? $settings.allowList.includes(currentTabDomain)
            : false,
    );

    // The status message is now aware of the filter mode.
    const statusMessage = $derived.by(() => {
        if (!$settings.enabled) return "Redirect is disabled.";

        if ($settings.filterMode === "blocklist") {
            return isCurrentSiteOnBlocklist
                ? "This site is on the blocklist."
                : "Active and ready to redirect.";
        } else {
            // Allowlist mode
            return isCurrentSiteOnAllowlist
                ? "This site is on the allowlist."
                : "This site is NOT on the allowlist.";
        }
    });

    // Dynamically set the button's text, color, and disabled state based on context.
    const actionButtonText = $derived.by(() => {
        if ($settings.filterMode === "blocklist") {
            return isCurrentSiteOnBlocklist
                ? "Site is Blocked"
                : "Block Current Site";
        } else {
            // Allowlist mode
            return isCurrentSiteOnAllowlist
                ? "Site is Allowed"
                : "Allow Current Site";
        }
    });

    const actionButtonDisabled = $derived.by(() => {
        if (!currentTabDomain) return true;
        if ($settings.filterMode === "blocklist")
            return isCurrentSiteOnBlocklist;
        return isCurrentSiteOnAllowlist;
    });

    const actionButtonColorClass = $derived(
        $settings.filterMode === "blocklist"
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    );

    // --- onMount Lifecycle: This runs once when the popup is opened ---
    $effect(() => {
        // Connect to the background script to signal that the popup is open.
        // This is used to clear the session cookie if the popup is closed.
        browser.runtime.connect({ name: "popup" });

        document.documentElement.classList.toggle("dark", isDarkMode);
        testAria2Connection($settings.rpcUrl).then((success) => {
            connectionStatus = success ? "success" : "failure";
        });
        getCurentTab();
    });

    async function getCurentTab() {
        try {
            const tabs = await browser.tabs.query({
                active: true,
                currentWindow: true,
            });
            if (tabs[0]?.url) {
                const url = new URL(tabs[0].url);
                if (url.protocol.startsWith("http")) {
                    currentTabDomain = url.hostname;
                }
            }
        } catch (error) {
            console.error("Could not get current tab:", error);
        }
    }

    // --- Functions for User Actions ---
    function toggleTheme() {
        settings.update((s) => ({
            ...s,
            theme: s.theme === "light" ? "dark" : "light",
        }));
    }

    // This single function now handles both blocking and allowing.
    function handleSiteActionButtonClick() {
        if (!currentTabDomain) return;

        const listToUpdate =
            $settings.filterMode === "blocklist" ? "blockList" : "allowList";
        addToList(listToUpdate, currentTabDomain);
    }

    function openOptionsPage() {
        browser.runtime.openOptionsPage();
    }
</script>

<main
    class="w-80 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 transition-colors duration-300"
>
    <!-- Header: Title and Main On/Off Toggle -->
    <header class="flex justify-between items-center mb-4">
        <div class="flex items-center">
            <div
                class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md mr-3"
            >
                <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    ></path></svg
                >
            </div>
            <h1 class="text-lg font-bold">Varia Redirect</h1>
        </div>

        <label
            class="relative inline-flex items-center cursor-pointer"
            title="Enable/Disable all redirection"
        >
            <input
                type="checkbox"
                bind:checked={$settings.enabled}
                class="sr-only peer"
            />
            <div
                class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
            ></div>
        </label>
    </header>

    <!-- Status Indicator Section -->
    <section
        class="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex items-center"
    >
        <div
            class="flex-shrink-0 w-3 h-3 rounded-full mr-3
            {connectionStatus === 'success' && $settings.enabled
                ? 'bg-green-500'
                : ''}
            {connectionStatus === 'failure' && $settings.enabled
                ? 'bg-red-500'
                : ''}
            {connectionStatus === 'unknown' && $settings.enabled
                ? 'bg-yellow-400 animate-pulse'
                : ''}
            {!$settings.enabled ? 'bg-gray-400' : ''}"
            title="Aria2 Connection Status"
        ></div>
        <span>{statusMessage}</span>
    </section>

    <!-- Main Actions -->
    <section class="space-y-3">
        <button
            onclick={handleSiteActionButtonClick}
            disabled={actionButtonDisabled}
            class="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed {actionButtonColorClass}"
        >
            <!-- SVG Icon can also be dynamic if you want different icons -->
            <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path></svg
            >
            {actionButtonText}
        </button>

        <div>
            <label
                for="tempCookie"
                class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
            >
                Temporary Cookie for this session
            </label>
            <input
                type="text"
                id="tempCookie"
                bind:value={$sessionStore.tempCookie}
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="key=value; other=value2"
            />
        </div>
    </section>

    <!-- Footer: Theme and Settings Buttons -->
    <footer
        class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center"
    >
        <button
            onclick={toggleTheme}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Toggle theme"
        >
            {#if isDarkMode}
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    ></path></svg
                >
            {:else}
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    ></path></svg
                >
            {/if}
        </button>
        <button
            onclick={openOptionsPage}
            class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Open full settings"
        >
            <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                ></path><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                ></path></svg
            >
        </button>
    </footer>
</main>
