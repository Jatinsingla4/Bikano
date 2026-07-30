document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".header__toggle");
  const nav = document.querySelector(".header__nav");

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

  const certifiedSwiperEl = document.querySelector(".certified-by__swiper");

  if (certifiedSwiperEl) {
    const wrapper = certifiedSwiperEl.querySelector(".swiper-wrapper");
    const originalSlides = Array.from(wrapper.children);
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

    // Edge fade is handled entirely by the .certified-by__fade CSS gradient
    // overlays — no JS blur here. A per-frame getBoundingClientRect + filter
    // loop over every slide, forever, was fighting the compositor-driven CSS
    // marquee animation for main-thread time and causing intermittent stutter.
    const startMarquee = () => {
      const setWidth = wrapper.scrollWidth / 2;
      const duration = setWidth / SCROLL_SPEED;

      wrapper.style.setProperty("--marquee-duration", `${duration}s`);
      wrapper.classList.add("is-animated");
    };

    const initCertifiedMarquee = () => {
      cloneSlidesForLoop();

      requestAnimationFrame(() => {
        startMarquee();
      });
    };

    waitForImages().then(initCertifiedMarquee);
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
  const sociablekitContainer = document.querySelector(".bikano-buzz__sociablekit-demo");
  const feedpaneContainer = document.querySelector(".bikano-buzz__feedpane-demo");

  if (buzzSwiperEl) {
    const buzzWrapper = buzzSwiperEl.querySelector(".swiper-wrapper");
    let buzzOriginalSlides = [];
    const BUZZ_SCROLL_SPEED = 90;
    buzzWrapper.innerHTML = "";

    const cloneBuzzSlides = () => {
      buzzOriginalSlides.forEach((slide) => {
        buzzWrapper.appendChild(slide.cloneNode(true));
      });
    };

    const buildBuzzViewsBadge = (count) => {
      const span = document.createElement("span");
      span.className = "bikano-buzz__views";
      span.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="#fff"/></svg>';
      span.append(document.createTextNode(count));
      return span;
    };

    const buildSociablekitSlide = (src, likes) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide bikano-buzz__slide";
      const article = document.createElement("article");
      article.className = "bikano-buzz__card";
      const img = document.createElement("img");
      img.referrerPolicy = "no-referrer";
      img.src = src;
      img.alt = "Bikano reel";
      article.appendChild(img);
      if (likes) article.appendChild(buildBuzzViewsBadge(likes));
      slide.appendChild(article);
      return slide;
    };

    const getSociablekitPosts = () => {
      if (!sociablekitContainer) return [];
      return Array.from(
        sociablekitContainer.querySelectorAll(".sk-instagram-reel")
      )
        .map((post) => {
          const img = post.querySelector("img");
          const src = img ? img.getAttribute("src") : "";
          const likesEl = post.querySelector(
            ".sk-instagram-reel__count .count"
          );
          const likes = likesEl ? likesEl.textContent.trim() : "";
          return { src, likes };
        })
        .filter((post) => post.src);
    };

    const buildFeedpaneVideoSlide = (videoSrc, poster, likes) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide bikano-buzz__slide";
      const article = document.createElement("article");
      article.className = "bikano-buzz__card";
      const video = document.createElement("video");
      video.src = videoSrc;
      video.poster = poster;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "auto");
      article.appendChild(video);
      if (likes) article.appendChild(buildBuzzViewsBadge(likes));
      slide.appendChild(article);
      return slide;
    };

    const getFeedpaneVideoPosts = () => {
      if (!feedpaneContainer) return [];
      return Array.from(feedpaneContainer.querySelectorAll(".fp-post"))
        .map((post) => {
          const video = post.querySelector("video");
          if (!video) return null;
          const videoSrc = video.getAttribute("src") || "";
          const poster = video.getAttribute("poster") || "";
          const likesEl = post.querySelector(".fp-likes");
          const likes = likesEl
            ? likesEl.textContent.replace(/[^\d,]/g, "").trim()
            : "";
          return { videoSrc, poster, likes };
        })
        .filter((post) => post && post.videoSrc);
    };

    const processBuzzInstagramEmbeds = () => {
      if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
        window.instgrm.Embeds.process();
      }
    };

    const waitForBuzzImages = () => {
      const images = buzzSwiperEl.querySelectorAll("img");
      const loaded = Promise.all(
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
      // Some hotlinked images never fire load/error — don't block forever.
      const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
      return Promise.race([loaded, timeout]);
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
      startBuzzMarquee();
    };

    // Prefer FeedPane's autoplaying reel videos; fall back to SociableKit's
    // static thumbnails if no video posts are available. No static fallback.
    const tryLiveFeed = () => {
      const videoPosts = getFeedpaneVideoPosts();
      if (videoPosts.length >= 2) {
        buzzWrapper.innerHTML = "";
        buzzOriginalSlides = videoPosts.map((post) =>
          buildFeedpaneVideoSlide(post.videoSrc, post.poster, post.likes)
        );
        buzzOriginalSlides.forEach((slide) => buzzWrapper.appendChild(slide));
        waitForBuzzImages().then(initBuzzMarquee);
        return;
      }
      const posts = getSociablekitPosts();
      if (posts.length >= 2) {
        buzzWrapper.innerHTML = "";
        buzzOriginalSlides = posts.map((post) =>
          buildSociablekitSlide(post.src, post.likes)
        );
        buzzOriginalSlides.forEach((slide) => buzzWrapper.appendChild(slide));
        waitForBuzzImages().then(initBuzzMarquee);
        return;
      }
      setTimeout(tryLiveFeed, 400);
    };

    tryLiveFeed();

    // Some FeedPane reel videos/posters fail to load (expired CDN links).
    // Remove that slide (and its marquee clones) instead of showing a blank card.
    buzzWrapper.addEventListener(
      "error",
      (event) => {
        const slide = event.target.closest(".bikano-buzz__slide");
        if (slide) slide.remove();
      },
      true
    );

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
