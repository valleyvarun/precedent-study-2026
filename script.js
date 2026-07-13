(function () {
  const introText = document.getElementById("intro-text");
  const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const galleryPrev = document.getElementById("gallery-prev");
  const galleryNext = document.getElementById("gallery-next");
  const lightboxClose = document.querySelector(".lightbox-close");
  const analysisTabs = Array.from(document.querySelectorAll(".analysis-tab"));
  const analysisPanels = Array.from(document.querySelectorAll(".analysis-panel"));
  const analysisTextPanels = Array.from(document.querySelectorAll(".analysis-text-panel"));
  const analysisViewport = document.querySelector(".analysis-viewport");
  const sectionTargets = Array.from(document.querySelectorAll(".section-target"));
  const sectionPrev = document.getElementById("section-prev");
  const sectionNext = document.getElementById("section-next");
  let currentGalleryIndex = 0;

  if (introText) {
    fetch("intro-para.txt")
      .then((response) => response.text())
      .then((text) => {
        introText.textContent = text;
      })
      .catch(() => {
        introText.textContent = "Unable to load intro text.";
      });
  }

  document.addEventListener("wheel", (event) => {
    if (analysisViewport?.matches(":hover")) {
      event.preventDefault();
    }
  }, { passive: false, capture: true });

  function getCurrentSectionIndex() {
    if (!sectionTargets.length) {
      return 0;
    }

    const sectionOffset = parseFloat(getComputedStyle(sectionTargets[0]).scrollMarginTop);
    const currentTop = window.scrollY + sectionOffset + 1;

    return sectionTargets.reduce((currentIndex, target, index) => {
      return target.offsetTop <= currentTop ? index : currentIndex;
    }, 0);
  }

  function moveSection(direction) {
    if (!sectionTargets.length) {
      return;
    }

    const currentIndex = getCurrentSectionIndex();
    const nextIndex = Math.max(0, Math.min(sectionTargets.length - 1, currentIndex + direction));

    sectionTargets[nextIndex].scrollIntoView({ block: "start" });
  }

  sectionPrev?.addEventListener("click", () => moveSection(-1));
  sectionNext?.addEventListener("click", () => moveSection(1));

  document.addEventListener("keydown", (event) => {
    if ((lightbox && !lightbox.hidden) || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSection(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSection(1);
    }
  });

  analysisTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      analysisTabs.forEach((item) => {
        const isActive = item === tab;

        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });

      analysisPanels.forEach((panel) => {
        panel.hidden = panel.id !== tab.dataset.panel;
      });

      analysisTextPanels.forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab.dataset.panel;
      });
    });
  });

  function showGalleryImage(index) {
    if (!galleryItems.length || !lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }

    currentGalleryIndex = (index + galleryItems.length) % galleryItems.length;

    const item = galleryItems[currentGalleryIndex];
    const image = item.querySelector("img");

    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = item.dataset.caption;
    lightbox.hidden = false;
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => showGalleryImage(index));
  });

  galleryPrev?.addEventListener("click", () => {
    showGalleryImage(currentGalleryIndex - 1);
  });

  galleryNext?.addEventListener("click", () => {
    showGalleryImage(currentGalleryIndex + 1);
  });

  lightboxClose?.addEventListener("click", () => {
    if (lightbox) {
      lightbox.hidden = true;
    }
  });
}());