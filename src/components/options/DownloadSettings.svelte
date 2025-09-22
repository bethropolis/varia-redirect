<script>
    import { settings } from "../../stores.js";

    // Helper component for the toggle switches
    import Toggle from "../common/Toggle.svelte";
</script>

<div class="space-y-8">
    <!-- Base Download Directory -->
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Download Directory
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <label
                for="downloadDir"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
                Base Download Path
            </label>
            <input
                type="text"
                id="downloadDir"
                bind:value={$settings.downloadDirectory}
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-mono"
                placeholder="/path/to/your/downloads"
            />
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Provide an absolute path. If left empty, the default directory
                set in Aria2 will be used.
            </p>
        </div>
    </section>

    <!-- Automatic Subfolder Organization -->
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Automatic Subfolders
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4"
        >
            <!-- Organize by Domain -->
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-200">
                        Organize by domain name
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Saves files into a subfolder named after the website
                        (e.g., <code>/downloads/example.com/</code>).
                    </p>
                </div>
                <Toggle bind:checked={$settings.organizeByDomain} />
            </div>

            <hr class="border-gray-200 dark:border-gray-700" />

            <!-- Organize by Date -->
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-200">
                        Organize by date
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Saves files into a subfolder with the current date
                        (e.g., <code>/downloads/2025-09-22/</code>).
                    </p>
                </div>
                <Toggle bind:checked={$settings.organizeByDate} />
            </div>
        </div>
    </section>
</div>
