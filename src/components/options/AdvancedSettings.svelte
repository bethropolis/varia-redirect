<script>
    import { settings } from "../../stores.js";
    import CodeEditor from "./advanced/CodeEditor.svelte";
    import DocumentationPanel from "./advanced/DocumentationPanel.svelte";
    import ScriptExamples from "./advanced/ScriptExamples.svelte";

    // State management
    let showExamples = $state(false);

    // Event handlers
    function handleUseExample(code) {
        $settings.customFilterScript = code;
        showExamples = false;
    }
</script>

<div class="space-y-8">
    <section>
        <!-- Header with controls -->
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
                Custom JavaScript Filter
            </h2>
            <div class="flex items-center space-x-2">
                <button
                    onclick={() => (showExamples = !showExamples)}
                    class="px-3 py-1 text-sm rounded-md bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition-colors duration-200"
                >
                    {showExamples ? "Hide Examples" : "Show Examples"}
                </button>
                {#if $settings.customFilterScript.trim()}
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                        {$settings.customFilterScript.length} chars
                    </span>
                {/if}
            </div>
        </div>

        <!-- Warning Banner -->
        <div
            class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 text-yellow-800 dark:text-yellow-200 mb-6"
        >
            <h3 class="font-bold flex items-center space-x-2">
                <span>⚠️</span>
                <span>Advanced Feature</span>
            </h3>
            <p class="text-sm mt-1">
                Code entered here is executed for every download. Incorrect code
                may cause downloads to fail or be miscategorized.
                <strong>Test your code carefully before enabling.</strong>
            </p>
        </div>

        <!-- Examples Section -->
        <ScriptExamples bind:showExamples onUseExample={handleUseExample} />

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Documentation Panel -->
            <DocumentationPanel />

            <!-- Code Editor -->
            <CodeEditor bind:script={$settings.customFilterScript} />
        </div>

        <!-- Quick Tips -->
        <div
            class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
        >
            <h4
                class="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center space-x-2"
            >
                <span>💡</span>
                <span>Quick Tips</span>
            </h4>
            <ul class="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li class="flex items-start space-x-2">
                    <span class="text-blue-500 mt-0.5">•</span>
                    <span
                        >Use <code
                            class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs"
                            >console.log()</code
                        > to debug - check browser DevTools console</span
                    >
                </li>
                <li class="flex items-start space-x-2">
                    <span class="text-blue-500 mt-0.5">•</span>
                    <span
                        >The script runs for every download, so keep it
                        efficient</span
                    >
                </li>
                <li class="flex items-start space-x-2">
                    <span class="text-blue-500 mt-0.5">•</span>
                    <span
                        >Always return an object with at least the <code
                            class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs"
                            >skip</code
                        > property</span
                    >
                </li>
                <li class="flex items-start space-x-2">
                    <span class="text-blue-500 mt-0.5">•</span>
                    <span
                        >Use <code
                            class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs"
                            >new URL(download.url)</code
                        > to parse URLs safely</span
                    >
                </li>
                <li class="flex items-start space-x-2">
                    <span class="text-blue-500 mt-0.5">•</span>
                    <span
                        >File paths are relative to your download directory
                        setting</span
                    >
                </li>
            </ul>
        </div>
    </section>
</div>
