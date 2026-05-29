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
    currentPage: 1,
    limit: 4,
    query: "",
    isLoading: false,
    allItems: [],
    filteredItems: [],
    loadedIds: new Set(),
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

function normalizeItems(payload) {
    return Array.isArray(payload) ? payload : [];
}

async function loadAllItems() {
    if (state.allItems.length > 0) return;

    const response = await apiClient.get("/bouquets.json");
    state.allItems = normalizeItems(response.data?.data ?? response.data);
    applyFilter();
}

function displayCurrentPage() {
    const start = 0;
    const end = state.currentPage * state.limit;
    const itemsToShow = state.filteredItems.slice(start, end);
    
    listEl.innerHTML = "";
    if (itemsToShow.length > 0) {
        renderItems(itemsToShow);
    }
    
    const hasMore = end < state.filteredItems.length;
    if (loadMoreBtn) loadMoreBtn.hidden = !hasMore;

    if (!hasMore && state.filteredItems.length > 0) {
        setStatus("You have reached the end of the collection.");
    } else {
        setStatus("");
    }
}

function renderItems(items) {
    if (!listEl || items.length === 0) return;
    listEl.insertAdjacentHTML("beforeend", buildBouquetMarkup(items));
}

function applyFilter() {
    const searchTerm = state.query.toLowerCase().trim();

    if (!searchTerm) {
        state.filteredItems = [...state.allItems];
    } else {
        state.filteredItems = state.allItems.filter(item =>
            item.title.toLowerCase().includes(searchTerm) ||
            item.desc.toLowerCase().includes(searchTerm)
        );
    }

    state.currentPage = 1;

    if (state.filteredItems.length === 0) {
        listEl.innerHTML = "";
        setStatus("No bouquets found for your request.");
        if (loadMoreBtn) loadMoreBtn.hidden = true;
    } else {
        displayCurrentPage();
    }
}

async function loadBouquets() {
    if (!listEl || state.isLoading) return;

    setLoadingState(true);

    try {
        await loadAllItems();
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
        setStatus("Unable to load bouquets right now.");
    } finally {
        setLoadingState(false);
    }
}

function handleLoadMore() {
    state.currentPage += 1;
    displayCurrentPage();
}

function handleFilterSubmit(event) {
    event.preventDefault();
    const nextQuery = searchInputEl?.value.trim() ?? "";
    state.query = nextQuery;
    applyFilter();
}

function bootBouquets() {
    if (!listEl || !loadMoreBtn || !filterFormEl) return;

    loadMoreBtn.addEventListener("click", handleLoadMore);
    filterFormEl.addEventListener("submit", handleFilterSubmit);

    searchInputEl?.addEventListener("input", () => {
        if ((searchInputEl.value ?? "").trim() === state.query) return;
        state.query = (searchInputEl.value ?? "").trim();
        applyFilter();
    });

    loadBouquets();
}

bootBouquets();