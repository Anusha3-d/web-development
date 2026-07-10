// ===== Menu Data =====
const MENU_DATA = {
  tiffins: [
    { name: "Masala Dosa", desc: "Crisp rice crepe, spiced potato filling, sambar & two chutneys", price: "₹90" },
    { name: "Plain Idli (2 pc)", desc: "Steamed rice cakes, served soft with podi and ghee", price: "₹60" },
    { name: "Rava Kesari Bath Combo", desc: "Semolina upma paired with sweet kesari bath", price: "₹75" },
    { name: "Set Dosa (3 pc)", desc: "Soft, spongy dosas stacked with coconut chutney", price: "₹85" },
    { name: "Vada Sambar (2 pc)", desc: "Crisp lentil fritters soaked in hot sambar", price: "₹65" },
  ],
  coffee: [
    { name: "Filter Coffee", desc: "Decoction brewed for 12 hours, poured tall between tumblers", price: "₹40" },
    { name: "Badam Milk", desc: "Almond-saffron milk, served chilled or hot", price: "₹55" },
    { name: "Ginger Tea", desc: "Strong CTC tea with fresh ginger", price: "₹30" },
    { name: "Buttermilk", desc: "Spiced yogurt drink with curry leaf tempering", price: "₹35" },
  ],
  sides: [
    { name: "Coconut Chutney", desc: "Fresh grated coconut, green chilli, tempered curry leaf", price: "₹20" },
    { name: "Molagai Podi", desc: "Roasted lentil-chilli powder, mixed with sesame oil", price: "₹25" },
    { name: "Tomato Chutney", desc: "Tangy tomato-onion chutney with a mild spice kick", price: "₹20" },
    { name: "Sambar (bowl)", desc: "Toor dal stew with drumstick and seasonal vegetables", price: "₹30" },
  ],
};

const menuGrid = document.getElementById("menuGrid");
const menuTabs = document.querySelectorAll(".menu-tab");

function renderMenu(category) {
  const items = MENU_DATA[category] || [];
  menuGrid.innerHTML = items
    .map(
      (item) => `
      <article class="menu-card">
        <div>
          <h4>${item.name}</h4>
          <p>${item.desc}</p>
        </div>
        <span class="menu-price">${item.price}</span>
      </article>`
    )
    .join("");
}

menuTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    menuTabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");
    renderMenu(tab.dataset.category);
  });
});

renderMenu("tiffins");

// ===== Mobile Nav Toggle =====
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

navToggle.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// ===== Scroll Spy for Active Nav Link =====
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
      }
    });
  },
  { rootMargin: "-40% 0px -50% 0px" }
);
sections.forEach((section) => spyObserver.observe(section));

// ===== Testimonial Carousel =====
const track = document.getElementById("testimonialTrack");
const slides = Array.from(track.children);
const dotsContainer = document.getElementById("testimonialDots");
let currentSlide = 0;

slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.classList.add("t-dot");
  dot.setAttribute("aria-label", `Go to review ${i + 1}`);
  if (i === 0) dot.classList.add("is-active");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${currentSlide * 100}%)`;
  document.querySelectorAll(".t-dot").forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentSlide);
  });
}

document.querySelector(".t-prev").addEventListener("click", () => goToSlide(currentSlide - 1));
document.querySelector(".t-next").addEventListener("click", () => goToSlide(currentSlide + 1));

let autoplay = setInterval(() => goToSlide(currentSlide + 1), 6000);
const carousel = document.querySelector(".testimonial-carousel");
carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
carousel.addEventListener("mouseleave", () => {
  autoplay = setInterval(() => goToSlide(currentSlide + 1), 6000);
});

// ===== Contact Form Validation =====
const form = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

const validators = {
  name: (value) => (value.trim().length >= 2 ? "" : "Please enter your name."),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Please enter a valid email."),
  message: (value) => (value.trim().length >= 10 ? "" : "Message should be at least 10 characters."),
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let isValid = true;

  Object.keys(validators).forEach((field) => {
    const input = document.getElementById(field);
    const errorEl = document.getElementById(`${field}Error`);
    const errorMsg = validators[field](input.value);
    errorEl.textContent = errorMsg;
    input.setAttribute("aria-invalid", errorMsg ? "true" : "false");
    if (errorMsg) isValid = false;
  });

  if (isValid) {
    formSuccess.textContent = "Thanks — we'll get back to you within a day.";
    form.reset();
    document.querySelectorAll(".form-error").forEach((el) => (el.textContent = ""));
  } else {
    formSuccess.textContent = "";
  }
});
