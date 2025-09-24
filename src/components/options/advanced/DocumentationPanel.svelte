<script>
// No props needed - this is purely informational content
</script>

<div class="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 text-sm">
    <h3 class="text-lg font-medium text-gray-800 dark:text-white">
        📖 How it Works
    </h3>

    <div class="space-y-4">
        <p>
            Write a JavaScript function named <code
                class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                >filter</code
            > that processes download information.
        </p>

        <div>
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📥 Input - <code>download</code> object:
            </h4>
            <pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs font-mono overflow-x-auto border"><code>{`{
  "url": "https://example.com/file.pdf",
  "filename": "document.pdf",
  "fileSize": 1048576,
  "mime": "application/pdf",
  "referrer": "https://example.com/page"
}`}</code></pre>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                The download object contains information about the file being downloaded.
            </p>
        </div>

        <div>
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                📤 Output - Your function must return:
            </h4>
            <pre class="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-xs font-mono overflow-x-auto border"><code>{`{
  "skip": false,           // required boolean
  "filename": "new.pdf",   // optional string
  "dir": "Documents"       // optional string
}`}</code></pre>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Your function must always return an object with at least the <code>skip</code> property.
            </p>
        </div>

        <div>
            <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                🔧 Properties:
            </h4>
            <div class="space-y-2">
                <div class="flex items-start space-x-2">
                    <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-shrink-0">skip</code>
                    <span class="text-xs">
                        <strong>Required boolean.</strong> Set to <code>true</code> to prevent the download from being redirected to Aria2.
                    </span>
                </div>
                <div class="flex items-start space-x-2">
                    <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-shrink-0">filename</code>
                    <span class="text-xs">
                        <strong>Optional string.</strong> Override the original filename. Include the file extension.
                    </span>
                </div>
                <div class="flex items-start space-x-2">
                    <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded flex-shrink-0">dir</code>
                    <span class="text-xs">
                        <strong>Optional string.</strong> Specify a subdirectory path relative to your download directory.
                    </span>
                </div>
            </div>
        </div>

        <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 class="font-medium text-gray-700 dark:text-gray-300 text-xs mb-2">💡 Usage Examples:</h5>
            <ul class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Return <code>{"{ skip: true }"}</code> to ignore small files</li>
                <li>• Return <code>{"{ skip: false, dir: 'Images' }"}</code> to organize by type</li>
                <li>• Return <code>{"{ skip: false, filename: 'renamed.pdf' }"}</code> to rename files</li>
                <li>• Combine properties: <code>{"{ skip: false, dir: 'Work', filename: 'report.pdf' }"}</code></li>
            </ul>
        </div>
    </div>
</div>
