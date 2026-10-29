/* MiniBiz — общая логика страниц: навигация, направления, каталог, страница продукта. */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";

  /* Набор иконок товаров и направлений. Все иконки нарисованы вручную
     (штриховые, 24x24). */
  var ICONS = {
    percent: '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M19 5 5 19"/>',
    text: '<path d="M4 6h16M4 12h10M4 18h13"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    shield: '<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    code: '<path d="M9 6 3 12l6 6M15 6l6 6-6 6"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    desktop: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    camera: '<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/>',
    toolbox: '<rect x="3" y="8" width="18" height="11" rx="2"/><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    drive: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    gamepad: '<rect x="2" y="8" width="20" height="10" rx="4"/><path d="M7 11v4M5 13h4M16.5 12h.01M18.5 14.5h.01"/>',
    block: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    sparkles: '<path d="M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7z"/><path d="M17.5 15.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z"/>',
    wand: '<path d="M4 20 15 9"/><path d="M13 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM18 11l.7 1.5 1.5.7-1.5.7-.7 1.5-.7-1.5-1.5-.7 1.5-.7z"/>',
    table: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 10v9M15 10v9"/>',
    swap: '<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 11h11L21 7H6"/>',
    flag: '<path d="M5 21V4"/><path d="M5 5h11l-1.5 4L16 13H5z"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 8a3 3 0 0 1 0 6M17 20a5 5 0 0 0-1.5-3.4"/>'
  };

  /* Безопасный доступ к словарю: читаем только собственные ключи.
     Ключи вроде "constructor", "__proto__" или "toString" унаследованы от
     Object.prototype и не должны попадать в разметку или CSS-классы. */
  function own(map, key, fallback) {
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : fallback;
  }

  /* Необязательная подпись кнопки из данных товара.
     Если поле не задано или задано не строкой, используется прежний текст —
     поэтому старые товары выглядят ровно как раньше. */
  function labelOr(value, fallback) {
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  function iconSvg(name) {
    var body = own(ICONS, name, ICONS.code);
    // В разметку уходит только строка — значения из цепочки прототипов отсеиваются.
    if (typeof body !== "string") body = ICONS.code;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + "</svg>";
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getProducts() {
    return Array.isArray(window.MINIBIZ_PRODUCTS) ? window.MINIBIZ_PRODUCTS : [];
  }

  function getDirections() {
    return Array.isArray(window.MINIBIZ_DIRECTIONS) ? window.MINIBIZ_DIRECTIONS : [];
  }

  /* ---------- Статус товара ----------
     Канонические значения: "ready" (готов и проверен), "wip" (работа ведётся),
     "idea" (пока только идея). Значения из ранних версий данных
     ("free" / "soon" / "paid") продолжают читаться через таблицу синонимов. */
  var STATUS_DEFAULT = "wip";
  var STATUS_ALIASES = { free: "ready", soon: "wip", paid: "ready" };
  var STATUS_LABEL = { ready: "Готов", wip: "В разработке", idea: "Скоро" };
  var STATUS_CLASS = { ready: "badge-ready", wip: "badge-soon", idea: "badge-idea" };

  /* Возвращает только один из трёх известных ключей: неизвестное или
     унаследованное значение приводится к безопасному значению по умолчанию. */
  function statusKey(product) {
    var raw = String((product && product.status) || "");
    var key = own(STATUS_ALIASES, raw, raw);
    var known = typeof key === "string" &&
      Object.prototype.hasOwnProperty.call(STATUS_LABEL, key) &&
      typeof STATUS_LABEL[key] === "string";
    return known ? key : STATUS_DEFAULT;
  }

  function isReady(product) { return statusKey(product) === "ready"; }

  function statusBadge(product) {
    var key = statusKey(product);
    var cls = own(STATUS_CLASS, key, "badge-soon");
    var label = own(STATUS_LABEL, key, "В разработке");
    if (typeof cls !== "string") cls = "badge-soon";
    if (typeof label !== "string") label = "В разработке";
    return '<span class="badge ' + cls + '">' + label + "</span>";
  }

  function priceLabel(product) {
    if (!isReady(product)) return '<span class="price-soon">Цена появится позже</span>';
    if (typeof product.price === "number" && product.price > 0) {
      return '<span class="price">' + product.price.toLocaleString("ru-RU") + " ₽</span>";
    }
    return '<span class="price price-free">Бесплатно</span>';
  }

  function renderCard(product) {
    var article = document.createElement("article");
    article.className = "card product-card reveal";
    article.innerHTML =
      '<div class="thumb">' + iconSvg(product.icon) + "</div>" +
      '<div class="product-card-body">' +
        "<h3>" + escapeHtml(product.name) + "</h3>" +
        '<p class="short">' + escapeHtml(product.short || "") + "</p>" +
        '<div class="card-foot">' +
          '<div class="card-foot-badges">' +
            priceLabel(product) + statusBadge(product) +
          "</div>" +
          '<a class="btn btn-ghost btn-sm" href="product.html?id=' +
            encodeURIComponent(product.id) + '">Подробнее</a>' +
        "</div>" +
      "</div>";
    return article;
  }

  /* ---------- Карточка направления ---------- */
  function directionCounts(key) {
    var counts = { ready: 0, wip: 0, idea: 0 };
    getProducts().forEach(function (p) {
      if (p.direction !== key) return;
      counts[statusKey(p)] += 1;
    });
    return counts;
  }

  function renderDirectionCard(direction) {
    var counts = directionCounts(direction.key);
    var href = safeUrl(direction.url) || "catalog.html";
    var article = document.createElement("article");
    article.className = "card direction-card reveal";
    article.innerHTML =
      '<div class="direction-icon">' + iconSvg(direction.icon) + "</div>" +
      "<h3>" + escapeHtml(direction.name) + "</h3>" +
      '<p class="direction-tagline">' + escapeHtml(direction.tagline) + "</p>" +
      '<p class="short">' + escapeHtml(direction.description) + "</p>" +
      '<div class="direction-counts">' +
        '<span class="badge badge-ready">Готов: ' + counts.ready + "</span>" +
        '<span class="badge badge-soon">В разработке: ' + counts.wip + "</span>" +
        '<span class="badge badge-idea">Скоро: ' + counts.idea + "</span>" +
      "</div>" +
      '<a class="btn btn-ghost btn-sm" href="' + escapeHtml(href) + '">Смотреть направление</a>';
    return article;
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Проверка URL перед подстановкой в href.
     Разрешено: относительный путь внутри сайта (в том числе от корня) и
     абсолютный https-адрес. Запрещено: javascript:, data:, vbscript:, file:,
     протокол-относительные ("//чужой-хост"), а также строки с пробелами,
     управляющими символами или обратными слэшами.
     Возвращает безопасный URL либо null. HTML-экранирование — это НЕ проверка
     схемы: escapeHtml защищает от выхода из атрибута, но оставляет javascript:. */
  function safeUrl(value) {
    if (typeof value !== "string") return null;
    var url = value.trim();
    if (!url) return null;
    if (/[\u0000-\u001F\u007F\s\\]/.test(url)) return null;
    var scheme = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(url);
    if (scheme) return scheme[1].toLowerCase() === "https" ? url : null;
    // Без схемы: "//хост" — это другой сайт, а не путь внутри проекта.
    if (url.slice(0, 2) === "//") return null;
    return url;
  }

  /* ---------- Мобильное меню ---------- */
  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#primary-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Направления на главной ---------- */
  function initDirections() {
    var host = $("#directions-grid");
    if (!host) return;
    getDirections().forEach(function (d) { host.appendChild(renderDirectionCard(d)); });
    observeReveal(host);
  }

  /* ---------- Каталог на главной ---------- */
  function initFeatured() {
    var host = $("#featured-products");
    if (!host) return;
    var products = getProducts().filter(isReady).slice(0, 3);
    products.forEach(function (p) { host.appendChild(renderCard(p)); });
  }

  function initLatest() {
    var host = $("#latest-products");
    if (!host) return;
    // Раздел показывает только то, что уже в разработке: идеи — не «в разработке».
    var products = getProducts().filter(function (p) {
      return statusKey(p) === "wip";
    }).slice(0, 3);
    if (!products.length) {
      host.innerHTML = '<div class="empty-state">Новые продукты появятся здесь после проверки.</div>';
      return;
    }
    products.forEach(function (p) { host.appendChild(renderCard(p)); });
  }

  /* ---------- Каталог (catalog.html) ---------- */
  function initCatalog() {
    var host = $("#catalog-grid");
    if (!host) return;

    var search = $("#catalog-search");
    var counter = $("#catalog-count");
    var products = getProducts();
    var directions = getDirections();

    // Фильтры можно задать ссылкой: catalog.html?direction=web&category=Сайты
    var params = new URLSearchParams(window.location.search);
    var activeDirection = params.get("direction") || "all";
    var activeCategory = params.get("category") || "all";
    var query = "";

    // Категории и направления строятся из данных — новые появятся автоматически.
    var categories = [];
    products.forEach(function (p) {
      if (categories.indexOf(p.category) === -1) categories.push(p.category);
    });

    function addChips(hostId, attr, items) {
      var chipHost = $(hostId);
      if (!chipHost) return;
      items.forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset[attr] = item.value;
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = item.label;
        chipHost.appendChild(btn);
      });
    }

    addChips("#direction-chips", "direction",
      [{ value: "all", label: "Все" }].concat(directions.map(function (d) {
        return { value: d.key, label: d.name };
      })));
    addChips("#category-chips", "category",
      [{ value: "all", label: "Все" }].concat(categories.map(function (c) {
        return { value: c, label: c };
      })));

    var dirChips = $$("[data-direction]");
    var catChips = $$("[data-category]");

    // Если значение из ссылки не совпало ни с одним чипом, показываем «Все».
    if (!dirChips.some(function (c) { return c.dataset.direction === activeDirection; })) {
      activeDirection = "all";
    }
    if (!catChips.some(function (c) { return c.dataset.category === activeCategory; })) {
      activeCategory = "all";
    }

    function press(nodes, active) {
      nodes.forEach(function (c) {
        c.setAttribute("aria-pressed", c === active ? "true" : "false");
      });
    }

    dirChips.forEach(function (chip) {
      if (chip.dataset.direction === activeDirection) chip.setAttribute("aria-pressed", "true");
      chip.addEventListener("click", function () {
        activeDirection = chip.dataset.direction;
        press(dirChips, chip);
        render();
      });
    });
    catChips.forEach(function (chip) {
      if (chip.dataset.category === activeCategory) chip.setAttribute("aria-pressed", "true");
      chip.addEventListener("click", function () {
        activeCategory = chip.dataset.category;
        press(catChips, chip);
        render();
      });
    });

    function matches(product) {
      if (activeDirection !== "all" && product.direction !== activeDirection) return false;
      if (activeCategory !== "all" && product.category !== activeCategory) return false;
      if (!query) return true;
      var hay = (product.name + " " + product.short + " " + product.category).toLowerCase();
      return hay.indexOf(query) !== -1;
    }

    function render() {
      host.innerHTML = "";
      var list = products.filter(matches);
      if (!list.length) {
        host.innerHTML = '<div class="empty-state">Ничего не найдено. Попробуйте изменить запрос ' +
          "или выбрать другую категорию.</div>";
      } else {
        list.forEach(function (p) { host.appendChild(renderCard(p)); });
      }
      if (counter) {
        counter.textContent = "Найдено: " + list.length + " из " + products.length;
      }
      observeReveal(host);
    }

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim().toLowerCase();
        render();
      });
    }

    render();
  }

  /* ---------- Страница продукта ---------- */
  function initProductPage() {
    var host = $("#product-root");
    if (!host) return;

    var id = new URLSearchParams(window.location.search).get("id");
    var product = getProducts().filter(function (p) { return p.id === id; })[0];

    if (!product) {
      host.innerHTML =
        '<div class="empty-state"><h2>Продукт не найден</h2>' +
        '<p>Возможно, ссылка устарела.</p>' +
        '<a class="btn btn-primary" href="catalog.html">Перейти в каталог</a></div>';
      document.title = "Продукт не найден — MiniBiz";
      return;
    }

    document.title = product.name + " — MiniBiz";

    var key = statusKey(product);
    var direction = getDirections().filter(function (d) {
      return d.key === product.direction;
    })[0];

    var hasPrice = typeof product.price === "number" && product.price > 0;
    var actions = "";
    if (key === "ready") {
      // Ссылки собираем только из проверенных URL: непроверенный не становится ссылкой.
      var downloadHref = safeUrl(product.download);
      var pageHref = safeUrl(product.url);

      var downloadText = labelOr(product.downloadLabel, "Скачать программу");
      var pageText = labelOr(product.urlLabel,
        downloadHref ? "Открыть страницу программы" : "Открыть инструмент");

      if (downloadHref) {
        actions +=
          '<a class="btn btn-primary" href="' + escapeHtml(downloadHref) + '" download>' +
            escapeHtml(downloadText) + "</a>";
      }
      if (pageHref) {
        actions +=
          '<a class="btn ' + (downloadHref ? "btn-ghost" : "btn-primary") + '" href="' +
            escapeHtml(pageHref) + '">' + escapeHtml(pageText) + "</a>";
      }
      if (!downloadHref && !pageHref) {
        // Безопасное состояние: активных ссылок нет, только кнопка-заглушка и каталог.
        actions =
          '<button class="btn btn-primary" type="button" disabled>Ссылка недоступна</button>' +
          '<a class="btn btn-ghost" href="catalog.html">Другие продукты</a>';
      }
    } else {
      // Товара ещё нет — активной ссылки на скачивание быть не может.
      actions =
        '<button class="btn btn-primary" type="button" disabled>' +
          (key === "wip" ? "Скоро будет доступно" : "Появится позже") + "</button>" +
        '<a class="btn btn-ghost" href="catalog.html">Другие продукты</a>';
    }

    var directionHtml = direction
      ? '<span>Направление: <a href="' + escapeHtml(safeUrl(direction.url) || "catalog.html") +
        '">' + escapeHtml(direction.name) + "</a></span>"
      : "";

    var panel = "";
    if (key === "ready") {
      panel = '<div class="price-big">' +
          (hasPrice ? product.price.toLocaleString("ru-RU") + " ₽" : "Бесплатно") + "</div>" +
        '<div class="price-note">' +
          (hasPrice
            ? "Оплата на сайте пока не подключена."
            : "Скачивание без регистрации и без оплаты.") + "</div>";
    } else if (key === "wip") {
      panel = '<div class="price-big is-soon">В разработке</div>' +
        '<div class="price-note">Продукт ещё не опубликован. Цена будет объявлена позже.</div>';
    } else {
      panel = '<div class="price-big is-soon">Скоро</div>' +
        '<div class="price-note">Направление запланировано: готового продукта пока нет.</div>';
    }

    function list(items, numbered) {
      if (!items || !items.length) return "<p>Информация уточняется.</p>";
      return '<ul class="spec-list' + (numbered ? " numbered" : "") + '">' +
        items.map(function (i) { return "<li>" + escapeHtml(i) + "</li>"; }).join("") + "</ul>";
    }

    host.innerHTML =
      '<div class="product-head">' +
        "<div>" +
          '<div class="product-title-row">' +
            "<h1>" + escapeHtml(product.name) + "</h1>" + statusBadge(product) +
          "</div>" +
          '<div class="product-meta">' +
            "<span>Категория: " + escapeHtml(product.category) + "</span>" +
            directionHtml +
            "<span>Версия: " + escapeHtml(product.version) + "</span>" +
          "</div>" +
          "<p>" + escapeHtml(product.description) + "</p>" +
          '<div class="product-actions">' + actions + "</div>" +
        "</div>" +
        '<aside class="buy-panel">' + panel +
          '<a class="btn btn-ghost btn-sm" href="help.html">Как установить</a>' +
        "</aside>" +
      "</div>" +

      '<section class="section">' +
        "<h2>Возможности</h2>" + list(product.features) +
      "</section>" +
      '<section class="section">' +
        "<h2>Системные требования</h2>" + list(product.requirements) +
      "</section>" +
      '<section class="section">' +
        "<h2>Инструкция</h2>" + list(product.instructions, true) +
      "</section>" +
      '<p><a href="catalog.html">← Вернуться в каталог</a></p>';
  }

  /* ---------- Плавное появление блоков ---------- */
  var observer = null;

  function observeReveal(root) {
    var nodes = $$(".reveal:not(.is-visible)", root || document);
    if (!nodes.length) return;

    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -40px 0px", threshold: 0.05 });
    }
    nodes.forEach(function (n) { observer.observe(n); });

    // Страховка: если наблюдатель по какой-то причине не сработал
    // (старый браузер, печать, отключённые анимации), показываем блоки принудительно.
    window.setTimeout(function () {
      $$(".reveal:not(.is-visible)").forEach(function (n) { n.classList.add("is-visible"); });
    }, 1200);
  }

  /* ---------- Год в футере ---------- */
  function initYear() {
    var el = $("#footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initDirections();
    initFeatured();
    initLatest();
    initCatalog();
    initProductPage();
    initYear();
    observeReveal(document);
  });
})();
