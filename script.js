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
const workSlider = document.querySelector(".work-slider");
const workTrack = document.querySelector(".work-track");
const workSlides = [...document.querySelectorAll(".project-slide")];
const workPages = [...document.querySelectorAll(".work-page")];
const prevArrow = document.querySelector('[data-direction="prev"]');
const nextArrow = document.querySelector('[data-direction="next"]');

let currentSlide = 0;

const updateSlider = (index) => {
  currentSlide = Math.max(0, Math.min(index, workSlides.length - 1));
  workTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  workPages.forEach((page, pageIndex) => {
    const isActive = pageIndex === currentSlide;
    page.classList.toggle("is-active", isActive);
    page.setAttribute("aria-current", isActive ? "true" : "false");
  });

  prevArrow.disabled = currentSlide === 0;
  nextArrow.disabled = currentSlide === workSlides.length - 1;
};

prevArrow.addEventListener("click", () => {
  updateSlider(currentSlide - 1);
});

nextArrow.addEventListener("click", () => {
  updateSlider(currentSlide + 1);
});

workPages.forEach((page) => {
  page.addEventListener("click", () => {
    updateSlider(Number(page.dataset.slide));
  });
});

workSlider.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    updateSlider(currentSlide - 1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    updateSlider(currentSlide + 1);
  }
});

updateSlider(0);

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
