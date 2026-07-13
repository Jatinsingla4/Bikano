document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".header__toggle");
  const nav = document.querySelector(".header__nav");
  const playBtn = document.getElementById("playBtn");
  const overlay = document.getElementById("bannerOverlay");
  const video = document.getElementById("bannerVideo");
  const banner = document.querySelector(".home-banner");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.classList.toggle("active");
      nav.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.classList.remove("active");
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  if (playBtn && overlay && video && banner) {
    let idleTimer = null;
    const IDLE_DELAY = 1000;

    video.pause();

    const setPlayingState = (isPlaying) => {
      overlay.classList.toggle("is-hidden", isPlaying);
      playBtn.classList.toggle("is-playing", isPlaying);
      playBtn.setAttribute("aria-pressed", String(isPlaying));
      playBtn.setAttribute("aria-label", isPlaying ? "Pause video" : "Play video");

      if (isPlaying) {
        showControlsTemporarily();
      } else {
        clearTimeout(idleTimer);
        banner.classList.remove("is-controls-hidden");
      }
    };

    const hideControls = () => {
      if (!video.paused) {
        banner.classList.add("is-controls-hidden");
      }
    };

    const showControlsTemporarily = () => {
      banner.classList.remove("is-controls-hidden");
      clearTimeout(idleTimer);

      if (!video.paused) {
        idleTimer = setTimeout(hideControls, IDLE_DELAY);
      }
    };

    const toggleVideo = () => {
      if (video.paused) {
        video.play().then(() => setPlayingState(true)).catch(() => {});
      } else {
        video.pause();
        setPlayingState(false);
      }
    };

    banner.addEventListener("click", (e) => {
      if (e.target.closest(".floating-actions") || e.target.closest(".header")) return;
      toggleVideo();
    });

    banner.addEventListener("mousemove", () => {
      if (!video.paused) {
        showControlsTemporarily();
      }
    });

    video.addEventListener("play", () => setPlayingState(true));
    video.addEventListener("pause", () => setPlayingState(false));
  }

  const certifiedSwiperEl = document.querySelector(".certified-by__swiper");

  if (certifiedSwiperEl) {
    const marqueeEl = certifiedSwiperEl.closest(".certified-by__marquee");
    const wrapper = certifiedSwiperEl.querySelector(".swiper-wrapper");
    const originalSlides = Array.from(wrapper.children);
    let blurFrameId = null;
    const SCROLL_SPEED = 55;

    const cloneSlidesForLoop = () => {
      originalSlides.forEach((slide) => {
        wrapper.appendChild(slide.cloneNode(true));
      });
    };

    const waitForImages = () => {
      const images = certifiedSwiperEl.querySelectorAll("img");
      return Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
        )
      );
    };

    const applyEdgeBlur = () => {
      if (!marqueeEl) return;

      const containerRect = marqueeEl.getBoundingClientRect();
      const fadeZone = containerRect.width * 0.1;
      const maxBlur = 5;

      certifiedSwiperEl.querySelectorAll(".certified-by__slide img").forEach((img) => {
        const rect = img.getBoundingClientRect();

        if (rect.width < 8 || rect.height < 8) {
          img.style.filter = "none";
          return;
        }

        const slideCenter = rect.left + rect.width / 2;
        const distFromLeft = slideCenter - containerRect.left;
        const distFromRight = containerRect.right - slideCenter;
        let blur = 0;

        if (distFromLeft < fadeZone) {
          blur = (1 - distFromLeft / fadeZone) * maxBlur;
        } else if (distFromRight < fadeZone) {
          blur = (1 - distFromRight / fadeZone) * maxBlur;
        }

        img.style.filter = blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : "none";
      });

      blurFrameId = requestAnimationFrame(applyEdgeBlur);
    };

    const startMarquee = () => {
      const setWidth = wrapper.scrollWidth / 2;
      const duration = setWidth / SCROLL_SPEED;

      wrapper.style.setProperty("--marquee-duration", `${duration}s`);
      wrapper.classList.add("is-animated");
      applyEdgeBlur();
    };

    const initCertifiedMarquee = () => {
      cloneSlidesForLoop();

      requestAnimationFrame(() => {
        startMarquee();
      });
    };

    waitForImages().then(initCertifiedMarquee);

    window.addEventListener("beforeunload", () => {
      if (blurFrameId) cancelAnimationFrame(blurFrameId);
    });
  }

  const craveableSwiperEl = document.querySelector(".all-things-craveable__swiper");

  if (craveableSwiperEl && typeof Swiper !== "undefined") {
    const craveableWrapper = craveableSwiperEl.querySelector(".swiper-wrapper");
    const craveableCatalog = document.querySelector(".all-things-craveable__catalog");

    const getCraveableCategoryData = (category) => {
      const group =
        craveableCatalog &&
        (craveableCatalog.querySelector(
          `.all-things-craveable__catalog-group[data-category="${category}"]`
        ) ||
          craveableCatalog.querySelector(
            '.all-things-craveable__catalog-group[data-category="namkeen"]'
          ));

      if (!group) {
        return { products: [], accent: "", burst: "./assets/images/Namkeen.png" };
      }

      const products = Array.from(group.querySelectorAll("img")).map((img) => ({
        img: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
      }));

      return {
        products,
        accent: group.dataset.accent || "",
        burst: group.dataset.burst || "",
      };
    };

    const craveableSlideMarkup = (product, accent, burst, category) => `
      <div class="swiper-slide all-things-craveable__slide">
        <div class="all-things-craveable__product">
          ${
            burst
              ? `<div class="all-things-craveable__burst" aria-hidden="true">
            <img src="${burst}" alt="" />
          </div>`
              : ""
          }
          <img
            class="all-things-craveable__packet"
            src="${product.img}"
            alt="${product.alt}"
          />
          ${
            accent
              ? `<div class="all-things-craveable__accent${category === "sweets" ? " all-things-craveable__accent--sweets" : ""}" aria-hidden="true">
            <img src="${accent}" alt="" />
          </div>`
              : ""
          }
        </div>
      </div>`;

    let craveableSwiper = null;

    const buildCraveableCategory = (category) => {
      const { products, accent, burst } = getCraveableCategoryData(category);
      if (!products.length) return;

      // Duplicate the set so centered loop always has enough slides for 3-up view.
      const slides = [...products, ...products];
      craveableWrapper.innerHTML = slides
        .map((product) => craveableSlideMarkup(product, accent, burst, category))
        .join("");

      if (craveableSwiper) {
        craveableSwiper.destroy(true, true);
      }

      craveableSwiper = new Swiper(craveableSwiperEl, {
        slidesPerView: 3,
        centeredSlides: true,
        spaceBetween: 24,
        loop: true,
        speed: 600,
        autoHeight: false,
        watchSlidesProgress: true,
        navigation: {
          nextEl: ".all-things-craveable__nav-btn--next",
          prevEl: ".all-things-craveable__nav-btn--prev",
        },
        breakpoints: {
          0: { slidesPerView: 1.35, spaceBetween: 12 },
          768: { slidesPerView: 2.2, spaceBetween: 18 },
          992: { slidesPerView: 3, spaceBetween: 24 },
        },
      });
    };

    const craveableTabs = document.querySelectorAll(".all-things-craveable__category");
    const initialTab =
      document.querySelector(".all-things-craveable__category.active") ||
      craveableTabs[0];

    buildCraveableCategory(initialTab ? initialTab.dataset.category : "namkeen");

    craveableTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        craveableTabs.forEach((item) => item.classList.remove("active"));
        tab.classList.add("active");
        buildCraveableCategory(tab.dataset.category);
      });
    });
  }

  const caughtSwiperEl = document.querySelector(".caught-in-act__swiper");

  if (caughtSwiperEl && typeof Swiper !== "undefined") {
    new Swiper(caughtSwiperEl, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      speed: 600,
      navigation: {
        nextEl: ".caught-in-act__nav--next",
        prevEl: ".caught-in-act__nav--prev",
      },
      pagination: {
        el: ".caught-in-act__pagination",
        clickable: true,
      },
    });
  }

  const buzzSwiperEl = document.querySelector(".bikano-buzz__swiper");

  if (buzzSwiperEl) {
    const buzzWrapper = buzzSwiperEl.querySelector(".swiper-wrapper");
    const buzzOriginalSlides = Array.from(buzzWrapper.children);
    const BUZZ_SCROLL_SPEED = 90;

    const cloneBuzzSlides = () => {
      buzzOriginalSlides.forEach((slide) => {
        buzzWrapper.appendChild(slide.cloneNode(true));
      });
    };

    const processBuzzInstagramEmbeds = () => {
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      }
    };

    const waitForBuzzImages = () => {
      const images = buzzSwiperEl.querySelectorAll("img");
      return Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
        )
      );
    };

    const startBuzzMarquee = () => {
      const setWidth = buzzWrapper.scrollWidth / 2;
      const duration = Math.max(setWidth / BUZZ_SCROLL_SPEED, 20);

      buzzWrapper.style.setProperty("--marquee-duration", `${duration}s`);
      buzzWrapper.classList.add("is-animated");
    };

    const setBuzzMarqueePaused = (paused) => {
      buzzWrapper.classList.toggle("is-paused", paused);
    };

    const bindBuzzMarqueePause = () => {
      const section = buzzSwiperEl.closest(".bikano-buzz");
      const marquee = section && section.querySelector(".bikano-buzz__marquee");
      if (!section || !marquee) return;

      const pauseForReel = () => {
        section.classList.add("is-reel-active");
        setBuzzMarqueePaused(true);
      };

      const ensureCardCatches = () => {
        // Coarse pointers can't rely on :hover; catch first tap, then let Instagram receive the next.
        const isCoarse =
          window.matchMedia && window.matchMedia("(hover: none), (pointer: coarse)").matches;
        if (!isCoarse) return;

        marquee.querySelectorAll(".bikano-buzz__card").forEach((card) => {
          if (card.querySelector(".bikano-buzz__card-catch")) return;

          const catcher = document.createElement("button");
          catcher.type = "button";
          catcher.className = "bikano-buzz__card-catch";
          catcher.setAttribute("aria-label", "Play reel");
          catcher.addEventListener(
            "pointerdown",
            (event) => {
              event.preventDefault();
              pauseForReel();
              catcher.remove();
            },
            { once: true }
          );
          card.appendChild(catcher);
        });
      };

      const resumeIfIdle = () => {
        section.classList.remove("is-reel-active");
        setBuzzMarqueePaused(false);
        ensureCardCatches();
      };

      marquee.addEventListener("mouseenter", () => setBuzzMarqueePaused(true));
      marquee.addEventListener("mouseleave", () => {
        // Keep paused if a reel was activated; only clear hover pause.
        if (section.classList.contains("is-reel-active")) {
          setBuzzMarqueePaused(true);
          return;
        }
        setBuzzMarqueePaused(false);
      });

      marquee.addEventListener(
        "pointerdown",
        (event) => {
          if (!event.target.closest(".bikano-buzz__card")) return;
          pauseForReel();
        },
        true
      );

      // Iframe focus (desktop + some mobile browsers) after Instagram embed loads
      marquee.addEventListener("focusin", (event) => {
        if (event.target.tagName !== "IFRAME") return;
        pauseForReel();
      });

      window.addEventListener("blur", () => {
        requestAnimationFrame(() => {
          const active = document.activeElement;
          if (active && active.tagName === "IFRAME" && marquee.contains(active)) {
            pauseForReel();
          }
        });
      });

      document.addEventListener(
        "pointerdown",
        (event) => {
          if (event.target.closest(".bikano-buzz__marquee")) return;
          if (!section.classList.contains("is-reel-active")) return;
          resumeIfIdle();
        },
        true
      );

      ensureCardCatches();
      // Embeds inject iframes async — re-bind catchers after process
      setTimeout(ensureCardCatches, 800);
      setTimeout(ensureCardCatches, 2000);
    };

    const initBuzzMarquee = () => {
      cloneBuzzSlides();
      processBuzzInstagramEmbeds();
      bindBuzzMarqueePause();
      requestAnimationFrame(startBuzzMarquee);
    };

    waitForBuzzImages().then(initBuzzMarquee);

    // Re-process embeds if Instagram script loads after our init.
    window.addEventListener("load", processBuzzInstagramEmbeds);
  }

  if (typeof Fancybox !== "undefined") {
    Fancybox.bind('[data-fancybox="caught-in-act"]', {
      Toolbar: false,
      Thumbs: false,
    });
  }
});
