import { apiClient } from "./apiClient";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage } from "./utils";

const itemsPerPage = 4;

const catalogueList = document.getElementById("catalog-list");
const catalogueListShell = document.querySelector(".catalog-list");
const catalogueLoader = null;
const showMoreButton = document.querySelector("#catalog-load-more");

let lastLoadedPage = 0;
let totalPages = 1;
let allProducts = [];

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

function setCatalogueInitialLoading(isLoading) {
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
}

async function fetchPage(page, appendItems = false) {
    const isInitial = !appendItems;

    setCatalogueInitialLoading(true);

    try {
        if (allProducts.length === 0) {
            const response = await apiClient.get("/bouquets.json");
            const body = response.data;

            if (Array.isArray(body)) {
                allProducts = body;
            } else {
                allProducts = body?.data ?? [];
            }
        }

        totalPages = Math.ceil(allProducts.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const chunk = allProducts.slice(start, start + itemsPerPage);

        renderChunk(chunk, !appendItems);
        lastLoadedPage = page;
        updateShowMore();

    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bouquets."));
    } finally {
        setCatalogueInitialLoading(false);
    }
}

function init() {
    if (showMoreButton) {
        showMoreButton.hidden = true;
        showMoreButton.addEventListener("click", () => {
            fetchPage(lastLoadedPage + 1, true);
        });
    }

    fetchPage(1, false);
}

init();