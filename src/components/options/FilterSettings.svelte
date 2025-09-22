<script>
    import { settings } from "../../stores.js";

    let listAsText = $state("");

    $effect(() => {
        if ($settings.filterMode === "blocklist") {
            listAsText = $settings.blockList.join("\n");
        } else {
            listAsText = $settings.allowList.join("\n");
        }
    });

    function updateListFromText() {
        const domains = listAsText
            .split("\n")
            .map((d) => d.trim())
            .filter((d) => d);

        if ($settings.filterMode === "blocklist") {
            settings.update((s) => ({ ...s, blockList: domains }));
        } else {
            settings.update((s) => ({ ...s, allowList: domains }));
        }
    }
</script>

<div class="space-y-8">
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Website Filter Mode
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div class="space-y-3">
                <label
                    class="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                    <input
                        type="radio"
                        bind:group={$settings.filterMode}
                        value="blocklist"
                        class="mt-1 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <span class="flex flex-col">
                        <span class="font-medium">Blocklist Mode</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400"
                            >Skip downloads from specified sites.</span
                        >
                    </span>
                </label>
                <label
                    class="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                >
                    <input
                        type="radio"
                        bind:group={$settings.filterMode}
                        value="allowlist"
                        class="mt-1 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-600"
                    />
                    <span class="flex flex-col">
                        <span class="font-medium">Allowlist Mode</span>
                        <span class="text-sm text-gray-500 dark:text-gray-400"
                            >Only allow downloads from specified sites.</span
                        >
                    </span>
                </label>
            </div>
        </div>
    </section>

    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {$settings.filterMode === "blocklist"
                ? "Blocked Domains"
                : "Allowed Domains"}
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter one domain per line. For example: <code>example.com</code>
            </p>
            <textarea
                bind:value={listAsText}
                on:input={updateListFromText}
                rows="10"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono text-sm"
                placeholder="one.domain.com&#10;another.domain.net"
            ></textarea>
        </div>
    </section>
</div>
