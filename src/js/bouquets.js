import { apiClient } from "./apiClient";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage } from "./utils";

const itemsPerPage = 4;

const catalogueList = document.getElementById("catalog-list");
const showMoreButton = document.querySelector("#catalog-load-more");
const statusEl = document.querySelector("#catalog-status");
const filterFormEl = document.querySelector("#catalog-filter-form");
const searchInputEl = document.querySelector("#catalog-search");

let lastLoadedPage = 0;
let totalPages = 1;
let allProducts = [];
let currentQuery = "";

function formatPrice(price) {
    if (!price) return "-";
    const str = String(price).trim();
    if (str.startsWith("$")) return str;
    const num = Number.parseInt(str.replace(/\s/g, ""), 10);
    if (Number.isNaN(num)) return str;
    return `$${num}`;
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
    listItem.querySelector(".catalog-price").textContent = formatPrice(product.price);
}

function setLoading(isLoading) {
    if (showMoreButton) {
        showMoreButton.disabled = isLoading;
        showMoreButton.textContent = isLoading ? "Loading..." : "Show More";
    }
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
    showMoreButton.hidden = lastLoadedPage >= totalPages;

    if (!showMoreButton.hidden) {
        if (statusEl) statusEl.textContent = "";
    } else if (allProducts.length > 0) {
        if (statusEl) statusEl.textContent = "You have reached the end of the collection.";
    }
}

function getFilteredProducts() {
    if (!currentQuery) return allProducts;

    const searchTerm = currentQuery.toLowerCase().trim();
    return allProducts.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.desc.toLowerCase().includes(searchTerm)
    );
}

async function fetchPage(page, appendItems = false) {
    setLoading(true);

    try {
        if (allProducts.length === 0) {
            const response = await apiClient.get("/bouquets.json");
            const body = response.data;
            allProducts = Array.isArray(body) ? body : (body?.data ?? []);
        }

        const filteredProducts = getFilteredProducts();
        totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        if (totalPages === 0) {
            catalogueList.replaceChildren();
            if (statusEl) statusEl.textContent = "No bouquets found for your request.";
            if (showMoreButton) showMoreButton.hidden = true;
            setLoading(false);
            return;
        }

        const start = (page - 1) * itemsPerPage;
        const chunk = filteredProducts.slice(start, start + itemsPerPage);

        renderChunk(chunk, !appendItems);
        lastLoadedPage = page;
        updateShowMore();

    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
        if (statusEl) statusEl.textContent = "Unable to load bouquets right now.";
    } finally {
        setLoading(false);
    }
}

function resetAndLoad() {
    lastLoadedPage = 0;
    catalogueList.replaceChildren();
    fetchPage(1, false);
}

function handleLoadMore() {
    if (lastLoadedPage >= totalPages) return;
    fetchPage(lastLoadedPage + 1, true);
}

function handleFilterSubmit(event) {
    event.preventDefault();
    currentQuery = searchInputEl?.value.trim() ?? "";
    resetAndLoad();
}

function init() {
    if (showMoreButton) {
        showMoreButton.addEventListener("click", handleLoadMore);
    }

    if (filterFormEl) {
        filterFormEl.addEventListener("submit", handleFilterSubmit);
    }

    if (searchInputEl) {
        searchInputEl.addEventListener("input", () => {
            if ((searchInputEl.value ?? "").trim() === currentQuery) return;
            currentQuery = (searchInputEl.value ?? "").trim();
            resetAndLoad();
        });
    }

    fetchPage(1, false);
}

init();