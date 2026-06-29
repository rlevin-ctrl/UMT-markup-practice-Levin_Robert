export function extractErrorMessage(error, fallback = "Something went wrong.") {
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.message) return error.message;
    return fallback;
}

/** Backend origin for uploaded photos (/photos/...). */
function getBackendOrigin() {
    const apiBase = import.meta.env.VITE_BOUQUETS_API_URL?.replace(/\/$/, "") ?? "";
    if (!apiBase) return null;
    return apiBase.replace(/\/api$/i, "");
}

/** Resolve relative image paths from API for Vite base URL (GitHub Pages). */
export function resolvePublicUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;

    const photoPath = String(path);
    const backendOrigin = getBackendOrigin();

    // Photos uploaded via Swagger are stored on Render backend
    if (photoPath.startsWith("/photos/") && backendOrigin) {
        return `${backendOrigin}${photoPath}`;
    }

    const normalized = photoPath.replace(/^\.\//, "");
    const basePath = import.meta.env.BASE_URL || "/";
    const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost";

    return new URL(normalized, new URL(basePath, origin)).href;
}

/** Map backend bouquet shape to frontend card fields. */
export function mapBouquetToCard(item) {
    const photo = item.photoURL ?? item.img ?? "";
    return {
        id: item.id,
        title: item.title ?? "",
        desc: item.description ?? item.desc ?? "",
        longDesc: item.description ?? item.longDesc ?? item.desc ?? "",
        price: formatPriceValue(item.price),
        img: resolvePublicUrl(photo),
    };
}

export function formatPriceValue(price) {
    if (price == null || price === "") return "-";
    const str = String(price).trim();
    if (str.startsWith("$")) return str;
    const num = Number.parseFloat(str.replace(/\s/g, ""));
    if (Number.isNaN(num)) return str;
    return `$${Number.isInteger(num) ? num : num.toFixed(0)}`;
}
