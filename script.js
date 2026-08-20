const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalClose = document.getElementById("modalClose");
const previews = document.querySelectorAll(".project-img");

previews.forEach(p => {
  p.addEventListener("click", () => {
    modalImg.src = p.dataset.img;
    modal.showModal();
  });
});

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", e => { if (e.target === modal) modal.close(); });