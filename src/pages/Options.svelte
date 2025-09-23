<script>
    import Github from "../components/common/github.svelte";
    import DownloadSettings from "../components/options/DownloadSettings.svelte";
    import FilterSettings from "../components/options/FilterSettings.svelte";
    import GeneralSettings from "../components/options/GeneralSettings.svelte";
    import HeaderSettings from "../components/options/HeaderSettings.svelte";

    import { settings } from "../stores.js";

    let activeTab = $state("general"); // 'general', 'filters', 'headers'

    const isDarkMode = $derived($settings.theme === "dark");

    $effect(() => {
        document.documentElement.classList.toggle("dark", isDarkMode);
    });

    function toggleTheme() {
        settings.update((s) => ({
            ...s,
            theme: s.theme === "light" ? "dark" : "light",
        }));
    }

    const navItems = [
        { id: "general", label: "General" },
        { id: "downloads", label: "Downloads" },
        { id: "filters", label: "Filters" },
        { id: "headers", label: "Headers" },
    ];

    function changeActiveTab(tabId) {
        activeTab = tabId;
    }
</script>

<div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
>
    <div class="flex">
        <!-- Sidebar Navigation -->
        <aside
            class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 min-h-screen"
        >
            <div class="flex items-center mb-8">
                <img
                    src="/icon/icon-disconected-32.png"
                    alt="Varia Redirect"
                    class="w-8 h-8 rounded-lg shadow-md mr-3"
                />
                <h1 class="text-xl font-bold">Varia Redirect</h1>
            </div>

            <nav class="space-y-2">
                {#each navItems as item}
                    <button
                        onclick={() => changeActiveTab(item.id)}
                        class="w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 {activeTab ===
                        item.id
                            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'}"
                    >
                        <span>{item.label}</span>
                    </button>
                {/each}
            </nav>

            <div class="absolute bottom-4 left-4">
                <button
                    onclick={toggleTheme}
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                    <span class="text-sm">{isDarkMode ? "🌙" : "☀️"}</span>
                    <span class="text-sm">Toggle Theme</span>
                </button>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 p-8">
            <div class="flex flex-row-reverse">
                <a
                    href="https://github.com/bethropolis/varia-redirect"
                    title="Visit the GitHub repository"
                    class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    target="_blank"
                >
                    <Github class="w-5 h-5" />
                </a>
            </div>
            {#if activeTab === "general"}
                <GeneralSettings />
            {:else if activeTab === "downloads"}
                <DownloadSettings />
            {:else if activeTab === "filters"}
                <FilterSettings />
            {:else if activeTab === "headers"}
                <HeaderSettings />
            {/if}
        </main>
    </div>
</div>
