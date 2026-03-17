document.getElementById("year").textContent = new Date().getFullYear();

/* ─── Scroll reveal ───────────────────── */

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
);

reveals.forEach((el) => {
  const section = el.closest("section, .divider");
  const siblings = section
    ? [...section.querySelectorAll(".reveal")]
    : [el];
  const index = siblings.indexOf(el);
  el.style.setProperty("--reveal-delay", `${index * 80}ms`);
  observer.observe(el);
});

/* ─── Image lightbox ──────────────────── */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

document.querySelectorAll(".project-thumb").forEach((btn) => {
  btn.addEventListener("click", () => {
    const img = btn.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.showModal();
  });
});

document.querySelector(".lightbox-close").addEventListener("click", (e) => {
  e.stopPropagation();
  lightbox.close();
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
