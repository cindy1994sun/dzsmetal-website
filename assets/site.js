(() => {
  "use strict";

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.getElementById("site-nav");

  if (navToggle && navigation) {
    document.documentElement.classList.add("nav-ready");

    const setNavigation = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navigation.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", () => {
      setNavigation(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setNavigation(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setNavigation(false);
        navToggle.focus();
      }
    });

    const desktop = window.matchMedia("(min-width: 901px)");
    desktop.addEventListener("change", (event) => {
      if (event.matches) setNavigation(false);
    });
  }

  const quoteForm = document.getElementById("quote-form");
  if (quoteForm) {
    const serviceSelect = quoteForm.elements.namedItem("service");
    const requestedService = new URLSearchParams(window.location.search).get("service");
    if (serviceSelect instanceof HTMLSelectElement && requestedService &&
        Array.from(serviceSelect.options).some((option) => option.value === requestedService)) {
      serviceSelect.value = requestedService;
    }

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!quoteForm.reportValidity()) return;

      const data = new FormData(quoteForm);
      const value = (name) => String(data.get(name) || "").trim();
      const service = value("service");
      const serviceLabel = serviceSelect instanceof HTMLSelectElement && service ?
        serviceSelect.selectedOptions[0].textContent.trim() : "Please advise";
      const subject = `DZS Metal inquiry${service ? ` — ${serviceLabel}` : ""}`;
      const body = [
        "Hello DZS Metal team,",
        "",
        "I would like to discuss the following project:",
        "",
        `Name: ${value("name")}`,
        `Company: ${value("company") || "Not specified"}`,
        `Email: ${value("email")}`,
        `Service: ${serviceLabel}`,
        `Material: ${value("material") || "Please advise"}`,
        `Quantity: ${value("quantity") || "Not specified"}`,
        "",
        "Project details:",
        value("message"),
        "",
        "I can attach relevant drawings or specifications to this email.",
      ].join("\r\n");

      const mailto = `mailto:marketings@china-casting.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const status = quoteForm.querySelector(".form-status") || document.querySelector(".form-status");
      if (status) {
        status.textContent = "Your email draft is ready. Choose Open email draft, then review it, attach any drawings, and send it in your email app. This website has not sent your inquiry. ";
        const draftLink = document.createElement("a");
        draftLink.href = mailto;
        draftLink.setAttribute("data-email-draft", "");
        draftLink.target = "_blank";
        draftLink.rel = "noopener";
        draftLink.textContent = "Open email draft";
        status.appendChild(draftLink);
        status.appendChild(document.createTextNode(". If no email app opens, email marketings@china-casting.com directly."));
      }
      // Let the visitor launch their mail client explicitly. Opening in a new
      // tab preserves entered details if this browser has no mail handler.
    });
  }

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
})();
