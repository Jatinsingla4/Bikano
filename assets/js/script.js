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
});
