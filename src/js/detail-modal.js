import { showSuccessNotification } from "./notifications";

const detailModal = document.getElementById("detail-modal");
const orderModal = document.getElementById("order-modal");
const closeDetailButton = document.getElementById("close-detail-modal");
const closeOrderButton = document.getElementById("close-order-modal");
const detailModalContent = document.getElementById("detail-modal-content");
const orderModalForm = document.getElementById("order-form");

let scrollPosition = 0;

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

function openProductDetail({ title, price, desc, imgSrc, imgSrcset }) {
    if (!title || !price || !imgSrc || !detailModalContent) return;

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

orderModalForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(orderModalForm);
    const name = formData.get("name");
    const phone = formData.get("phone");
    showSuccessNotification(`Thank you, ${name}! We will call you at ${phone}.`);
    orderModalForm.reset();
    closeOrderModal();
});
