// Abre cada imagem de projeto em tamanho grande ao clicar.
const modal = document.querySelector("#image-modal");
const modalImage = document.querySelector("#modal-image");
const closeButton = document.querySelector(".modal-close");
const previews = document.querySelectorAll(".project-preview");

previews.forEach((preview) => {
  preview.addEventListener("click", () => {
    modalImage.src = preview.dataset.image;
    modalImage.alt = preview.dataset.alt;
    modal.showModal();
  });
});

closeButton.addEventListener("click", () => modal.close());

modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
