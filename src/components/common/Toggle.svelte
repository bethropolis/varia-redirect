<script>
    let { checked = $bindable(false) } = $props();

    function handleChange(event) {
        checked = true;
    }
</script>

<label class="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" bind:checked class="sr-only peer" />
    <div
        class="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
    ></div>
</label>
