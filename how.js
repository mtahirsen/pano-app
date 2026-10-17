// "Nasıl çalışır" sahnesi: notlardan kopyala → kısayolla aç → ara → Enter ile e-postaya yapıştır.
(() => {
  const stage = document.getElementById("stage");
  if (!stage) return;
  const $ = (id) => document.getElementById(id);
  const pointer = $("pointer"), sel = $("sel"), pick = $("pick-text"), chip = $("chip"), tray = $("tray");
  const keyshow = $("keyshow"), mini = $("mini"), q = $("mini-q"), typed = $("typed"), caret = $("caret");
  const notes = $("w-notes"), mail = $("w-mail"), fresh = $("mc-new");
  const others = [...stage.querySelectorAll(".mc:not(.mc-new)")];
  const qCaret = mini.querySelector(".mini-search .caret");
  const steps = [...document.querySelectorAll("#how-steps li")];

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
  const KEYS = isMac
    ? { copy: ["⌘", "C"], open: ["⇧", "⌘", "V"], enter: ["↩"] }
    : { copy: ["Ctrl", "C"], open: ["Ctrl", "Shift", "V"], enter: ["Enter"] };
  const TEXT = pick.textContent;
  const QUERY = "fiyat";
  // Adım ilerleme çubuklarının süreleri, aşağıdaki zaman çizelgesiyle yaklaşık eş
  const DUR = [3900, 3900, 2700];

  // Test için: ?yavas=4 tüm zamanlamaları 4 kat uzatır
  const SLOW = Math.max(1, Number(new URLSearchParams(location.search).get("yavas")) || 1);

  let gen = 0;          // her yeni oynatma bir öncekini iptal eder
  let pPos = { x: 0, y: 0 };
  const STOP = Symbol("stop");

  const check = (g) => { if (g !== gen) throw STOP; };
  const wait = (ms, g) => new Promise((res, rej) => setTimeout(() => (g === gen ? res() : rej(STOP)), ms * SLOW));

  // Öğenin sahneye göre konumu (px)
  function at(el, fx = 0.5, fy = 0.5) {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy };
  }

  async function moveTo(pt, ms, g) {
    const a = pointer.animate(
      [{ transform: `translate(${pPos.x}px, ${pPos.y}px)` }, { transform: `translate(${pt.x}px, ${pt.y}px)` }],
      { duration: ms * SLOW, easing: "cubic-bezier(.45,0,.2,1)", fill: "forwards" });
    pPos = pt;
    await a.finished;
    check(g);
  }

  function place(pt) {
    pPos = pt;
    pointer.getAnimations().forEach((a) => a.cancel());
    pointer.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
  }

  async function click(g) {
    pointer.classList.remove("click");
    void pointer.offsetWidth;
    pointer.classList.add("click");
    await wait(220, g);
  }

  async function press(keys, g) {
    keyshow.innerHTML = keys.map((k) => `<kbd>${k}</kbd>`).join("");
    keyshow.classList.add("show");
    const caps = [...keyshow.children];
    for (const k of caps) { k.classList.add("down"); await wait(110, g); }
    await wait(260, g);
    caps.forEach((k) => k.classList.remove("down"));
    await wait(380, g);
    keyshow.classList.remove("show");
  }

  async function fly(text, from, to, ms, g, shrink = 0.35) {
    chip.textContent = text;
    chip.style.opacity = "1";
    const w = chip.offsetWidth, h = chip.offsetHeight;
    const a = chip.animate([
      { transform: `translate(${from.x - w / 2}px, ${from.y - h / 2}px) scale(1)`, opacity: 1 },
      { transform: `translate(${(from.x + to.x) / 2 - w / 2}px, ${Math.min(from.y, to.y) - h * 2}px) scale(${(1 + shrink) / 2})`, opacity: 1, offset: 0.5 },
      { transform: `translate(${to.x - w / 2}px, ${to.y - h / 2}px) scale(${shrink})`, opacity: 0 },
    ], { duration: ms * SLOW, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    await a.finished;
    chip.style.opacity = "0";
    check(g);
  }

  function setStep(i) {
    steps.forEach((li, k) => {
      li.classList.remove("active");
      li.classList.toggle("done", k < i);
    });
    const li = steps[i];
    li.style.setProperty("--dur", `${DUR[i] * SLOW}ms`);
    void li.offsetWidth; // ilerleme çubuğu animasyonunu yeniden başlat
    li.classList.add("active");
  }

  // Sahneyi başa al ya da istenen adımın başındaki duruma getir (anında)
  function stateAt(step) {
    chip.getAnimations().forEach((a) => a.cancel());
    chip.style.opacity = "0";
    keyshow.classList.remove("show");
    sel.getAnimations().forEach((a) => a.cancel());
    sel.style.transform = step >= 1 ? "scaleX(1)" : "scaleX(0)";
    notes.classList.toggle("focus", step < 1);
    mail.classList.toggle("focus", step >= 1);
    mail.classList.toggle("front", step >= 1);
    caret.classList.toggle("on", step >= 1);
    typed.textContent = "";
    fresh.classList.toggle("hidden", step < 1);
    fresh.classList.toggle("cursor", step >= 2);
    fresh.classList.remove("lift");
    others.forEach((c) => c.classList.toggle("gone", step >= 2));
    q.textContent = step >= 2 ? QUERY : "";
    qCaret.classList.toggle("on", step >= 1);
    mini.style.transition = "none";
    mini.classList.toggle("open", step >= 2);
    void mini.offsetWidth;
    mini.style.transition = "";
    place(step >= 2 ? at(mail, 0.92, 0.12)
        : step >= 1 ? at(typed, 0, 0.6)
        : { x: stage.clientWidth * 0.3, y: stage.clientHeight * 0.75 });
  }

  const scenes = [
    // 1) Kopyala
    async (g) => {
      setStep(0);
      await wait(350, g);
      await moveTo(at(pick, 0, 0.55), 700, g);
      const s = sel.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 750 * SLOW, easing: "ease-in-out", fill: "forwards" });
      await moveTo(at(pick, 1, 0.55), 750, g);
      await s.finished; check(g);
      await wait(150, g);
      await press(KEYS.copy, g);
      fresh.classList.remove("hidden");
      const flight = fly(TEXT, at(pick), at(tray), 850, g);
      setTimeout(() => { tray.classList.remove("pulse"); void tray.offsetWidth; tray.classList.add("pulse"); }, 700 * SLOW);
      await flight;
      await wait(350, g);
    },
    // 2) Kısayola bas, ara
    async (g) => {
      setStep(1);
      await moveTo(at(typed, 0, 0.6), 650, g);
      await click(g);
      notes.classList.remove("focus");
      mail.classList.add("focus", "front");
      caret.classList.add("on");
      moveTo(at(mail, 0.92, 0.12), 500, g).catch(() => {}); // imleç yazılan yerin üstünden çekilsin
      await wait(250, g);
      await press(KEYS.open, g);
      mini.classList.add("open");
      qCaret.classList.add("on");
      await wait(650, g);
      for (let i = 1; i <= QUERY.length; i++) {
        q.textContent = QUERY.slice(0, i);
        if (i === 2) others.forEach((c) => c.classList.add("gone"));
        await wait(120, g);
      }
      fresh.classList.add("cursor");
      await wait(500, g);
    },
    // 3) Enter ile yapıştır
    async (g) => {
      setStep(2);
      await press(KEYS.enter, g);
      fresh.classList.add("lift");
      const from = at(fresh), to = at(caret);
      mini.classList.remove("open");
      qCaret.classList.remove("on");
      await fly(TEXT, from, to, 650, g, 0.6);
      for (let i = 1; i <= TEXT.length; i++) {
        typed.textContent = TEXT.slice(0, i);
        await wait(16, g);
      }
      await wait(1900, g);
    },
  ];

  async function play(from = 0) {
    const g = ++gen;
    try {
      stateAt(from);
      for (let i = from; ; i = (i + 1) % scenes.length) {
        if (i === 0) stateAt(0);
        await scenes[i](g);
      }
    } catch (e) {
      if (e !== STOP) console.error(e);
    }
  }

  const stop = () => { gen++; steps.forEach((li) => li.classList.remove("active")); };

  // Hareketi azalt: son durumu durağan göster
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    stateAt(2);
    mini.classList.remove("open");
    typed.textContent = TEXT;
    steps.forEach((li) => li.classList.add("active"));
    return;
  }

  steps.forEach((li, i) => li.querySelector(".step-btn").addEventListener("click", () => play(i)));

  // Yalnızca ekrandayken oynat
  let visible = false;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !visible) { visible = true; play(0); }
    else if (!entry.isIntersecting && visible) { visible = false; stop(); }
  }, { threshold: 0.35 }).observe(stage);

  stateAt(0);
})();
