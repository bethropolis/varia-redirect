<script>
import { examples } from "../../../lib/advanced/examples.js";

// Props
let { showExamples = $bindable(false), onUseExample = () => {} } = $props();

// Local state
let activeExample = $state(0);

function useExample(index) {
	onUseExample(examples[index].code);
}
</script>

{#if showExamples}
    <div class="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-800 dark:text-white">
                📚 Example Scripts
            </h3>
            <button
                onclick={() => showExamples = false}
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                title="Hide examples"
            >
                ✕
            </button>
        </div>

        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Click on an example below to see its code, then use "Apply Example" to load it into your editor.
        </p>

        <!-- Example Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {#each examples as example, index}
                <button
                    onclick={() => activeExample = index}
                    class="text-left p-4 rounded-lg border transition-all duration-200 hover:shadow-md {activeExample === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
                >
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0 mt-1">
                            <div class="w-2 h-2 rounded-full {activeExample === index
                                ? 'bg-blue-500'
                                : 'bg-gray-300 dark:bg-gray-600'}">
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium text-gray-800 dark:text-white text-sm">
                                {example.title}
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {example.description}
                            </div>
                        </div>
                    </div>
                </button>
            {/each}
        </div>

        <!-- Selected Example Display -->
        {#if activeExample !== null && examples[activeExample]}
            <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                <div class="flex items-center justify-between mb-3">
                    <div>
                        <h4 class="font-medium text-gray-800 dark:text-white">
                            {examples[activeExample].title}
                        </h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {examples[activeExample].description}
                        </p>
                    </div>
                    <button
                        onclick={() => useExample(activeExample)}
                        class="px-4 py-2 text-sm rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm"
                    >
                        Apply Example
                    </button>
                </div>

                <!-- Code Preview -->
                <div class="relative">
                    <pre class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-xs font-mono overflow-x-auto border"><code>{examples[activeExample].code}</code></pre>
                    <div class="absolute top-2 right-2">
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                            JavaScript
                        </span>
                    </div>
                </div>

                <!-- Usage Note -->
                <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p class="text-xs text-blue-700 dark:text-blue-400">
                        💡 <strong>Tip:</strong> You can modify this example after applying it to suit your specific needs.
                        All examples are fully functional and ready to use.
                    </p>
                </div>
            </div>
        {/if}
    </div>
{/if}

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
