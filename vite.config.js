import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
  const manifest = readJsonFile("src/manifest.json");
  const pkg = readJsonFile("package.json");
  return {
    name: pkg.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const browser = env.VITE_BROWSER || "firefox";
  const rawStart = env.VITE_START_URL || "";
  const startUrls = rawStart
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return {
    plugins: [
      svelte(),
      tailwindcss(),
      ...(env.VITE_WEB_EXTENSION !== "false"
        ? [
            webExtension({
              browser: browser,
              manifest: generateManifest,
              watchFilePaths: ["package.json", "src/manifest.json"],
              ...(mode === "development" && startUrls.length > 0
                ? {
                    webExtConfig: {
                      startUrl: startUrls,
                    },
                  }
                : {}),
            }),
          ]
        : []),
    ],
    ...(env.VITE_WEB_EXTENSION === "false"
      ? {
          server: {
            open: true,
          },
          build: {
            rollupOptions: {
              input: "index.html",
            },
          },
        }
      : {}),
  };
});
