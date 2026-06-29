import axios from "axios";
import { apiClient } from "./apiClient.js";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage, mapBouquetToCard } from "./utils";

const itemsPerPage = 4;

const catalogueList = document.getElementById("catalog-list");
const showMoreButton = document.querySelector("#catalog-load-more");
const statusEl = document.querySelector("#catalog-status");
const filterFormEl = document.querySelector("#catalog-filter-form");
const searchInputEl = document.querySelector("#catalog-search");

const bouquetsApiBase = import.meta.env.VITE_BOUQUETS_API_URL?.replace(/\/$/, "") ?? null;
const useRealBackend = Boolean(bouquetsApiBase);

let lastLoadedPage = 0;
let totalPages = 1;
let staticCache = [];
let currentQuery = "";

function setLoading(isLoading) {
    if (!showMoreButton) return;
    showMoreButton.disabled = isLoading;
    if (isLoading) {
        showMoreButton.textContent = "Loading...";
    } else {
        updateShowMore();
    }
}

function buildItemMarkup() {
    return `
    <li class="catalog-item">
      <img class="catalog-item-img" alt="">
      <p class="catalog-name"></p>
      <p class="catalog-desc"></p>
      <p class="catalog-price"></p>
    </li>`;
}

function fillItem(listItem, product) {
    const image = listItem.querySelector(".catalog-item-img");
    image.src = product.img ?? "";
    image.alt = product.title ?? "";
    listItem.querySelector(".catalog-name").textContent = product.title ?? "";
    listItem.querySelector(".catalog-desc").textContent = product.desc ?? "";
    listItem.querySelector(".catalog-price").textContent = product.price ?? "-";
    listItem.dataset.longDesc = product.longDesc ?? product.desc ?? "";
    listItem.dataset.productId = product.id ?? "";
}

function renderChunk(products, shouldReplace) {
    if (!catalogueList) return;
    if (shouldReplace) catalogueList.replaceChildren();

    const startIndex = catalogueList.children.length;
    catalogueList.insertAdjacentHTML("beforeend", products.map(() => buildItemMarkup()).join(""));

    const listItems = catalogueList.querySelectorAll(":scope > .catalog-item");
    for (let i = 0; i < products.length; i++) {
        fillItem(listItems[startIndex + i], products[i]);
    }
}

function updateShowMore() {
    if (!showMoreButton) return;

    const allLoaded = lastLoadedPage >= totalPages;
    const canCollapse = totalPages > 1 && catalogueList?.children.length > itemsPerPage;

    if (!allLoaded) {
        showMoreButton.hidden = false;
        showMoreButton.textContent = "Show More";
        showMoreButton.dataset.mode = "more";
        if (statusEl) statusEl.textContent = "";
        return;
    }

    if (canCollapse) {
        showMoreButton.hidden = false;
        showMoreButton.textContent = "Show Less";
        showMoreButton.dataset.mode = "less";
    } else {
        showMoreButton.hidden = true;
    }

    if (statusEl) statusEl.textContent = "";
}

async function fetchBackendPage(page, appendItems = false) {
    const response = await axios.get(`${bouquetsApiBase}/bouquets`, {
        params: {
            page,
            limit: itemsPerPage,
            q: currentQuery || undefined,
        },
    });

    const body = response.data;
    const rows = Array.isArray(body?.data) ? body.data : [];
    totalPages = body?.totalPages ?? 1;

    if (rows.length === 0 && page === 1) {
        catalogueList.replaceChildren();
        if (statusEl) statusEl.textContent = "No bouquets found for your request.";
        if (showMoreButton) showMoreButton.hidden = true;
        return;
    }

    renderChunk(rows.map(mapBouquetToCard), !appendItems && page === 1);
    lastLoadedPage = page;
    updateShowMore();
}

async function fetchStaticPage(page, appendItems) {
    if (staticCache.length === 0) {
        const response = await apiClient.get("/bouquets.json");
        const body = response.data;
        staticCache = Array.isArray(body) ? body.map(mapBouquetToCard) : (body?.data ?? []).map(mapBouquetToCard);
    }

    const searchTerm = currentQuery.toLowerCase().trim();
    const filtered = searchTerm
        ? staticCache.filter(
              (item) =>
                  item.title.toLowerCase().includes(searchTerm) ||
                  item.desc.toLowerCase().includes(searchTerm),
          )
        : staticCache;

    totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    if (filtered.length === 0) {
        catalogueList.replaceChildren();
        if (statusEl) statusEl.textContent = "No bouquets found for your request.";
        if (showMoreButton) showMoreButton.hidden = true;
        return;
    }

    const start = (page - 1) * itemsPerPage;
    const chunk = filtered.slice(start, start + itemsPerPage);
    renderChunk(chunk, !appendItems && page === 1);
    lastLoadedPage = page;
    updateShowMore();
}

async function fetchPage(page, appendItems = false) {
    setLoading(true);
    try {
        if (useRealBackend) {
            await fetchBackendPage(page, appendItems);
        } else {
            await fetchStaticPage(page, appendItems);
        }
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
        if (statusEl) statusEl.textContent = "Unable to load bouquets right now.";
    } finally {
        setLoading(false);
    }
}

function resetAndLoad() {
    lastLoadedPage = 0;
    if (catalogueList) catalogueList.replaceChildren();
    fetchPage(1, false);
}

function handleShowLess() {
    lastLoadedPage = 0;
    if (catalogueList) catalogueList.replaceChildren();
    fetchPage(1, false);
}

function handleLoadMore() {
    if (showMoreButton?.dataset.mode === "less") {
        handleShowLess();
        return;
    }
    if (lastLoadedPage >= totalPages) return;
    fetchPage(lastLoadedPage + 1, true);
}

function handleFilterSubmit(event) {
    event.preventDefault();
    currentQuery = searchInputEl?.value.trim() ?? "";
    resetAndLoad();
}

function init() {
    showMoreButton?.addEventListener("click", handleLoadMore);
    filterFormEl?.addEventListener("submit", handleFilterSubmit);

    searchInputEl?.addEventListener("input", () => {
        const next = (searchInputEl.value ?? "").trim();
        if (next === currentQuery) return;
        currentQuery = next;
        resetAndLoad();
    });

    fetchPage(1, false);
}

init();
