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

reveals.forEach((el, i) => {
  const section = el.closest("section, .divider");
  const siblings = section
    ? [...section.querySelectorAll(".reveal")]
    : [el];
  const index = siblings.indexOf(el);
  el.style.setProperty("--reveal-delay", `${index * 80}ms`);
  observer.observe(el);
});
