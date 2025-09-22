<script>
    import { addToList, removeFromList, settings } from "../../stores.js";

    let newHeaderKey = $state("");
    let newHeaderValue = $state("");

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
</script>

<div class="space-y-8">
    <section>
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Persistent Headers
        </h2>
        <div
            class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                These HTTP headers will be added to all download requests sent
                to Aria2.
            </p>

            <!-- Add Header Form -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
                <input
                    type="text"
                    bind:value={newHeaderKey}
                    class="md:col-span-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Header Name (e.g., User-Agent)"
                />
                <input
                    type="text"
                    bind:value={newHeaderValue}
                    onkeydown={(e) => e.key === "Enter" && addHeader()}
                    class="md:col-span-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Header Value"
                />
                <button
                    onclick={addHeader}
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 focus:ring-gray-500"
                    >Add Header</button
                >
            </div>

            <!-- Headers Table -->
            <div class="overflow-x-auto">
                <table
                    class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                >
                    <thead class="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >Header Key</th
                            >
                            <th
                                scope="col"
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                >Header Value</th
                            >
                            <th scope="col" class="relative px-6 py-3">
                                <span class="sr-only">Remove</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody
                        class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"
                    >
                        {#each $settings.persistentHeaders as header}
                            <tr>
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-gray-200"
                                    >{header.key}</td
                                >
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400"
                                    >{header.value}</td
                                >
                                <td
                                    class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                >
                                    <button
                                        onclick={() =>
                                            removeFromList(
                                                "persistentHeaders",
                                                header,
                                            )}
                                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                        >Remove</button
                                    >
                                </td>
                            </tr>
                        {/each}
                        {#if !$settings.persistentHeaders || $settings.persistentHeaders.length === 0}
                            <tr>
                                <td
                                    colspan="3"
                                    class="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    No persistent headers defined.
                                </td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</div>
