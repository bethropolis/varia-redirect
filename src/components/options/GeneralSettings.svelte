<script>
    import {
        addToList,
        removeFromList,
        settings,
        testAria2Connection,
    } from "../../stores.js";

    let connectionStatus = $state("unknown");
    let isTestingConnection = $state(false);
    let newDisallowedExtension = $state("");

    async function testConnection() {
        if (!$settings.rpcUrl.trim()) return;
        isTestingConnection = true;
        connectionStatus = "unknown";
        const success = await testAria2Connection($settings.rpcUrl);
        connectionStatus = success ? "success" : "failure";
        isTestingConnection = false;
    }

    function addExtension() {
        if (newDisallowedExtension.trim()) {
            let ext = newDisallowedExtension.trim();
            if (!ext.startsWith(".")) ext = "." + ext;
            addToList("disallowedExtensions", ext);
            newDisallowedExtension = "";
        }
    }
</script>

<div class="space-y-8">
    <!-- Connection Settings -->
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Aria2 Connection
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
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
            <div class="flex items-center gap-3 mt-4">
                <button
                    onclick={testConnection}
                    disabled={isTestingConnection || !$settings.rpcUrl.trim()}
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm"
                >
                    {#if isTestingConnection}
                        Testing...
                    {:else}
                        Test Connection
                    {/if}
                </button>
                {#if connectionStatus === "success"}
                    <span
                        class="text-sm font-medium text-green-600 dark:text-green-400"
                        >Connected!</span
                    >
                {:else if connectionStatus === "failure"}
                    <span
                        class="text-sm font-medium text-red-600 dark:text-red-400"
                        >Connection Failed</span
                    >
                {/if}
            </div>
        </div>
    </section>

    <!-- Disallowed Extensions -->
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Disallowed File Extensions
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Files with these extensions will not be redirected.
            </p>
            <div class="flex gap-2 mb-4">
                <input
                    type="text"
                    bind:value={newDisallowedExtension}
                    onkeydown={(e) => e.key === "Enter" && addExtension()}
                    class="flex-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="e.g., .txt, .jpg, exe"
                />
                <button
                    onclick={addExtension}
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                    >Add</button
                >
            </div>
            <div class="flex flex-wrap gap-2">
                {#each $settings.disallowedExtensions as ext}
                    <div
                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                    >
                        <span>{ext}</span>
                        <button
                            onclick={() =>
                                removeFromList("disallowedExtensions", ext)}
                            class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold text-lg leading-none"
                            >×</button
                        >
                    </div>
                {/each}
            </div>
        </div>
    </section>
</div>
