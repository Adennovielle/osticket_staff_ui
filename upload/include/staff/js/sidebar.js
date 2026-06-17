document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const body = document.body;

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("closed");
    body.classList.toggle("nav-open");
  });
});
