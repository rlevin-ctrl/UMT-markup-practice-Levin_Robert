import axios from "axios";

const isStaticMode = import.meta.env.VITE_API_MODE === "static";

function resolveApiBaseURL() {
    if (isStaticMode) {
        const baseUrl = import.meta.env.BASE_URL || '/';
        return `${baseUrl}api/`;
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
        
        let cleanPath = pathPart;
        
        if (!cleanPath.endsWith('.json')) {
            cleanPath = `${cleanPath}.json`;
        }
        
        config.url = queryPart ? `${cleanPath}?${queryPart}` : cleanPath;

        console.log('API Request URL:', config.baseURL + config.url);
        return config;
    });
}