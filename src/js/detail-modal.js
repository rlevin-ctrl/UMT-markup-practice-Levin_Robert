import { apiClient } from "./apiClient";
import { showErrorNotification, showSuccessNotification } from "./notifications";
import { extractErrorMessage } from "./utils";

const detailModal = document.getElementById("detail-modal");
const orderModal = document.getElementById("order-modal");
const closeDetailButton = document.getElementById("close-detail-modal");
const closeOrderButton = document.getElementById("close-order-modal");
const detailModalContent = document.getElementById("detail-modal-content");
const orderModalForm = document.getElementById("order-form");

let scrollPosition = 0;
let pendingOrder = {
    productTitle: "",
    productPrice: "",
    quantity: 1,
    bouquetId: null,
};

function parsePriceValue(price) {
    const num = Number.parseInt(String(price ?? "").replace(/[^\d]/g, ""), 10);
    return Number.isNaN(num) ? 0 : num;
}

function syncModalOpenState() {
    const anyModalOpen =
        detailModal?.classList.contains("is-open") || orderModal?.classList.contains("is-open");
    document.body.classList.toggle("no-scroll", anyModalOpen);
}

function openDetailModal() {
    if (!detailModal) return;
    scrollPosition = window.scrollY;
    detailModal.classList.add("is-open");
    syncModalOpenState();
}

function switchToOrderModal() {
    const title = detailModalContent?.querySelector(".detail-modal-title")?.textContent?.trim() ?? "";
    const price = detailModalContent?.querySelector(".detail-modal-price")?.textContent?.trim() ?? "";
    const quantity = Number.parseInt(
        detailModalContent?.querySelector(".detail-modal-quantity")?.value ?? "1",
        10,
    );

    pendingOrder = {
        productTitle: title,
        productPrice: price,
        quantity: Number.isNaN(quantity) || quantity < 1 ? 1 : quantity,
        bouquetId: pendingOrder.bouquetId,
    };

    if (detailModal) detailModal.classList.remove("is-open");
    if (orderModal) orderModal.classList.add("is-open");
    syncModalOpenState();
}

function closeOrderModal() {
    if (!orderModal) return;
    window.scrollTo(0, scrollPosition);
    orderModal.classList.remove("is-open");
    syncModalOpenState();
    orderModalForm?.reset();
    pendingOrder = {
        productTitle: "",
        productPrice: "",
        quantity: 1,
        bouquetId: null,
    };
}

function closeDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove("is-open");
    syncModalOpenState();
}

function buildDetailModalMarkup(title, price, desc, img, srcset) {
    const safeDesc = (desc || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeTitle = (title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `
    <img class="detail-modal-img" src="${img}" ${srcset ? `srcset="${srcset}"` : ""} alt="${safeTitle}">
    <div class="detail-modal-info">
      <h3 class="detail-modal-title">${safeTitle}</h3>
      <p class="detail-modal-price">${price}</p>
      <p class="detail-modal-desc">${safeDesc}</p>
      <div class="detail-modal-actions">
        <button type="button" id="buy-now-btn" class="detail-modal-btn">Buy now</button>
        <input type="number" class="detail-modal-quantity" value="1" min="1" aria-label="Quantity">
      </div>
    </div>
  `;
}

function openProductDetail({ title, price, desc, imgSrc, imgSrcset, productId = null }) {
    if (!title || !price || !imgSrc || !detailModalContent) return;

    pendingOrder = {
        productTitle: title,
        productPrice: price,
        quantity: 1,
        bouquetId: productId ? Number.parseInt(String(productId), 10) || null : null,
    };

    detailModalContent.innerHTML = buildDetailModalMarkup(
        title,
        price,
        desc,
        imgSrc,
        imgSrcset,
    );
    openDetailModal();
}

document.addEventListener("click", (event) => {
    if (event.target.closest(".carousel-arrow, .carousel-dot, .carousel-controls")) return;

    const bestsellerCard = event.target.closest(".product-card");
    if (bestsellerCard?.closest("#bestsellers-slider-list")) {
        const img = bestsellerCard.querySelector(".product-card-image");
        openProductDetail({
            title: bestsellerCard.querySelector(".product-card-title")?.textContent,
            price: bestsellerCard.querySelector(".product-card-price")?.textContent,
            desc:
                bestsellerCard.dataset.longDesc ||
                bestsellerCard.querySelector(".product-card-text")?.textContent ||
                "",
            imgSrc: img?.src,
            imgSrcset: img?.srcset,
            productId: bestsellerCard.dataset.productId || null,
        });
        return;
    }

    const catalogItem = event.target.closest(".catalog-item");
    if (catalogItem?.closest("#catalog-list")) {
        const img = catalogItem.querySelector(".catalog-item-img");
        openProductDetail({
            title: catalogItem.querySelector(".catalog-name")?.textContent,
            price: catalogItem.querySelector(".catalog-price")?.textContent,
            desc: catalogItem.dataset.longDesc || catalogItem.querySelector(".catalog-desc")?.textContent || "",
            imgSrc: img?.src,
            imgSrcset: img?.srcset,
            productId: catalogItem.dataset.productId || null,
        });
    }
});

closeDetailButton?.addEventListener("click", closeDetailModal);
closeOrderButton?.addEventListener("click", closeOrderModal);

detailModal?.addEventListener("click", (e) => {
    if (e.target === detailModal) closeDetailModal();
});

orderModal?.addEventListener("click", (e) => {
    if (e.target === orderModal) closeOrderModal();
});

document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (orderModal?.classList.contains("is-open")) closeOrderModal();
    else if (detailModal?.classList.contains("is-open")) closeDetailModal();
});

document.addEventListener("click", (e) => {
    if (e.target.id === "buy-now-btn" || e.target.closest("#buy-now-btn")) {
        switchToOrderModal();
    }
});

orderModalForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = orderModalForm.querySelector(".order-submit-btn");
    const formData = new FormData(orderModalForm);
    const customerName = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const productPrice = parsePriceValue(pendingOrder.productPrice);

    if (!pendingOrder.productTitle || productPrice < 1) {
        showErrorNotification("Please choose a bouquet before placing an order.");
        return;
    }

    const payload = {
        customerName,
        phone,
        address: String(formData.get("address") ?? "").trim(),
        message: String(formData.get("comment") ?? "").trim(),
        productTitle: pendingOrder.productTitle,
        productPrice,
        quantity: pendingOrder.quantity,
        bouquetId: pendingOrder.bouquetId,
    };

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
    }

    try {
        await apiClient.post("/orders", payload);
        showSuccessNotification(`Thank you, ${customerName}! Your order has been placed.`);
        orderModalForm.reset();
        closeOrderModal();
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to place order. Please try again."));
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Go to Checkout";
        }
    }
});
