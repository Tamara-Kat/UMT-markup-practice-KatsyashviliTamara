const openMenuButton = document.querySelector(".mobile-menu-open");
const closeMenuButton = document.querySelector(".mobile-menu-close");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu-link");

openMenuButton.addEventListener("click", () => {
  mobileMenu.classList.add("is-open");
});

closeMenuButton.addEventListener("click", () => {
  mobileMenu.classList.remove("is-open");
});

mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
  });
});