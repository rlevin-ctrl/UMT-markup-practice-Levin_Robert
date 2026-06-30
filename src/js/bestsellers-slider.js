import Swiper from "swiper";
import { Navigation, A11y } from "swiper/modules";
import "swiper/css";
import { apiClient } from "./apiClient";
import { showErrorNotification } from "./notifications";
import { extractErrorMessage, mapBestsellerToCard } from "./utils";

const track = document.querySelector("#bestsellers-slider-list");
const dotsContainer = document.querySelector(".carousel-dots");

async function bootBestsellers() {
    try {
        const response = await apiClient.get("/bestsellers");
        const items = (Array.isArray(response.data) ? response.data : []).map(mapBestsellerToCard);

        if (items.length === 0) return;

        function createLoopableItems(sourceItems) {
            if (!Array.isArray(sourceItems) || sourceItems.length === 0) return [];

            const minSlidesForLoop = 6;
            const loopable = [...sourceItems];

            let cloneRound = 0;
            while (loopable.length < minSlidesForLoop) {
                sourceItems.forEach((item) => {
                    loopable.push({
                        ...item,
                        __cloneKey: `clone-${cloneRound}`,
                    });
                });
                cloneRound += 1;
            }

            return loopable;
        }

        const loopableItems = createLoopableItems(items);
        const baseItemsCount = items.length;
        const visibleDotsCount = Math.min(baseItemsCount, 6);

        track.replaceChildren();

        for (const item of loopableItems) {
            const slide = document.createElement("li");
            slide.className = "swiper-slide bestsellers-slider-slide";

            const longDesc = (item.longDesc || item.desc || "")
                .replace(/"/g, '&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            const imgUrl = item.img;

            slide.innerHTML = `
                <article class="product-card" data-long-desc="${longDesc}" data-product-id="${item.id ?? ""}">
                    <img
                        class="product-card-image"
                        src="${imgUrl}"
                        srcset="${imgUrl} 1x, ${imgUrl} 2x"
                        alt="${item.title}"
                        loading="lazy"
                    />
                    <h3 class="product-card-title">${item.title}</h3>
                    <p class="product-card-text">${item.desc || ''}</p>
                    <p class="product-card-price">${item.price}</p>
                </article>
            `;

            track.append(slide);
        }

        dotsContainer.replaceChildren();
        for (let i = 0; i < visibleDotsCount; i += 1) {
            const dot = document.createElement("button");
            dot.className = "carousel-dot";
            dot.type = "button";
            dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
            dotsContainer.append(dot);
        }

        const dots = dotsContainer.querySelectorAll(".carousel-dot");

        const swiper = new Swiper("#bestsellers-slider-stage", {
            modules: [Navigation, A11y],
            slidesPerView: 1,
            spaceBetween: 32,
            loop: true,
            watchOverflow: false,
            speed: 480,

            navigation: {
                prevEl: "[data-bestsellers-prev]",
                nextEl: "[data-bestsellers-next]",
            },

            breakpoints: {
                768: { slidesPerView: 2 },
                1440: { slidesPerView: 3 },
            },
        });

        function updateDots() {
            const normalizedIndex =
                visibleDotsCount > 0 ? swiper.realIndex % visibleDotsCount : 0;
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === normalizedIndex);
            });
        }

        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                if (baseItemsCount === 0) return;
                swiper.slideToLoop(i % baseItemsCount);
            });
        });

        swiper.on("slideChange", updateDots);
        updateDots();
    } catch (error) {
        showErrorNotification(extractErrorMessage(error, "Failed to load bestsellers."));
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootBestsellers);
} else {
    bootBestsellers();
}