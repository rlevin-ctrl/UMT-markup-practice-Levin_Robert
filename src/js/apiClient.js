import axios from "axios";

const isStaticMode = import.meta.env.VITE_API_MODE === "static";

function resolveApiBaseURL() {
    const raw = import.meta.env.VITE_API_BASE_URL ?? "api";

    if (/^https?:\/\//i.test(raw)) {
        return raw;
    }

    const segment = raw.replace(/^\/+|\/+$/g, "");
    
    const baseUrl = import.meta.env.BASE_URL || '/';

    let fullPath = `${baseUrl}${segment}`.replace(/\/+/g, '/');
    
    if (!fullPath.startsWith('/')) {
        fullPath = '/' + fullPath;
    }

    console.log('API Base URL:', fullPath); 
    return fullPath;
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

        if (!pathPart || /\.[a-z0-9]+$/i.test(pathPart)) {
            return config;
        }

        config.url = queryPart
            ? `${pathPart}.json?${queryPart}`
            : `${pathPart}.json`;

        console.log('API Request URL:', config.url); 
        return config;
    });
}