const menu__icon = document.querySelector(".menu__icon");
const nav = document.querySelector(".nav");

menu__icon.addEventListener("click", () => nav.classList.toggle("active"));