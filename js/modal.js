const openModalButtons = document.querySelectorAll("[data-modal-open]");
const closeModalButton = document.querySelector("[data-modal-close]");
const modal = document.querySelector("[data-modal]");

function openModal() {
  modal.classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("is-open");
  document.body.classList.remove("modal-open");
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", openModal);
});

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});