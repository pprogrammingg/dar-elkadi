(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const SECTION_META = {
    Appetizers: {
      id: "appetizers",
      ar: "المقبلات",
      image: "assets/olives.png?v=1",
      art: "tr",
      layout: "split-end",
    },
    "Main Menu": {
      id: "main-menu",
      ar: "الأطباق الرئيسية",
      image: "assets/tagine.png?v=1",
      art: "bl",
      layout: "split",
    },
    Desserts: {
      id: "desserts",
      ar: "الحلويات",
      image: "assets/dessert.png?v=2",
      art: "br",
      layout: "split-end",
    },
    Beverages: {
      id: "beverages",
      ar: "المشروبات",
      image: "assets/drinks.png?v=1",
      art: "bl",
      layout: "split",
    },
  };

  const slug = (value) =>
    String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const formatPrice = (item) => {
    const bits = [];
    if (item.price != null) {
      let line = `$${item.price}`;
      if (item.price_note === "per person") line += " / p";
      else if (item.price_note) line += ` · ${item.price_note}`;
      bits.push(line);
    }
    if (item.price_per_person != null) {
      bits.push(`$${item.price_per_person} / p`);
    }
    return bits.join(" · ");
  };

  const padNum = (n) => String(n).padStart(2, "0");

  const buildOverview = (menu) => {
    const grid = $("overview-grid");
    if (!grid) return;
    grid.replaceChildren(
      ...menu.map((section, index) => {
        const meta = SECTION_META[section.section] || {
          id: slug(section.section),
          ar: "",
        };
        const link = document.createElement("a");
        link.className = "overview-col";
        link.href = `#${meta.id}`;

        const num = document.createElement("span");
        num.className = "overview-num";
        num.textContent = padNum(index + 1);

        const title = document.createElement("h2");
        title.textContent = section.section;

        link.append(num, title);

        if (meta.ar) {
          const ar = document.createElement("p");
          ar.className = "ar";
          ar.lang = "ar";
          ar.dir = "rtl";
          ar.textContent = meta.ar;
          link.append(ar);
        }

        return link;
      })
    );
  };

  const buildChapters = (menu) => {
    const host = $("menu-chapters");
    if (!host) return [];

    const nodes = [];
    menu.forEach((section, index) => {
      const meta = SECTION_META[section.section] || {
        id: slug(section.section),
        ar: "",
        image: "",
        art: "br",
      };

      if (index > 0) {
        const sep = document.createElement("div");
        sep.className = "menu-section-sep";
        sep.setAttribute("role", "separator");
        sep.setAttribute("aria-hidden", "true");
        nodes.push(sep);
      }

      const chapter = document.createElement("section");
      chapter.className = "chapter";
      const isSplit =
        meta.layout === "split" || meta.layout === "split-end";
      if (meta.layout === "split") chapter.classList.add("chapter--split");
      if (meta.layout === "split-end") {
        chapter.classList.add("chapter--split", "chapter--split-end");
      }
      chapter.id = meta.id;
      chapter.dataset.chapter = padNum(index + 1);

      const appendMedia = () => {
        if (!meta.image || !isSplit) return;
        const media = document.createElement("div");
        media.className = "chapter-media";
        media.setAttribute("aria-hidden", "true");
        const art = document.createElement("img");
        art.className = "chapter-art chapter-art--fill";
        if (meta.fit === "contain") {
          art.classList.add("chapter-art--contain");
        }
        art.src = meta.image;
        art.alt = "";
        art.loading = "lazy";
        art.decoding = "async";
        media.append(art);
        chapter.append(media);
      };

      if (meta.image && !isSplit) {
        const art = document.createElement("img");
        art.className = `chapter-art chapter-art--${meta.art || "br"}`;
        art.src = meta.image;
        art.alt = "";
        art.loading = "lazy";
        art.decoding = "async";
        art.setAttribute("aria-hidden", "true");
        chapter.append(art);
      }

      /* Main Menu: media left; Appetizers (split-end): media after content */
      if (meta.layout === "split") appendMedia();

      const inner = document.createElement("div");
      inner.className = "chapter-inner";

      const copy = document.createElement("div");
      copy.className = "chapter-copy";

      const num = document.createElement("p");
      num.className = "chapter-num";
      num.textContent = padNum(index + 1);

      const h2 = document.createElement("h2");
      h2.append(document.createTextNode(section.section));
      if (meta.ar) {
        const ar = document.createElement("span");
        ar.className = "ar";
        ar.lang = "ar";
        ar.dir = "rtl";
        ar.textContent = meta.ar;
        h2.append(ar);
      }

      copy.append(num, h2);
      inner.append(copy);

      const list = document.createElement("ul");
      list.className = "dish-list";

      section.items.forEach((item) => {
        const li = document.createElement("li");
        li.className = "dish";
        li.id = slug(item.item_name);

        const row = document.createElement("div");
        row.className = "dish-row";

        const h3 = document.createElement("h3");
        h3.textContent = item.item_name;
        row.append(h3);

        const price = formatPrice(item);
        if (price) {
          const priceEl = document.createElement("p");
          priceEl.className = "dish-price";
          priceEl.textContent = price;
          row.append(priceEl);
        }

        li.append(row);

        if (item.description) {
          const desc = document.createElement("p");
          desc.textContent = item.description;
          li.append(desc);
        }

        list.append(li);
      });

      inner.append(list);
      chapter.append(inner);
      if (meta.layout === "split-end") appendMedia();
      nodes.push(chapter);
    });

    host.replaceChildren(...nodes);
    return menu.map((section, index) => {
      const meta = SECTION_META[section.section] || {
        id: slug(section.section),
      };
      return {
        id: meta.id,
        float: `${padNum(index + 1)} ${section.section}`,
      };
    });
  };

  const YT_VIDEO_ID = "Cnsjxcp-EsY";
  const YT_WATCH = `https://www.youtube.com/watch?v=${YT_VIDEO_ID}`;

  const loadYouTubeApi = () =>
    new Promise((resolve, reject) => {
      if (window.YT?.Player) {
        resolve();
        return;
      }

      let settled = false;
      const finish = (err) => {
        if (settled) return;
        settled = true;
        clearInterval(poll);
        if (err) reject(err);
        else resolve();
      };

      const prior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prior === "function") prior();
        if (window.YT?.Player) finish();
      };

      if (!document.querySelector("script[data-yt-api]")) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        tag.dataset.ytApi = "1";
        tag.onerror = () => finish(new Error("YouTube API failed to load"));
        document.head.appendChild(tag);
      }

      const started = Date.now();
      const poll = setInterval(() => {
        if (window.YT?.Player) finish();
        else if (Date.now() - started > 12000) {
          finish(new Error("YouTube API timeout"));
        }
      }, 40);
    });

  const bindHeroVideo = () => {
    const wrap = $("hero-logo-wrap");
    const logo = $("hero-logo");
    const video = $("hero-video");
    const closeBtn = $("hero-video-close");
    const hero = $("home");
    if (!wrap || !logo || !video) return () => {};

    const PRELOAD_READY = 0.14;
    const PRELOAD_MAX_MS = 9000;

    let player = null;
    let starting = false;
    let closeArmed = true;
    let muted = true;
    let shuttingDown = false;
    let preloading = false;
    let revealed = false;
    let preloadPoll = 0;
    let preloadStartedAt = 0;

    const slowLink = () => {
      const net = navigator.connection;
      if (!net) return false;
      if (net.saveData) return true;
      return /^(slow-2g|2g)$/i.test(net.effectiveType || "");
    };

    const heroVisibleEnough = () => {
      if (!hero) return true;
      const rect = hero.getBoundingClientRect();
      const view = Math.min(rect.height, window.innerHeight);
      const visible =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      return view > 0 ? visible / view > 0.55 : false;
    };

    const loadedFraction = () => {
      try {
        return player?.getVideoLoadedFraction?.() ?? 0;
      } catch {
        return 0;
      }
    };

    const showLogo = () => {
      shuttingDown = false;
      preloading = false;
      revealed = false;
      starting = false;
      if (preloadPoll) {
        clearInterval(preloadPoll);
        preloadPoll = 0;
      }
      wrap.classList.remove("is-playing", "is-preloading");
      video.classList.remove("is-preloading");
      wrap.style.opacity = "";
      wrap.setAttribute("aria-label", "Play Dar Elkadi film");
      wrap.tabIndex = 0;
      video.hidden = true;
      logo.hidden = false;
      if (player) {
        try {
          player.destroy();
        } catch {
          /* ignore */
        }
        player = null;
      }
      video.replaceChildren();
      if (closeBtn) video.append(closeBtn);
    };

    const unmute = () => {
      if (!player) return;
      try {
        player.unMute();
        player.setVolume(100);
        muted = false;
        wrap.setAttribute("aria-label", "Dar Elkadi film playing");
      } catch {
        /* ignore */
      }
    };

    const revealFilm = ({ withSound = false } = {}) => {
      if (revealed) {
        if (withSound && muted) unmute();
        return;
      }
      revealed = true;
      preloading = false;
      if (preloadPoll) {
        clearInterval(preloadPoll);
        preloadPoll = 0;
      }

      muted = !withSound;
      wrap.style.opacity = "";
      wrap.classList.remove("is-preloading");
      wrap.classList.add("is-playing");
      video.classList.remove("is-preloading");
      video.hidden = false;
      logo.hidden = true;
      wrap.tabIndex = -1;
      wrap.setAttribute(
        "aria-label",
        withSound
          ? "Dar Elkadi film playing"
          : "Dar Elkadi film playing (muted — tap for sound)"
      );

      try {
        player?.mute?.();
        if (withSound) {
          player?.unMute?.();
          player?.setVolume?.(100);
        }
        player?.seekTo?.(0, true);
        player?.playVideo?.();
      } catch {
        /* ignore */
      }

      closeArmed = true;
      if (closeBtn) closeBtn.style.pointerEvents = "";
      starting = false;
    };

    const mountPlayer = ({ withSound = false, preload = false } = {}) => {
      starting = true;
      closeArmed = false;
      shuttingDown = false;
      muted = !withSound;

      const mount = document.createElement("div");
      mount.id = "hero-yt-player";
      mount.className = "hero-yt-frame";
      video.replaceChildren(mount);
      if (closeBtn) {
        closeBtn.style.pointerEvents = "none";
        video.append(closeBtn);
      }

      loadYouTubeApi()
        .then(() => {
          player = new window.YT.Player(mount, {
            videoId: YT_VIDEO_ID,
            width: "100%",
            height: "100%",
            playerVars: {
              autoplay: 1,
              mute: 1,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event) => {
                try {
                  event.target.mute();
                  event.target.playVideo();
                } catch {
                  /* ignore */
                }
                if (!preload) revealFilm({ withSound });
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.ENDED && revealed) {
                  showLogo();
                }
              },
              onError: () => showLogo(),
            },
          });
        })
        .catch(() => showLogo())
        .finally(() => {
          if (!preload) {
            window.setTimeout(() => {
              closeArmed = true;
              if (closeBtn) closeBtn.style.pointerEvents = "";
              starting = false;
            }, 700);
          }
        });
    };

    const playFilm = ({ withSound = false, preload = false } = {}) => {
      if (revealed && wrap.classList.contains("is-playing")) {
        if (withSound && muted) unmute();
        return;
      }

      if (window.location.protocol === "file:") {
        window.open(YT_WATCH, "_blank", "noopener");
        return;
      }

      /* Preload already running — tap skips the wait and plays with sound */
      if (preloading && player) {
        revealFilm({ withSound: true });
        return;
      }
      if (starting) return;

      if (preload) {
        preloading = true;
        revealed = false;
        preloadStartedAt = Date.now();
        wrap.classList.add("is-preloading");
        video.classList.add("is-preloading");
        video.hidden = false;
        logo.hidden = false;
        mountPlayer({ withSound: false, preload: true });

        preloadPoll = window.setInterval(() => {
          if (!preloading || revealed) {
            clearInterval(preloadPoll);
            preloadPoll = 0;
            return;
          }
          if (!heroVisibleEnough()) {
            showLogo();
            return;
          }
          const frac = loadedFraction();
          const waited = Date.now() - preloadStartedAt;
          if (frac >= PRELOAD_READY || (waited > PRELOAD_MAX_MS && frac > 0.04)) {
            revealFilm({ withSound: false });
          } else if (waited > PRELOAD_MAX_MS) {
            showLogo();
          }
        }, 200);
        return;
      }

      wrap.style.opacity = "";
      wrap.classList.add("is-playing");
      video.hidden = false;
      logo.hidden = true;
      wrap.tabIndex = -1;
      mountPlayer({ withSound, preload: false });
      revealed = true;
    };

    /* Fade picture + sound as the hero leaves the viewport, then stop */
    const onScrollFade = () => {
      if (preloading && !heroVisibleEnough()) {
        showLogo();
        return;
      }
      if (!wrap.classList.contains("is-playing") || !hero || shuttingDown) {
        return;
      }

      const rect = hero.getBoundingClientRect();
      const view = Math.min(rect.height, window.innerHeight);
      const visible =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = view > 0 ? clamp(visible / view, 0, 1) : 0;
      /* Full until ~75% left, then fade to 0 by ~30% */
      const fade = clamp((ratio - 0.3) / 0.45, 0, 1);

      wrap.style.opacity = String(0.15 + fade * 0.85);

      if (player && !muted) {
        try {
          player.setVolume(Math.round(fade * 100));
        } catch {
          /* ignore */
        }
      }

      if (fade <= 0.02) {
        shuttingDown = true;
        try {
          player?.pauseVideo();
        } catch {
          /* ignore */
        }
        showLogo();
      }
    };

    wrap.addEventListener("click", (event) => {
      if (event.target.closest(".hero-video-close")) return;
      if (event.target.closest("iframe, .hero-yt-frame, #hero-yt-player")) {
        return;
      }
      if (wrap.classList.contains("is-playing")) {
        if (muted) unmute();
        return;
      }
      playFilm({ withSound: true });
    });

    wrap.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (wrap.classList.contains("is-playing")) {
          if (muted) unmute();
        } else {
          playFilm({ withSound: true });
        }
      }
    });

    closeBtn?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!closeArmed) return;
      showLogo();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && wrap.classList.contains("is-playing")) {
        showLogo();
      }
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (
      !reduceMotion &&
      window.location.protocol !== "file:" &&
      !slowLink()
    ) {
      playFilm({ withSound: false, preload: true });
    }

    return onScrollFade;
  };

  const bindGallery = async () => {
    const root = $("gallery");
    const viewport = $("gallery-viewport");
    const dotsHost = $("gallery-dots");
    const hint = $("gallery-hint");
    const navLink = $("nav-gallery");
    if (!root || !viewport || !dotsHost) return false;

    const DWELL_MS = 4200;
    const ROLL_MS = 900;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    let items = [];
    try {
      const res = await fetch("assets/gallery/description.json", { cache: "no-store" });
      if (!res.ok) return false;
      items = await res.json();
    } catch {
      return false;
    }

    items = (Array.isArray(items) ? items : []).filter(
      (item) => item && item.image_name && item.description
    );
    if (!items.length) return false;

    const slides = [];
    const dots = [];
    items.forEach((item, index) => {
      const title = item.title || String(item.image_name).replace(/\.[^.]+$/, "").replace(/_/g, " ");
      const slide = document.createElement("article");
      slide.className = "gallery-slide";
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} of ${items.length}: ${title}`);
      slide.tabIndex = 0;

      const card = document.createElement("div");
      card.className = "gallery-card";

      const flip = document.createElement("div");
      flip.className = "gallery-flip";

      const front = document.createElement("div");
      front.className = "gallery-face gallery-face--front";

      const img = document.createElement("img");
      img.alt = title;
      img.decoding = "async";
      img.loading = "eager";
      img.addEventListener("load", () => {
        front.classList.add("has-photo");
      });
      img.src = `assets/gallery/${item.image_name}`;

      const fallback = document.createElement("span");
      fallback.className = "gallery-fallback";
      fallback.textContent = title;

      front.append(img, fallback);

      const back = document.createElement("div");
      back.className = "gallery-face gallery-face--back";

      const backTitle = document.createElement("p");
      backTitle.className = "gallery-back-title";
      backTitle.textContent = title;

      const backCopy = document.createElement("p");
      backCopy.className = "gallery-back-copy";
      backCopy.textContent = item.description;

      back.append(backTitle, backCopy);
      flip.append(front, back);
      card.append(flip);
      slide.append(card);
      viewport.append(slide);
      slides.push(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", `Show ${title}`);
      dotsHost.append(dot);
      dots.push(dot);
    });

    root.hidden = false;
    if (navLink) navLink.hidden = false;

    let index = 0;
    let busy = false;
    let hold = false;
    let dwellTimer = 0;
    let inView = false;
    let discovered = false;

    const current = () => slides[index];

    const markDiscovered = () => {
      if (discovered || !hint) return;
      discovered = true;
      hint.hidden = true;
    };

    const setFlipped = (on) => {
      const slide = current();
      if (!slide) return;
      slide.classList.toggle("is-flipped", on);
      slide.setAttribute("aria-pressed", String(on));
      if (on) markDiscovered();
    };

    const isFlipped = () => current()?.classList.contains("is-flipped");

    const syncDots = () => {
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    };

    const clearDwell = () => {
      if (dwellTimer) {
        clearTimeout(dwellTimer);
        dwellTimer = 0;
      }
    };

    const canAdvance = () =>
      inView &&
      !busy &&
      !hold &&
      !isFlipped() &&
      !document.hidden &&
      slides.length > 1;

    const schedule = () => {
      clearDwell();
      if (!canAdvance()) return;
      dwellTimer = window.setTimeout(() => {
        goTo((index + 1) % slides.length, 1);
      }, DWELL_MS);
    };

    const goTo = (next, direction = 0) => {
      if (busy || next === index || !slides[next]) return;
      const from = current();
      const to = slides[next];
      from.classList.remove("is-flipped");
      from.removeAttribute("aria-pressed");

      if (reduceMotion) {
        from.classList.remove("is-current");
        to.classList.add("is-current");
        index = next;
        syncDots();
        schedule();
        return;
      }

      let dir = direction;
      if (!dir) {
        const n = slides.length;
        const forward = (next - index + n) % n;
        const backward = (index - next + n) % n;
        dir = forward <= backward ? 1 : -1;
      }
      busy = true;
      clearDwell();
      to.style.transition = "none";
      to.style.transform = `translateX(${dir > 0 ? 100 : -100}%)`;
      void to.offsetWidth;
      to.style.transition = "";
      from.classList.add("is-exit");
      from.style.transform = `translateX(${dir > 0 ? -100 : 100}%)`;
      to.classList.add("is-enter");
      to.style.transform = "translateX(0)";

      const finish = () => {
        from.classList.remove("is-current", "is-exit");
        from.style.transform = "";
        to.classList.remove("is-enter");
        to.classList.add("is-current");
        to.style.transform = "";
        index = next;
        busy = false;
        syncDots();
        if (finePointer && to.matches(":hover")) setFlipped(true);
        schedule();
      };

      window.setTimeout(finish, ROLL_MS);
    };

    slides[0].classList.add("is-current");
    syncDots();

    slides.forEach((slide) => {
      slide.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse" || busy || slide !== current()) return;
        hold = true;
        clearDwell();
        setFlipped(true);
      });
      slide.addEventListener("pointerleave", (event) => {
        if (event.pointerType !== "mouse") return;
        setFlipped(false);
        hold = false;
        schedule();
      });
      slide.addEventListener("click", (event) => {
        if (event.pointerType === "mouse" || !event.pointerType) return;
        event.preventDefault();
        if (busy || slide !== current()) return;
        const next = !isFlipped();
        setFlipped(next);
        hold = next;
        if (next) clearDwell();
        else schedule();
      });
      slide.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (busy || slide !== current()) return;
        const next = !isFlipped();
        setFlipped(next);
        hold = next;
        if (next) clearDwell();
        else schedule();
      });
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        if (i === index) return;
        hold = false;
        setFlipped(false);
        goTo(i);
      });
    });

    viewport.addEventListener("focusin", () => {
      hold = true;
      clearDwell();
    });
    viewport.addEventListener("focusout", () => {
      hold = isFlipped();
      if (!hold) schedule();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearDwell();
      else schedule();
    });

    const watch = $("gallery-viewport") || root;
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((entry) => entry.isIntersecting);
          if (inView) schedule();
          else clearDwell();
        },
        { threshold: 0.2 }
      );
      io.observe(watch);
    } else {
      inView = true;
      schedule();
    }

    return true;
  };

  const boot = async () => {
    const nav = $("site-nav");
    const hero = $("home");
    const overview = $("menu");
    const floatMenu = $("float-menu");
    const dragHandle = $("float-menu-drag");
    const collapseBtn = $("float-collapse");
    const scrollBob = $("scroll-bob");
    const scrollUp = $("scroll-bob-up");
    const scrollDown = $("scroll-bob-down");
    const floatNav = floatMenu?.querySelector("nav");

    const heroVideoOnScroll = bindHeroVideo();
    const galleryReadyPromise = bindGallery();

    const embedded = () => {
      const el = $("menu-data");
      if (!el?.textContent) return [];
      try {
        return JSON.parse(el.textContent);
      } catch {
        return [];
      }
    };

    /* Overview now; chapters after first paint so hero isn't blocked */
    const menu = embedded();
    buildOverview(menu);
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r))
    );
    const chapterMeta = buildChapters(menu);
    const galleryReady = await galleryReadyPromise;

    fetch("data/menu.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((next) => {
        if (!next || JSON.stringify(next) === JSON.stringify(menu)) return;
        buildOverview(next);
        buildChapters(next);
        onScroll();
      })
      .catch(() => {
        /* file:// or offline — embedded menu already rendered */
      });

    const SECTIONS = [
      { id: "home" },
      ...(galleryReady ? [{ id: "gallery", float: "Gallery" }] : []),
      { id: "menu" },
      ...chapterMeta,
      { id: "contact", float: "Contact" },
    ];

    const floatMeta = SECTIONS.filter((s) => s.float);
    /* Look up by id each time: chapters are rebuilt when menu.json loads */
    const byIds = (list) => list.map(({ id }) => $(id)).filter(Boolean);
    const getSections = () => byIds(SECTIONS);

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      document.documentElement.style.scrollBehavior = "auto";
    }

    const floatLinks = (() => {
      if (!floatNav) return [];
      floatNav.replaceChildren(
        ...floatMeta.map(({ id, float }) => {
          const link = document.createElement("a");
          link.href = `#${id}`;
          link.dataset.target = id;
          link.textContent = float;
          return link;
        })
      );
      return [...floatNav.querySelectorAll("a[data-target]")];
    })();

    const currentIndex = () => {
      const sections = getSections();
      if (!sections.length) return 0;
      if (window.scrollY <= 8) return 0;

      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 24) {
        return sections.length - 1;
      }

      const bandTop = window.innerHeight * 0.2;
      const bandBottom = window.innerHeight * 0.55;
      let best = 0;
      let bestOverlap = -1;

      sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        const overlap =
          Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop);
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          best = i;
        }
      });
      return best;
    };

    const syncBobEnds = (index) => {
      const count = SECTIONS.length;
      if (!scrollBob || !count) return;
      const atStart = index <= 0;
      const atEnd = index >= count - 1;
      scrollBob.classList.toggle("is-start", atStart);
      scrollBob.classList.toggle("is-end", atEnd);
      if (scrollUp) {
        scrollUp.disabled = atStart;
        scrollUp.setAttribute("aria-hidden", String(atStart));
      }
      if (scrollDown) {
        scrollDown.disabled = atEnd;
        scrollDown.setAttribute("aria-hidden", String(atEnd));
      }
    };

    const syncBobTheme = () => {
      if (!scrollBob) return;
      const bob = scrollBob.getBoundingClientRect();
      const midY = bob.top + bob.height * 0.55;
      const onOlive = [
        ...document.querySelectorAll(".chapter, .menu-section-sep"),
      ].some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= midY && r.bottom >= midY;
      });
      scrollBob.classList.toggle("is-on-olive", onOlive);
    };

    const goToIndex = (index) => {
      const target = $(SECTIONS[index]?.id);
      if (!target) return;
      syncBobEnds(index);
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    };

    const activeSectionId = (list, markerRatio = 0.28) => {
      const marker = window.innerHeight * markerRatio;
      let current = list[0]?.id;
      for (const section of list) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      }
      return current;
    };

    const updateNav = () => {
      if (!nav || !hero) return;
      nav.classList.toggle(
        "is-solid",
        window.scrollY > hero.offsetHeight * 0.55
      );
    };

    const updateFloatVisibility = () => {
      if (!floatMenu || !overview) return;
      const past = overview.getBoundingClientRect().bottom < 80;
      floatMenu.classList.toggle("is-visible", past);
      document.body.classList.toggle("has-float-pad", past);
    };

    const updateSpy = () => {
      if (!floatLinks.length) return;
      const current = activeSectionId(byIds(floatMeta));
      floatLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.target === current);
      });
    };

    const updateScrollBob = () => {
      syncBobEnds(currentIndex());
      syncBobTheme();
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateNav();
        updateFloatVisibility();
        updateSpy();
        updateScrollBob();
        heroVideoOnScroll();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    scrollUp?.addEventListener("click", () => {
      const index = currentIndex();
      if (index > 0) goToIndex(index - 1);
    });

    scrollDown?.addEventListener("click", () => {
      const index = currentIndex();
      if (index < SECTIONS.length - 1) goToIndex(index + 1);
    });

    const bindDraggable = (el, handle) => {
      if (!el || !handle) return;
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let originLeft = 0;
      let originTop = 0;

      handle.addEventListener("pointerdown", (event) => {
        if (event.target.closest(".float-btn")) return;
        handle.setPointerCapture(event.pointerId);
        const rect = el.getBoundingClientRect();
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        originLeft = rect.left;
        originTop = rect.top;
        el.style.left = `${rect.left}px`;
        el.style.top = `${rect.top}px`;
        el.style.right = "auto";
        el.style.bottom = "auto";
      });

      handle.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const maxLeft = window.innerWidth - el.offsetWidth - 8;
        const maxTop = window.innerHeight - el.offsetHeight - 8;
        el.style.left = `${clamp(
          originLeft + event.clientX - startX,
          8,
          maxLeft
        )}px`;
        el.style.top = `${clamp(
          originTop + event.clientY - startY,
          8,
          maxTop
        )}px`;
      });

      const endDrag = () => {
        dragging = false;
      };
      handle.addEventListener("pointerup", endDrag);
      handle.addEventListener("pointercancel", endDrag);
    };

    if (floatMenu) {
      floatMenu.hidden = false;

      collapseBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        const collapsed = floatMenu.classList.toggle("is-collapsed");
        collapseBtn.setAttribute("aria-expanded", String(!collapsed));
        collapseBtn.textContent = collapsed ? "+" : "−";
        collapseBtn.title = collapsed ? "Expand" : "Collapse";
      });

      bindDraggable(floatMenu, dragHandle);
    }

    onScroll();

    if (location.hash) {
      const target = document.querySelector(location.hash);
      target?.scrollIntoView({ behavior: "auto", block: "start" });
    }
  };

  boot();
})();
