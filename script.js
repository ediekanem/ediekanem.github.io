document.getElementById("year").textContent = new Date().getFullYear();

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
  const siblings = section ? [...section.querySelectorAll(".reveal")] : [el];
  const index = siblings.indexOf(el);
  el.style.setProperty("--reveal-delay", `${index * 80}ms`);
  observer.observe(el);
});

const lightbox = document.getElementById("lightbox");
const lightboxStage = document.querySelector(".lightbox-stage");
const lightboxTrack = document.getElementById("lightbox-track");
const lightboxPagination = document.getElementById("lightbox-pagination");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxZoom = document.querySelector(".lightbox-zoom");
const lightboxClose = document.querySelector(".lightbox-close");

const workSlider = document.querySelector(".work-slider");
const workTrack = document.querySelector(".work-track");
const workSlides = [...document.querySelectorAll(".project-slide")];
const workPages = [...document.querySelectorAll(".work-page")];
const prevArrow = document.querySelector('[data-direction="prev"]');
const nextArrow = document.querySelector('[data-direction="next"]');

const galleryImages = {
  coretech: [
    { src: "assets/road-accident-overview-dashboard-preview.jpg", alt: "Road Traffic Accident Overview Dashboard built in Excel" },
    { src: "assets/road-accident-risk-factors-dashboard-preview.jpg", alt: "Road Traffic Accident Risk Factors Dashboard built in Excel" },
  ],
  freelancegig: [
    { src: "assets/freelancer-performance-dashboard-preview.png", alt: "Freelancer Performance Dashboard built in Tableau" },
    { src: "assets/freelancer-earnings-forecast-dashboard-preview.png", alt: "Freelancer Earnings Forecast Dashboard built in Tableau" },
  ],
};

const LIGHTBOX_ZOOM_SCALE = 1.85;

let currentSlide = 0;
let currentLightboxIndex = 0;
let currentGallery = [];
let lightboxZoomed = false;
let lightboxPan = { x: 0, y: 0 };
let lightboxDragging = false;
let lightboxDragStart = { x: 0, y: 0 };
let lightboxDragOrigin = { x: 0, y: 0 };

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

const stopLightboxDragging = () => {
  lightboxDragging = false;
  const activeImage = lightboxTrack.children[currentLightboxIndex]?.querySelector("img");
  if (activeImage) {
    activeImage.classList.remove("is-dragging");
  }
};

const clampLightboxPan = (image) => {
  if (!image || !lightboxZoomed) {
    lightboxPan = { x: 0, y: 0 };
    return;
  }

  const maxOffsetX = Math.max(0, (image.clientWidth * LIGHTBOX_ZOOM_SCALE - lightboxStage.clientWidth) / 2);
  const maxOffsetY = Math.max(0, (image.clientHeight * LIGHTBOX_ZOOM_SCALE - lightboxStage.clientHeight) / 2);

  lightboxPan = {
    x: Math.min(maxOffsetX, Math.max(-maxOffsetX, lightboxPan.x)),
    y: Math.min(maxOffsetY, Math.max(-maxOffsetY, lightboxPan.y)),
  };
};

const applyLightboxZoom = () => {
  const activeImage = lightboxTrack.children[currentLightboxIndex]?.querySelector("img");

  [...lightboxTrack.querySelectorAll("img")].forEach((img) => {
    img.style.transform = "translate(0px, 0px) scale(1)";
    img.classList.toggle("is-zoomable", lightboxZoomed);
    img.classList.remove("is-dragging");
  });

  if (activeImage && lightboxZoomed) {
    clampLightboxPan(activeImage);
    activeImage.style.transform = `translate(${lightboxPan.x}px, ${lightboxPan.y}px) scale(${LIGHTBOX_ZOOM_SCALE})`;
    if (lightboxDragging) {
      activeImage.classList.add("is-dragging");
    }
  }

  lightboxZoom.classList.toggle("is-zoomed", lightboxZoomed);
  lightboxZoom.textContent = lightboxZoomed ? "-" : "+";
  lightboxZoom.setAttribute("aria-label", lightboxZoomed ? "Reset image zoom" : "Zoom image");
};

const updateLightbox = (index) => {
  currentLightboxIndex = Math.max(0, Math.min(index, currentGallery.length - 1));
  lightboxTrack.style.transform = `translateX(-${currentLightboxIndex * 100}%)`;
  lightboxPan = { x: 0, y: 0 };
  stopLightboxDragging();

  [...lightboxPagination.children].forEach((page, pageIndex) => {
    page.classList.toggle("is-active", pageIndex === currentLightboxIndex);
  });

  const isMultiImage = currentGallery.length > 1;
  lightboxPrev.hidden = !isMultiImage;
  lightboxNext.hidden = !isMultiImage;
  lightboxPagination.hidden = !isMultiImage;
  lightboxPrev.disabled = currentLightboxIndex === 0;
  lightboxNext.disabled = currentLightboxIndex === currentGallery.length - 1;
  applyLightboxZoom();
};

const openLightbox = (images, startIndex = 0) => {
  currentGallery = images;
  lightboxZoomed = false;
  lightboxPan = { x: 0, y: 0 };
  stopLightboxDragging();
  renderLightbox();
  updateLightbox(startIndex);
  lightbox.showModal();
};

const renderLightbox = () => {
  lightboxTrack.innerHTML = "";
  lightboxPagination.innerHTML = "";

  currentGallery.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "lightbox-item";

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.draggable = false;

    img.addEventListener("pointerdown", (event) => {
      if (!lightboxZoomed || index !== currentLightboxIndex) {
        return;
      }

      lightboxDragging = true;
      lightboxDragStart = { x: event.clientX, y: event.clientY };
      lightboxDragOrigin = { ...lightboxPan };
      img.setPointerCapture(event.pointerId);
      img.classList.add("is-dragging");
      event.preventDefault();
    });

    img.addEventListener("pointermove", (event) => {
      if (!lightboxDragging || index !== currentLightboxIndex) {
        return;
      }

      lightboxPan = {
        x: lightboxDragOrigin.x + (event.clientX - lightboxDragStart.x),
        y: lightboxDragOrigin.y + (event.clientY - lightboxDragStart.y),
      };

      applyLightboxZoom();
    });

    img.addEventListener("pointerup", stopLightboxDragging);
    img.addEventListener("pointercancel", stopLightboxDragging);
    img.addEventListener("lostpointercapture", stopLightboxDragging);

    item.appendChild(img);
    lightboxTrack.appendChild(item);

    const page = document.createElement("button");
    page.className = "lightbox-page";
    page.type = "button";
    page.setAttribute("aria-label", `Go to gallery image ${index + 1}`);
    page.addEventListener("click", () => {
      updateLightbox(index);
    });
    lightboxPagination.appendChild(page);
  });
};

document.querySelectorAll(".project-thumb").forEach((btn) => {
  btn.addEventListener("click", () => {
    const galleryKey = btn.dataset.gallery;
    const startIndex = Number(btn.dataset.galleryIndex || 0);

    if (galleryKey && galleryImages[galleryKey]) {
      openLightbox(galleryImages[galleryKey], startIndex);
      return;
    }

    const img = btn.querySelector("img");
    openLightbox([{ src: img.src, alt: img.alt }]);
  });
});

lightboxPrev.addEventListener("click", () => {
  updateLightbox(currentLightboxIndex - 1);
});

lightboxNext.addEventListener("click", () => {
  updateLightbox(currentLightboxIndex + 1);
});

lightboxZoom.addEventListener("click", () => {
  lightboxZoomed = !lightboxZoomed;

  if (!lightboxZoomed) {
    lightboxPan = { x: 0, y: 0 };
    stopLightboxDragging();
  }

  applyLightboxZoom();
});

lightboxClose.addEventListener("click", (event) => {
  event.stopPropagation();
  lightbox.close();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    lightbox.close();
  }
});

lightbox.addEventListener("close", () => {
  currentGallery = [];
  currentLightboxIndex = 0;
  lightboxZoomed = false;
  lightboxPan = { x: 0, y: 0 };
  stopLightboxDragging();
  lightboxTrack.innerHTML = "";
  lightboxPagination.innerHTML = "";
  applyLightboxZoom();
});

window.addEventListener("resize", () => {
  if (lightbox.open) {
    applyLightboxZoom();
  }
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) {
    return;
  }

  if (event.key === "ArrowLeft" && currentGallery.length > 1) {
    event.preventDefault();
    updateLightbox(currentLightboxIndex - 1);
  }

  if (event.key === "ArrowRight" && currentGallery.length > 1) {
    event.preventDefault();
    updateLightbox(currentLightboxIndex + 1);
  }

  if (event.key === "Escape") {
    lightbox.close();
  }
});
