<script>
    import {
        createDebouncedValidator,
        formatScript,
        testScript,
        validateScriptSyntax,
    } from "../../../lib/advanced/validator.js";

    // Props
    let { script = $bindable("") } = $props();

    // Local state
    let syntaxErrors = $state([]);
    let isValidating = $state(false);
    let testResult = $state(null);
    let isTesting = $state(false);
    // Derived state
    const isScriptValid = $derived(script.trim() && syntaxErrors.length === 0);
    const hasScript = $derived(script.trim().length > 0);

    // Create debounced validator
    const debouncedValidate = createDebouncedValidator((scriptContent) => {
        isValidating = true;
        syntaxErrors = validateScriptSyntax(scriptContent);
        isValidating = false;
    }, 500);

    async function handleTestScript() {
        if (!isScriptValid) return;

        isTesting = true;
        testResult = null;

        try {
            const result = await testScript(script);
            testResult = result;
        } catch (error) {
            testResult = {
                success: false,
                error: error.message,
            };
        }

        isTesting = false;
    }

    function handleFormatScript() {
        if (!hasScript) return;
        const formatted = formatScript(script);
        script = formatted;
    }

    function handleClearScript() {
        if (
            confirm("Are you sure you want to clear the custom filter script?")
        ) {
            script = "";
            testResult = null;
            syntaxErrors = [];
        }
    }

    // Auto-validate when script changes and clear test result
    $effect(() => {
        if (script.trim()) {
            const cleanup = debouncedValidate(script);
            testResult = null;
            return cleanup;
        } else {
            syntaxErrors = [];
            testResult = null;
            isValidating = false;
        }
    });
</script>

<div
    class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
>
    <!-- Header with status -->
    <div class="flex items-center justify-between mb-4">
        <label
            for="customFilter"
            class="block text-lg font-medium text-gray-800 dark:text-white"
        >
            ⚙️ Your <code class="text-sm">filter</code> function:
        </label>
        <div class="flex items-center space-x-3">
            {#if isValidating}
                <div
                    class="text-sm text-blue-600 dark:text-blue-400 animate-pulse flex items-center space-x-1"
                >
                    <div
                        class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    ></div>
                    <span>Validating...</span>
                </div>
            {:else if isScriptValid}
                <div
                    class="text-sm text-green-600 dark:text-green-400 flex items-center space-x-1"
                >
                    <span>✅</span>
                    <span>Valid</span>
                </div>
            {:else if hasScript && syntaxErrors.length > 0}
                <div
                    class="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
                >
                    <span>❌</span>
                    <span>Invalid</span>
                </div>
            {/if}
        </div>
    </div>

    <!-- Action buttons -->
    {#if hasScript}
        <div class="flex items-center space-x-2 mb-4">
            <button
                onclick={handleFormatScript}
                class="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors duration-200"
            >
                ✨ Format Code
            </button>
            <button
                onclick={handleClearScript}
                class="px-3 py-1 text-sm rounded-md bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition-colors duration-200"
            >
                🗑️ Clear
            </button>
        </div>
    {/if}

    <!-- Code textarea -->
    <textarea
        id="customFilter"
        bind:value={script}
        rows="16"
        spellcheck="false"
        class="w-full font-mono text-sm p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
        placeholder={`function filter(download) {
  // Your custom logic here
  // Example: Skip files smaller than 1MB
  if (download.fileSize < 1024 * 1024) {
    return { skip: true };
  }

  // Allow the download with optional modifications
  return {
    skip: false,
    // filename: 'new-name.ext',  // optional
    // dir: 'subfolder'           // optional
  };
}`}
    ></textarea>

    <!-- Error Display -->
    {#if syntaxErrors.length > 0}
        <div
            class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md"
        >
            <h4
                class="text-sm font-medium text-red-800 dark:text-red-300 mb-2 flex items-center space-x-1"
            >
                <span>❌</span>
                <span>Script Errors:</span>
            </h4>
            <ul class="text-sm text-red-700 dark:text-red-400 space-y-1">
                {#each syntaxErrors as error}
                    <li class="flex items-start space-x-2">
                        <span class="text-red-500 mt-0.5">•</span>
                        <span>{error}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <!-- Test Script Section -->
    {#if isScriptValid}
        <div class="mt-4 space-y-3">
            <button
                onclick={handleTestScript}
                disabled={isTesting}
                class="w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm flex items-center justify-center space-x-2"
            >
                {#if isTesting}
                    <div
                        class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    ></div>
                    <span>Testing Script...</span>
                {:else}
                    <span>🧪</span>
                    <span>Test Script with Sample Data</span>
                {/if}
            </button>

            <!-- Test Results -->
            {#if testResult}
                <div
                    class="p-4 border rounded-lg {testResult.success
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}"
                >
                    <div class="flex items-center space-x-2 mb-3">
                        {#if testResult.success}
                            <span class="text-green-600 dark:text-green-400"
                                >✅</span
                            >
                            <h4
                                class="text-sm font-medium text-green-800 dark:text-green-300"
                            >
                                Test Successful
                            </h4>
                        {:else}
                            <span class="text-red-600 dark:text-red-400"
                                >❌</span
                            >
                            <h4
                                class="text-sm font-medium text-red-800 dark:text-red-300"
                            >
                                Test Failed
                            </h4>
                        {/if}
                    </div>

                    {#if testResult.success}
                        <div class="space-y-2">
                            <p
                                class="text-sm font-medium text-green-700 dark:text-green-400"
                            >
                                Return value:
                            </p>
                            <pre
                                class="text-xs bg-green-100 dark:bg-green-800/30 p-3 rounded border font-mono overflow-x-auto">{JSON.stringify(
                                    testResult.result,
                                    null,
                                    2,
                                )}</pre>

                            <div
                                class="text-xs text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-800/20 p-2 rounded"
                            >
                                <p><strong>What this means:</strong></p>
                                <ul class="mt-1 space-y-1">
                                    <li>
                                        • Download will {testResult.result.skip
                                            ? "be skipped"
                                            : "proceed to Aria2"}
                                    </li>
                                    {#if testResult.result.filename}
                                        <li>
                                            • Filename will be changed to: <code
                                                >{testResult.result
                                                    .filename}</code
                                            >
                                        </li>
                                    {/if}
                                    {#if testResult.result.dir}
                                        <li>
                                            • Will be saved in subdirectory: <code
                                                >{testResult.result.dir}</code
                                            >
                                        </li>
                                    {/if}
                                </ul>
                            </div>
                        </div>
                    {:else}
                        <div class="text-sm text-red-700 dark:text-red-400">
                            <p><strong>Error:</strong> {testResult.error}</p>
                            <div
                                class="mt-2 text-xs bg-red-100/50 dark:bg-red-800/20 p-2 rounded"
                            >
                                <p><strong>Common issues:</strong></p>
                                <ul class="mt-1 space-y-1">
                                    <li>• Missing return statement</li>
                                    <li>• Return value is not an object</li>
                                    <li>• Missing required 'skip' property</li>
                                    <li>• JavaScript syntax error</li>
                                </ul>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}

    <!-- Footer info -->
    <div
        class="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
    >
        <div class="flex items-center space-x-4">
            <span>{script.length} characters</span>
            {#if hasScript}
                <span>{script.split("\n").length} lines</span>
            {/if}
        </div>
        <div class="flex items-center space-x-1">
            <span>💡</span>
            <span>Use examples above or check the documentation panel</span>
        </div>
    </div>
</div>
