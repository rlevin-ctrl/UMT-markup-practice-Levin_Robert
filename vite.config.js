import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const isUserOrOrgSite = Boolean(repo?.endsWith(".github.io"));

const base =
    isGitHubActions && repo && !isUserOrOrgSite ? `/${repo}/` : "/";

const jsonServerTarget = "http://127.0.0.1:3000";
const isStaticApiMode = process.env.VITE_API_MODE === "static";

function stripApiPrefix(prefix) {
    return (path) =>
        path.startsWith(prefix) ? path.slice(prefix.length) || "/" : path;
}

const previewProxy = {};

if (!isStaticApiMode) {
    previewProxy["/api"] = {
        target: jsonServerTarget,
        changeOrigin: true,
        rewrite: stripApiPrefix("/api"),
    };

    if (base !== "/") {
        const prefixedApi = `${base.replace(/\/$/, "")}/api`;
        previewProxy[prefixedApi] = {
            target: jsonServerTarget,
            changeOrigin: true,
            rewrite: stripApiPrefix(prefixedApi),
        };
    }
}

function staticJsonServerEmitter({ source = "db.json", outDir = "api" } = {}) {
    return {
        name: "static-json-server-emitter",
        apply: "build",
        generateBundle() {
            const sourcePath = resolve(process.cwd(), source);
            const raw = readFileSync(sourcePath, "utf8");
            const data = JSON.parse(raw);

            for (const [collectionName, value] of Object.entries(data)) {
                if (!Array.isArray(value)) continue;

                this.emitFile({
                    type: "asset",
                    fileName: `${outDir}/${collectionName}.json`,
                    source: JSON.stringify(value),
                });
            }
        },
    };
}

export default defineConfig({
    base,
    plugins: [staticJsonServerEmitter()],
    server: {
        port: 4000,
        proxy: {
            "/api": {
                target: jsonServerTarget,
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
    preview: {
        proxy: previewProxy,
    },
});
