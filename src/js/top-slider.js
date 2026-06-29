const list = document.querySelector(".top-list");
const items = document.querySelectorAll(".top-item");
const btnPrev = document.querySelector(".slider-arrow.prev");
const btnNext = document.querySelector(".slider-arrow.next");

let index = 0;

function getVisibleCount() {
  const w = window.innerWidth;
  if (w >= 1440) return 3;
  if (w >= 768) return 2;
  return 1;
}

function updateSlider() {
  const visible = getVisibleCount();

  if (visible === 3) {
    list.style.transform = "translateX(0)";
    btnPrev.style.display = "none";
    btnNext.style.display = "none";
    return;
  }

  btnPrev.style.display = "flex";
  btnNext.style.display = "flex";

  const gap = 32;
  const itemWidth = items[0].offsetWidth + gap;

  const maxIndex = items.length - visible;
  if (index > maxIndex) index = maxIndex;
  if (index < 0) index = 0;

  list.style.transform = `translateX(-${index * itemWidth}px)`;
}

btnNext.addEventListener("click", () => {
  const visible = getVisibleCount();
  const maxIndex = items.length - visible;

  if (index < maxIndex) {
    index++;
    updateSlider();
  }
});

btnPrev.addEventListener("click", () => {
  if (index > 0) {
    index--;
    updateSlider();
  }
});

window.addEventListener("resize", updateSlider);
updateSlider();
