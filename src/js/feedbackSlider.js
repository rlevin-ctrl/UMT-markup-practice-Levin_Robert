import Swiper from "swiper";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { apiClient } from "./apiClient";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage } from "./utils";

const feedbackSliderStage = document.querySelector("#feedback-slider-stage");
const feedbackSliderTrack = document.querySelector("#feedback-slider-list");
const feedbackLoader = document.querySelector("#feedback-loader");
const feedbackSliderViewport = document.querySelector(".feedback-slider-viewport");

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function buildFeedbackCard(feedback) {
    const card = document.createElement("div");
    card.className = "feedback-item";

    const text = document.createElement("p");
    text.className = "feedback-text";
    text.textContent = feedback.text ?? "";

    const author = document.createElement("p");
    author.className = "feedback-author";
    author.textContent = feedback.author ?? "";

    card.append(text, author);
    return card;
}

function setFeedbackLoading(isLoading) {
    if (feedbackLoader) feedbackLoader.hidden = !isLoading;
    if (feedbackSliderViewport) {
        feedbackSliderViewport.setAttribute("aria-busy", isLoading ? "true" : "false");
    }
}

async function bootFeedbackSlider() {
    if (!feedbackSliderStage || !feedbackSliderTrack) {
        setFeedbackLoading(false);
        return;
    }

    try {
        const response = await apiClient.get("/feedbacks");
        const feedbackItems = Array.isArray(response.data) ? response.data : [];

        if (feedbackItems.length === 0) return;

        function createLoopableItems(sourceItems) {
            if (!Array.isArray(sourceItems) || sourceItems.length === 0) return [];

            // Keep enough slides for seamless looping on desktop (3 per view).
            const minSlidesForLoop = 6;
            const loopable = [...sourceItems];

            while (loopable.length < minSlidesForLoop) {
                loopable.push(...sourceItems);
            }

            return loopable;
        }

        const loopableFeedbackItems = createLoopableItems(feedbackItems);

        feedbackSliderTrack.replaceChildren();

        for (const item of loopableFeedbackItems) {
            const slide = document.createElement("li");
            slide.className = "swiper-slide feedback-slider-slide";
            slide.append(buildFeedbackCard(item));
            feedbackSliderTrack.append(slide);
        }

        new Swiper(feedbackSliderStage, {
            modules: [Navigation, A11y],
            slidesPerView: 1,
            spaceBetween: 32,
            loop: true,
            watchOverflow: false,
            speed: prefersReducedMotion() ? 0 : 480,

            observer: true,
            observeParents: true,

            navigation: {
                prevEl: "[data-feedback-prev]",
                nextEl: "[data-feedback-next]",
            },

            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 32,
                    allowTouchMove: true,
                },
                1440: {
                    slidesPerView: 3,
                    spaceBetween: 32,
                    allowTouchMove: true,
                },
            },

            on: {
                breakpoint(sw) {
                    sw.params.speed = 0;
                    sw.slideTo(0, 0, false);
                    requestAnimationFrame(() => {
                        sw.params.speed = prefersReducedMotion() ? 0 : 480;
                    });
                },
            },
        });

    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load feedback."));
    } finally {
        setFeedbackLoading(false);
    }
}

bootFeedbackSlider();
