/* MiniBiz — логика браузерных инструментов.
 * Все расчёты выполняются локально, без сетевых запросов. */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : 0; }

  /* Формат денег: 1 275,00 ₽ */
  function money(value) {
    return value.toLocaleString("ru-RU", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " \u20BD";
  }

  function setError(input, errorEl, message) {
    if (errorEl) errorEl.textContent = message || "";
    if (input) {
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  }

  /* ============================================================
     Инструмент 1. Калькулятор комиссии
     ============================================================ */
  function initCommission() {
    var priceEl = $("price");
    if (!priceEl) return;

    var feeEl = $("fee-percent");
    var priceError = $("price-error");
    var feeError = $("fee-error");
    var feeSum = $("result-fee");
    var netSum = $("result-net");
    var percentNote = $("result-percent");

    function recalc() {
      var priceRaw = priceEl.value.trim().replace(",", ".");
      var feeRaw = feeEl.value.trim().replace(",", ".");
      var price = Number(priceRaw);
      var fee = Number(feeRaw);

      var priceOk = priceRaw !== "" && isFinite(price) && price >= 0;
      var feeOk = feeRaw !== "" && isFinite(fee) && fee >= 0 && fee <= 100;

      setError(priceEl, priceError,
        priceRaw === "" ? "" : priceOk ? "" : "Введите цену числом, не меньше 0.");
      setError(feeEl, feeError,
        feeRaw === "" ? "" : feeOk ? "" : "Комиссия должна быть числом от 0 до 100.");

      if (!priceOk || !feeOk) {
        feeSum.textContent = "—";
        netSum.textContent = "—";
        if (percentNote) percentNote.textContent = "";
        return;
      }

      var feeAmount = price * fee / 100;
      // Округление до копеек, чтобы сумма частей всегда сходилась с итогом.
      feeAmount = Math.round(feeAmount * 100) / 100;
      var net = Math.round((price - feeAmount) * 100) / 100;

      feeSum.textContent = money(feeAmount);
      netSum.textContent = money(net);
      if (percentNote) {
        percentNote.textContent = "Комиссия " + fee + "% от цены " + money(price);
      }
    }

    on(priceEl, "input", recalc);
    on(feeEl, "input", recalc);
    recalc();
  }

  /* ============================================================
     Инструмент 2. Генератор описаний товаров
     ============================================================ */
  function initDescription() {
    var nameEl = $("product-name");
    if (!nameEl) return;

    var purposeEl = $("product-purpose");
    var featuresEl = $("product-features");
    var errorEl = $("desc-error");
    var outputEl = $("desc-output");
    var copyBtn = $("copy-desc");
    var clearBtn = $("clear-desc");
    var statusEl = $("copy-status");

    function splitFeatures(raw) {
      return raw
        .split(/\r?\n|;/)
        .map(function (line) { return line.replace(/^[-•*\u2022\s]+/, "").trim(); })
        .filter(function (line) { return line.length > 0; });
    }

    function generate() {
      var name = nameEl.value.trim();
      var purpose = purposeEl.value.trim();
      var features = splitFeatures(featuresEl.value);

      var errors = [];
      if (name.length < 2) errors.push("название");
      if (purpose.length < 5) errors.push("назначение");
      if (!features.length) errors.push("хотя бы одну функцию");

      var invalid = [];
      if (name.length < 2) invalid.push(nameEl);
      if (purpose.length < 5) invalid.push(purposeEl);
      if (!features.length) invalid.push(featuresEl);

      [nameEl, purposeEl, featuresEl].forEach(function (el) {
        el.removeAttribute("aria-invalid");
      });
      invalid.forEach(function (el) { el.setAttribute("aria-invalid", "true"); });

      if (errors.length) {
        errorEl.textContent = "Заполните: " + errors.join(", ") + ".";
        return null;
      }
      errorEl.textContent = "";

      var lines = [];
      lines.push(name);
      lines.push("");
      lines.push(purpose);
      lines.push("");
      lines.push("Что умеет:");
      features.forEach(function (f) { lines.push("• " + f); });
      lines.push("");
      lines.push("Как пользоваться:");
      lines.push("1. Откройте программу.");
      lines.push("2. Подготовьте нужные данные.");
      lines.push("3. Следуйте подсказкам на экране.");
      return lines.join("\n");
    }

    on($("generate-desc"), "click", function () {
      var text = generate();
      if (text !== null) {
        outputEl.textContent = text;
        statusEl.textContent = "";
      }
    });

    on(clearBtn, "click", function () {
      [nameEl, purposeEl, featuresEl].forEach(function (el) {
        el.value = "";
        el.removeAttribute("aria-invalid");
      });
      outputEl.textContent = "";
      errorEl.textContent = "";
      statusEl.textContent = "";
      nameEl.focus();
    });

    on(copyBtn, "click", function () {
      var text = outputEl.textContent;
      if (!text || text.indexOf("Здесь появится") !== -1) {
        statusEl.style.color = "var(--danger)";
        statusEl.textContent = "Сначала сгенерируйте описание.";
        return;
      }
      copyText(text).then(function (ok) {
        statusEl.style.color = ok ? "var(--accent)" : "var(--danger)";
        statusEl.textContent = ok ? "Скопировано." : "Не удалось скопировать — выделите текст вручную.";
      });
    });
  }

  /* Копирование с запасным вариантом для file:// и старых браузеров. */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; })
        .catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    var ok = false;
    try {
      area.select();
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  /* ============================================================
     Инструмент 3. Анализатор текста
     ============================================================ */
  function initTextAnalyzer() {
    var textEl = $("analyzer-text");
    if (!textEl) return;

    var charsEl = $("stat-chars");
    var charsNoSpaceEl = $("stat-chars-nospace");
    var wordsEl = $("stat-words");
    var linesEl = $("stat-lines");

    function analyze() {
      var text = textEl.value;
      var chars = Array.from(text).length;
      var noSpace = Array.from(text.replace(/\s/g, "")).length;
      var words = text.trim() === "" ? 0 : text.trim().split(/\s+/).filter(Boolean).length;
      var lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;

      charsEl.textContent = String(chars);
      charsNoSpaceEl.textContent = String(noSpace);
      wordsEl.textContent = String(words);
      linesEl.textContent = String(lines);
    }

    on(textEl, "input", analyze);
    analyze();
  }

  /* ============================================================
     Формы инструментов
     ============================================================ */
  /* Раньше у форм стоял атрибут onsubmit="return false;" — встроенный
     обработчик. Теперь он не нужен: запрет отправки вешается здесь, чтобы
     CSP работала без 'unsafe-inline'. */
  function initForms() {
    var forms = document.querySelectorAll("form");
    Array.prototype.forEach.call(forms, function (form) {
      form.addEventListener("submit", function (event) {
        // Инструменты считают на клиенте: отправлять форму никуда не нужно.
        event.preventDefault();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initForms();
    initCommission();
    initDescription();
    initTextAnalyzer();
  });
})();
