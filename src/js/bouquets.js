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
    allItems: [],  // всі товари
    filteredItems: [], // відфільтровані
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

// Завантажуємо ВСІ товари один раз
async function loadAllItems() {
    if (state.allItems.length > 0) return;

    const response = await apiClient.get("/bouquets.json");
    state.allItems = normalizeItems(response.data?.data ?? response.data);
}

// Оновлюємо відображення на основі поточної сторінки
function updateDisplay() {
    const start = 0;
    const end = state.page * state.limit;
    const itemsToShow = state.filteredItems.slice(start, end);

    // Очищаємо і показуємо нові
    listEl.innerHTML = "";
    if (itemsToShow.length > 0) {
        renderItems(itemsToShow);
    }

    // Оновлюємо стан кнопки
    state.hasMore = end < state.filteredItems.length;
    setLoadMoreVisibility(state.hasMore);

    if (!state.hasMore && state.filteredItems.length > 0) {
        setStatus("You have reached the end of the collection.");
    } else {
        setStatus("");
    }
}

// Фільтруємо товари
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

    // Скидаємо сторінку
    state.page = 1;
    state.hasMore = true;
    state.loadedIds.clear();

    if (state.filteredItems.length === 0) {
        listEl.innerHTML = "";
        setStatus("No bouquets found for your request.");
        setLoadMoreVisibility(false);
    } else {
        updateDisplay();
    }
}

async function loadBouquets() {
    if (!listEl || state.isLoading) return;

    setLoadingState(true);

    try {
        await loadAllItems();
        applyFilter();
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
        setStatus("Unable to load bouquets right now.");
    } finally {
        setLoadingState(false);
    }
}

function handleLoadMore() {
    if (!state.hasMore || state.isLoading) return;

    state.page += 1;
    updateDisplay();
}

function handleFilterSubmit(event) {
    event.preventDefault();
    const nextQuery = searchInputEl?.value.trim() ?? "";
    state.query = nextQuery;
    loadBouquets();
}

function bootBouquets() {
    if (!listEl || !loadMoreBtn || !filterFormEl) return;

    loadMoreBtn.addEventListener("click", handleLoadMore);
    filterFormEl.addEventListener("submit", handleFilterSubmit);

    searchInputEl?.addEventListener("input", () => {
        if ((searchInputEl.value ?? "").trim() === state.query) return;
        state.query = (searchInputEl.value ?? "").trim();
        loadBouquets();
    });

    loadBouquets();
}

bootBouquets();