import { showErrorNotification, showSuccessNotification } from "./notifications";

const modalBackdrop = document.querySelector("[data-modal]");
const modalOpenButtons = document.querySelectorAll("[data-modal-open]");
const modalCloseButton = document.querySelector("[data-modal-close]");
const requestForm = document.querySelector("#request-form");
const subscribeForm = document.querySelector("#footer-subscribe-form");

function openModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add("is-open");
    document.body.classList.add("no-scroll");
}

function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
}

function handleEscClose(event) {
    if (event.key === "Escape" && modalBackdrop?.classList.contains("is-open")) {
        closeModal();
    }
}

function handleBackdropClick(event) {
    if (event.target === modalBackdrop) {
        closeModal();
    }
}

function handleRequestSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const policyAccepted = formData.get("policyAccepted");
    const userName = formData.get("customerName");
    const userPhone = formData.get("customerPhone");

    if (!policyAccepted) {
        showErrorNotification("Please accept the agreement before submitting.");
        return;
    }

    if (!userName || !userPhone) {
        showErrorNotification("Please fill in all required fields.");
        return;
    }

    showSuccessNotification(`Thank you, ${userName}! We will contact you at ${userPhone} shortly.`);
    event.currentTarget.reset();
    closeModal();
}

function handleSubscribeSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("subscribeEmail");

    if (!email) {
        showErrorNotification("Please enter your email address.");
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showErrorNotification("Please enter a valid email address.");
        return;
    }

    showSuccessNotification(`Success! ${email} has been subscribed to our newsletter.`);
    event.currentTarget.reset();
}

function initModal() {
    if (!modalBackdrop) return;

    modalOpenButtons.forEach((button) => {
        button.addEventListener("click", openModal);
    });

    document.querySelectorAll("[data-scroll-to]").forEach((button) => {
        button.addEventListener("click", () => {
            const target = button.getAttribute("data-scroll-to");
            const section = target ? document.querySelector(target) : null;
            section?.scrollIntoView({ behavior: "smooth" });
        });
    });

    modalCloseButton?.addEventListener("click", closeModal);
    modalBackdrop.addEventListener("click", handleBackdropClick);
    document.addEventListener("keydown", handleEscClose);

    requestForm?.addEventListener("submit", handleRequestSubmit);
    subscribeForm?.addEventListener("submit", handleSubscribeSubmit);
}

initModal();