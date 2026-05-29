import { apiClient } from "./apiClient";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage } from "./utils";

const listEl = document.querySelector("#catalog-list");
const loadMoreBtn = document.querySelector("#catalog-load-more");
const statusEl = document.querySelector("#catalog-status");
const filterFormEl = document.querySelector("#catalog-filter-form");
const searchInputEl = document.querySelector("#catalog-search");

const isStaticMode = import.meta.env.VITE_API_MODE === "static";

const state = {
    page: 1,
    limit: 4,
    query: "",
    loadedIds: new Set(),
    isLoading: false,
    hasMore: true,
    allItemsCache: null,  
};

function setStatus(message = "") {
    if (statusEl) statusEl.textContent = message;
}

function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    if (loadMoreBtn) {
        loadMoreBtn.disabled = isLoading;
        loadMoreBtn.textContent = isLoading ? "Loading..." : "Show More";
    }
}

function setLoadMoreVisibility(visible) {
    if (!loadMoreBtn) return;
    loadMoreBtn.hidden = !visible;
}

function buildBouquetMarkup(items) {
    return items
        .map(
            (item) => `
      <li class="catalog-item" data-bouquet-id="${item.id}">
        <img
          src="${item.img}"
          srcset="${item.img} 1x, ${item.img} 2x"
          sizes="(min-width: 1440px) 296px, (min-width: 768px) calc((100vw - 88px) / 2), calc(100vw - 40px)"
          alt="${item.title}"
        />
        <p class="catalog-name">${item.title}</p>
        <p class="catalog-desc">${item.desc}</p>
        <p class="catalog-price">${item.price}</p>
      </li>
    `,
        )
        .join("");
}

function renderItems(items) {
    if (!listEl || items.length === 0) return;
    listEl.insertAdjacentHTML("beforeend", buildBouquetMarkup(items));
}

function normalizeItems(payload) {
    return Array.isArray(payload) ? payload : [];
}

async function fetchServerPage() {
    if (state.query) {
        if (!state.allItemsCache) {
            const response = await apiClient.get("/bouquets.json");
            state.allItemsCache = normalizeItems(response.data?.data ?? response.data);
        }

        const searchTerm = state.query.toLowerCase().trim();
        const filtered = state.allItemsCache.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.desc.toLowerCase().includes(searchTerm)
        );

        const start = (state.page - 1) * state.limit;
        const end = start + state.limit;
        const items = filtered.slice(start, end);

        return { items, total: filtered.length };
    }
    
    const params = {
        _page: state.page,
        _per_page: state.limit,
    };

    const response = await apiClient.get("/bouquets.json", { params });
    const items = normalizeItems(response.data?.data ?? response.data);
    const total = Number(response.data?.items ?? response.headers?.["x-total-count"] ?? 0);

    return { items, total };
}

async function fetchStaticPage() {
    if (!state.allItemsCache) {
        const response = await apiClient.get("/bouquets.json");
        state.allItemsCache = normalizeItems(response.data);
    }

    const query = state.query.trim().toLowerCase();
    const filtered = query
        ? state.allItemsCache.filter((item) =>
            `${item.title} ${item.desc}`.toLowerCase().includes(query),
        )
        : state.allItemsCache;

    const start = (state.page - 1) * state.limit;
    const end = start + state.limit;
    const items = filtered.slice(start, end);

    return { items, total: filtered.length };
}

async function fetchPage() {
    return isStaticMode ? fetchStaticPage() : fetchServerPage();
}

function filterOutDuplicates(items) {
    const unique = items.filter((item) => !state.loadedIds.has(item.id));
    unique.forEach((item) => state.loadedIds.add(item.id));
    return unique;
}

function resetCatalogStateForFilter() {
    state.page = 1;
    state.hasMore = true;
    state.loadedIds.clear();
    state.allItemsCache = null;  
    if (listEl) listEl.innerHTML = "";
    setStatus("");
}

async function loadBouquets({ append = true } = {}) {
    if (!listEl || state.isLoading || !state.hasMore) return;

    setLoadingState(true);

    try {
        const { items, total } = await fetchPage();
        const uniqueItems = filterOutDuplicates(items);

        if (!append) {
            listEl.innerHTML = "";
        }

        if (uniqueItems.length > 0) {
            renderItems(uniqueItems);
            setStatus("");
        }

        const renderedCount = state.loadedIds.size;
        state.hasMore = renderedCount < total;
        setLoadMoreVisibility(state.hasMore);

        if (renderedCount === 0) {
            setStatus("No bouquets found for your request.");
            setLoadMoreVisibility(false);
            return;
        }

        if (!state.hasMore) {
            setStatus("You have reached the end of the collection.");
        }
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
        setStatus("Unable to load bouquets right now.");
    } finally {
        setLoadingState(false);
    }
}

function handleLoadMore() {
    state.page += 1;
    loadBouquets({ append: true });
}

function handleFilterSubmit(event) {
    event.preventDefault();
    const nextQuery = searchInputEl?.value.trim() ?? "";
    state.query = nextQuery;
    resetCatalogStateForFilter();
    loadBouquets({ append: true });
}

function bootBouquets() {
    if (!listEl || !loadMoreBtn || !filterFormEl) return;

    loadMoreBtn.addEventListener("click", handleLoadMore);
    filterFormEl.addEventListener("submit", handleFilterSubmit);

    searchInputEl?.addEventListener("input", () => {
        if ((searchInputEl.value ?? "").trim() === state.query) return;
        state.query = (searchInputEl.value ?? "").trim();
        resetCatalogStateForFilter();
        loadBouquets({ append: true });
    });

    setLoadMoreVisibility(true);
    loadBouquets({ append: true });
}

bootBouquets();