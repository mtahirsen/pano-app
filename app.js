// Pano tanıtım sayfası: canlı panel demosu, işletim sistemi algılama, kısayol tablosu.
(() => {
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
  let os = isMac ? "mac" : "win";

  // Uygulama simgeleri: marka logosu yerine sade çizimler
  const icons = {
    notes: '<svg viewBox="0 0 24 24"><rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4"/></svg>',
    browser: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/></svg>',
    design: '<svg viewBox="0 0 24 24"><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.3-2-.6-1.2.2-2.5 1.5-2.5h1.7a4 4 0 0 0 4-4C20.5 7.3 16.7 3.5 12 3.5Z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/></svg>',
    code: '<svg viewBox="0 0 24 24"><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 3.5V16.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5Z"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
  };

  const now = Date.now();
  const min = 60 * 1000;
  let cards = [
    { kind: "text", app: "notes", appName: "Notlar", color: "#F2B300", fg: "#2A2100", time: now - 1 * min,
      text: "Toplantı notu: Perşembe 14.00'te tedarikçiyle görüşme. Fiyat listesini ve teslim tarihlerini sor.", board: "is" },
    { kind: "link", app: "browser", appName: "Tarayıcı", color: "#2E73FF", time: now - 4 * min,
      title: "Kış koleksiyonu kataloğu", host: "ornek-magaza.com", cover: "linear-gradient(135deg,#F6D365,#FDA085)", fav: "#FF7A45" },
    { kind: "color", app: "design", appName: "Tasarım", color: "#E5484D", time: now - 9 * min, hex: "#6A00DB" },
    { kind: "code", app: "code", appName: "Kod düzenleyici", color: "#5B5BD6", time: now - 16 * min, board: "kod",
      text: "git log --oneline --graph\n  --since=\"2 weeks ago\"" },
    { kind: "image", app: "chat", appName: "Mesajlar", color: "#30A46C", time: now - 34 * min,
      img: "radial-gradient(circle at 30% 35%,#FFE29F 0 18%,transparent 19%),linear-gradient(160deg,#7FD1FF,#4C6FFF 70%,#2C2F7A)", size: "1920 × 1080" },
    { kind: "file", app: "folder", appName: "Dosyalar", color: "#8E8E93", time: now - 58 * min, name: "Teklif_2026.pdf", size: "248 KB" },
    { kind: "text", app: "mail", appName: "E-posta", color: "#0091FF", time: now - 2 * 60 * min, board: "is",
      text: "Merhaba, ekte güncel fiyat teklifimizi bulabilirsiniz. Sorunuz olursa memnuniyetle yardımcı olurum." },
  ];

  const strip = document.getElementById("strip");
  const panel = document.getElementById("panel");
  const search = document.getElementById("search");
  const toast = document.getElementById("toast");
  let cursor = 0;
  let tab = "all";
  let query = "";
  let fresh = null;

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function ago(t) {
    const d = Math.round((Date.now() - t) / min);
    if (d < 1) return "Şimdi";
    if (d < 60) return `${d} dk. önce`;
    return `${Math.round(d / 60)} sa. önce`;
  }

  function label(c) {
    return { text: "Metin", code: "Metin", link: "Bağlantı", color: "Renk", image: "Görsel", file: "Dosya" }[c.kind];
  }

  function plain(c) {
    return { link: `https://${c.host}`, color: c.hex, file: c.name, image: "" }[c.kind] ?? c.text;
  }

  function body(c) {
    switch (c.kind) {
      case "text": return `<div class="card-body">${esc(c.text)}</div>`;
      case "code": return `<div class="card-body mono">${esc(c.text)}</div>`;
      case "link": return `<div class="card-body flush"><div class="cover" style="--cv:${c.cover}"></div>
        <div class="link-meta"><span class="host"><i style="--fav:${c.fav}"></i>${esc(c.host)}</span><b>${esc(c.title)}</b></div></div>`;
      case "color": return `<div class="card-body flush"><div class="swatch" style="background:${c.hex};color:#fff">${c.hex}</div></div>`;
      case "image": return `<div class="card-body flush"><div class="picture"><span style="--img:${c.img}"></span></div></div>`;
      case "file": return `<div class="card-body flush"><div class="file"><div><svg viewBox="0 0 54 54"><path d="M14 6h18l10 10v30a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z" fill="#fff" stroke="#C9CAD6"/><path d="M32 6v8a2 2 0 0 0 2 2h8" fill="none" stroke="#C9CAD6"/><rect x="15" y="30" width="22" height="9" rx="2" fill="#E5484D"/><text x="26" y="37" font-size="6.5" font-weight="700" text-anchor="middle" fill="#fff" font-family="Figtree,sans-serif">PDF</text></svg>${esc(c.name)}</div></div></div>`;
    }
  }

  function detail(c) {
    switch (c.kind) {
      case "text": case "code": return `${c.text.length} karakter`;
      case "link": return c.host;
      case "color": return c.hex;
      case "image": return c.size;
      case "file": return c.size;
    }
  }

  function visible() {
    const q = query.trim().toLocaleLowerCase("tr");
    return cards.filter((c) => (tab === "all" || c.board === tab) &&
      (!q || [plain(c), c.title, c.appName, label(c)].filter(Boolean).join(" ").toLocaleLowerCase("tr").includes(q)));
  }

  function render() {
    const list = visible();
    cursor = Math.min(cursor, Math.max(0, list.length - 1));
    if (!list.length) {
      strip.innerHTML = `<li class="card-body" style="padding:60px 8px;color:var(--ink-3)">${query ? "Sonuç yok" : "Bu pinboard boş"}</li>`;
      return;
    }
    strip.innerHTML = list.map((c, i) => `
      <li class="card${i === cursor ? " cursor" : ""}${c === fresh ? " fresh" : ""}" data-i="${i}" aria-label="${label(c)}, ${esc(c.appName)}">
        <div class="card-head" style="--hc:${c.color};${c.fg ? `--hf:${c.fg}` : ""}">
          <div><b>${label(c)}</b><small>${ago(c.time)}</small></div>
          <span class="app" title="${esc(c.appName)}">${icons[c.app]}</span>
        </div>
        ${body(c)}
        <div class="card-foot"><span>${esc(detail(c))}</span><span>${i < 9 ? (os === "mac" ? "⌘" : "Ctrl+") + (i + 1) : ""}</span></div>
      </li>`).join("");
    fresh = null;
    strip.querySelector(".cursor")?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }

  let toastTimer;
  function say(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  async function paste(i) {
    const c = visible()[i];
    if (!c) return;
    const text = plain(c);
    try { if (text) await navigator.clipboard.writeText(text); } catch { /* izin yoksa yalnızca göster */ }
    // Gerçek uygulamadaki gibi: kullanılan kart öne geçer
    cards = [c, ...cards.filter((x) => x !== c)];
    c.time = Date.now();
    cursor = 0;
    render();
    say(text ? "Panoya kopyalandı, istediğin yere yapıştır" : "Görsel kartı (demo)");
  }

  const isOpen = () => !panel.classList.contains("closed");
  function setOpen(open) {
    panel.classList.toggle("closed", !open);
    if (open) { panel.focus({ preventScroll: true }); }
  }

  // Sayfada yapılan her kopya panele kart olarak düşer
  document.addEventListener("copy", () => {
    const text = String(document.getSelection() || "").trim();
    if (!text || panel.contains(document.activeElement) && document.activeElement === search) return;
    const existing = cards.find((c) => (c.kind === "text") && c.text === text);
    if (existing) cards = cards.filter((c) => c !== existing);
    fresh = { kind: "text", app: "browser", appName: "Bu sayfa", color: "#6A00DB", time: Date.now(), text };
    cards = [fresh, ...cards];
    cursor = 0;
    tab = "all";
    syncTabs();
    if (!isOpen()) setOpen(true);
    render();
    say("Yeni kart: az önce kopyaladığın metin");
  });

  document.addEventListener("keydown", (e) => {
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.shiftKey && e.key.toLowerCase() === "v") {
      e.preventDefault();
      setOpen(!isOpen());
      return;
    }
    if (!isOpen()) return;
    const inPanel = panel.contains(document.activeElement);
    if (!inPanel) return;
    const n = visible().length;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      cursor = Math.max(0, Math.min(n - 1, cursor + (e.key === "ArrowRight" ? 1 : -1)));
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      paste(cursor);
    } else if (e.key === "Escape") {
      if (query) { query = ""; search.value = ""; render(); }
      else setOpen(false);
    } else if (mod && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      paste(Number(e.key) - 1);
    } else if (e.key.length === 1 && !mod && document.activeElement !== search) {
      search.focus(); // yazmaya başlayınca arama
    }
  });

  strip.addEventListener("click", (e) => {
    const li = e.target.closest(".card");
    if (!li) return;
    cursor = Number(li.dataset.i);
    render();
  });
  strip.addEventListener("dblclick", (e) => {
    const li = e.target.closest(".card");
    if (li) paste(Number(li.dataset.i));
  });
  search.addEventListener("input", () => { query = search.value; cursor = 0; render(); });

  const tabButtons = [...document.querySelectorAll(".tabs button")];
  function syncTabs() { tabButtons.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab))); }
  tabButtons.forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; cursor = 0; syncTabs(); render(); }));

  // Kısayol tablosu ve işletim sistemine göre metinler
  const rows = [
    ["open", "Paneli aç ya da kapat"],
    ["arrows", "Kartlar arasında gezin; Shift ile birden fazla seç"],
    ["enter", "Seçili kartı öndeki uygulamaya yapıştır"],
    ["plain", "Biçimsiz, düz metin olarak yapıştır"],
    ["quick", "İlk dokuz karttan birini doğrudan yapıştır"],
    ["space", "Büyük önizleme"],
    ["edit", "Metni düzenle"],
    ["del", "Sil; hemen ardından geri al"],
    ["tab", "Pinboard'lar arasında geç"],
    ["esc", "Aramayı temizle, paneli kapat"],
  ];
  const k = (...keys) => `<span class="keys">${keys.map((x) => `<kbd>${x}</kbd>`).join("")}</span>`;
  const or = '<span class="or">ya da</span>';
  const keyMap = {
    mac: {
      open: k("⇧", "⌘", "V"), arrows: k("←", "→"), enter: k("↩"), plain: k("⇧", "↩"), quick: k("⌘", "1") + or + k("⌘", "9"),
      space: k("Space"), edit: k("⌘", "E"), del: k("⌘", "⌫") + or + k("⌘", "Z"), tab: k("⇥"), esc: k("esc"),
    },
    win: {
      open: k("Ctrl", "Shift", "V"), arrows: k("←", "→"), enter: k("Enter"), plain: k("Shift", "Enter"), quick: k("Ctrl", "1") + or + k("Ctrl", "9"),
      space: k("Space"), edit: k("Ctrl", "E"), del: k("Del") + or + k("Ctrl", "Z"), tab: k("Tab"), esc: k("Esc"),
    },
  };

  function applyOs() {
    document.getElementById("sc-body").innerHTML = rows.map(([id, text]) => `<tr><td>${keyMap[os][id]}</td><td>${text}</td></tr>`).join("");
    document.querySelectorAll(".os-switch button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.os === os)));
    document.querySelectorAll('[data-os-keys="open"]').forEach((el) => { el.outerHTML = keyMap[isMac ? "mac" : "win"].open.replace('class="keys"', 'class="keys" data-os-keys="open"'); });
    render();
  }
  document.querySelectorAll(".os-switch button").forEach((b) => b.addEventListener("click", () => { os = b.dataset.os; applyOs(); }));

  // İndirme: ziyaretçinin sistemine uygun kartı öne çıkar
  const mainCta = document.getElementById("cta-main");
  const target = document.querySelector(`[data-os-card="${isMac ? "mac" : "win"}"]`);
  target?.classList.add("suggested");
  const href = target?.querySelector("a.btn")?.getAttribute("href");
  if (href && !/Android|iPhone|iPad/.test(navigator.userAgent)) {
    mainCta.href = href;
    mainCta.textContent = isMac ? "Mac için indir" : "Windows için indir";
    document.getElementById("cta-note").innerHTML = `Ücretsiz. ${isMac ? "macOS 14 ve sonrası" : "Windows 10 ve 11"}. <a href="#indir">Diğer sistem</a>`;
  }

  // Tek orkestre an: panel sayfa yüklenince alttan kayarak gelir
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyOs();
  if (!reduce) {
    panel.classList.add("closed");
    requestAnimationFrame(() => setTimeout(() => panel.classList.remove("closed"), 450));
  }
  setInterval(() => { if (isOpen()) strip.querySelectorAll(".card small").forEach((el, i) => { const c = visible()[i]; if (c) el.textContent = ago(c.time); }); }, 30000);
})();
