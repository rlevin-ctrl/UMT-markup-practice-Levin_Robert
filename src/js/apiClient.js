import axios from "axios";

const isStaticMode = import.meta.env.VITE_API_MODE === "static";

function resolveApiBaseURL() {
    if (isStaticMode) {
        return '/UMT-markup-practice-Levin_Robert/api/';
    }

    const raw = import.meta.env.VITE_API_BASE_URL ?? "api";

    if (/^https?:\/\//i.test(raw)) {
        return raw;
    }

    const segment = raw.replace(/^\/+|\/+$/g, "");
    const siteBase = new URL(import.meta.env.BASE_URL, "http://vite.local");
    return new URL(segment, siteBase).pathname;
}

export const apiClient = axios.create({
    baseURL: resolveApiBaseURL(),
    timeout: 15000,
});

if (isStaticMode) {
    apiClient.interceptors.request.use((config) => {
        if (typeof config.url !== "string" || config.url.length === 0) {
            return config;
        }
        
        const [pathPart, queryPart] = config.url.split("?", 2);

        // Якщо вже є .json - не додаємо
        if (pathPart && pathPart.endsWith('.json')) {
            return config;
        }
        
        const newPath = `${pathPart}.json`;
        config.url = queryPart ? `${newPath}?${queryPart}` : newPath;

        console.log('API Request:', config.baseURL + config.url);
        return config;
    });
}