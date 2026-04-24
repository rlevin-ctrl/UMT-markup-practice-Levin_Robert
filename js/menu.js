const menu = document.querySelector("[data-menu]");
const openBtn = document.querySelector("[data-menu-open]");
const closeBtn = document.querySelector("[data-menu-close]");
const links = document.querySelectorAll(".mobile-nav-link");

function openMenu() {
    menu.classList.add("is-open");
    document.body.classList.add("no-scroll");
}

function closeMenu() {
    menu.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
}

openBtn.addEventListener("click", openMenu);
closeBtn.addEventListener("click", closeMenu);

links.forEach(link => link.addEventListener("click", closeMenu));

menu.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
});
