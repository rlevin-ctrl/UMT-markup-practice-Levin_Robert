const detailModal = document.getElementById("detail-modal");
const orderModal = document.getElementById("order-modal");
const closeDetailButton = document.getElementById("close-detail-modal");
const closeOrderButton = document.getElementById("close-order-modal");
const detailModalContent = document.getElementById("detail-modal-content");
const orderModalForm = document.getElementById("order-form");

let scrollPosition = 0;

function syncModalOpenState() {
    const anyModalOpen = detailModal?.classList.contains("is-open") || orderModal?.classList.contains("is-open");
    document.body.classList.toggle("no-scroll", anyModalOpen);
}

function openDetailModal() {
    if (detailModal) {
        scrollPosition = window.scrollY;
        detailModal.classList.add("is-open");
        syncModalOpenState();
    }
}

function switchToOrderModal() {
    if (detailModal) detailModal.classList.remove("is-open");
    if (orderModal) orderModal.classList.add("is-open");
    syncModalOpenState();
}

function closeOrderModal() {
    if (orderModal) {
        window.scrollTo(0, scrollPosition);
        orderModal.classList.remove("is-open");
        syncModalOpenState();
        orderModalForm?.reset();
    }
}

function closeDetailModal() {
    if (detailModal) {
        detailModal.classList.remove("is-open");
        syncModalOpenState();
    }
}

function buildDetailModalMarkup(title, price, desc, img, srcset) {

    const safeDesc = (desc || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeTitle = (title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `
    <img class="detail-modal-img" src="${img}" ${srcset ? `srcset="${srcset}"` : ''} alt="${safeTitle}">
    <div class="detail-modal-info">
      <h3 class="detail-modal-title">${safeTitle}</h3>
      <p class="detail-modal-price">${price}</p>
      <p class="detail-modal-desc">${safeDesc}</p>
      <div class="detail-modal-actions">
        <button type="button" id="buy-now-btn" class="detail-modal-btn">Buy now</button>
        <input type="number" class="detail-modal-quantity" value="1" min="1">
      </div>
    </div>
  `;
}

document.addEventListener("click", (event) => {
    const card = event.target.closest(".bestsellers-slider-slide");
    if (!card) return;

    const productCard = card.querySelector(".product-card");
    const img = card.querySelector(".product-card-image");
    const title = card.querySelector(".product-card-title")?.textContent;
    const price = card.querySelector(".product-card-price")?.textContent;
    
    let desc = productCard?.dataset.longDesc || "";
    if (!desc) {
        desc = card.querySelector(".product-card-text")?.textContent || "";
    }

    console.log("🖱️ Відкриття модалки для:", title);

    if (!title || !price || !img) return;

    const src = img.src;
    const srcset = img.srcset;

    if (detailModalContent) {
        detailModalContent.innerHTML = buildDetailModalMarkup(title, price, desc, src, srcset);
        openDetailModal();
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

document.addEventListener("click", (e) => {
    if (e.target.id === "buy-now-btn" || e.target.closest("#buy-now-btn")) {
        console.log("🔄 Перехід до order модалки");
        switchToOrderModal();
    }
});

orderModalForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(orderModalForm);
    const name = formData.get("name");
    const phone = formData.get("phone");
    alert(`Thank you, ${name}! We will call you at ${phone}.`);
    orderModalForm.reset();
    closeOrderModal();
});

document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ detail-modal.js завантажено, елементи знайдені:", {
        detailModal: !!detailModal,
        orderModal: !!orderModal,
        detailModalContent: !!detailModalContent
    });
});