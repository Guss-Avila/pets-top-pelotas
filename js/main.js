/* Pet's Top · main.js
   Só desenha a página a partir do data.js. Sem biblioteca, sem build. */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const reais = (n) => BRL.format(n).replace(/ /g, " ");
  const DIAS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const DIAS_CURTO = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const icone = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* WhatsApp: api.whatsapp.com (o wa.me estraga emoji de 4 bytes) */
  const waUrl = (msg) => `https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=${encodeURIComponent(msg)}`;
  function abrirWa(msg) {
    const url = waUrl(msg);
    const w = window.open(url, "_blank");
    if (w) w.opener = null; else location.href = url;
  }
  function ligarLinksWa(raiz = document) {
    $$("[data-wa]", raiz).forEach((a) => {
      a.href = waUrl(a.dataset.wa || "Olá! Vim pelo site da Pet's Top.");
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  const guardar = {
    ler(k, padrao) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; } },
    gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  };

  let toastTimer;
  function toast(txt) {
    const t = $("[data-toast]");
    t.textContent = txt;
    t.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("on"), 2200);
  }

  /* ---------- Horário: aberto agora? ---------- */
  const minutos = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const hhmmTxt = (hhmm) => hhmm.endsWith(":00") ? hhmm.slice(0, 2).replace(/^0/, "") + "h" : hhmm.replace(":", "h").replace(/^0/, "");
  function statusAgora(d = new Date()) {
    const hoje = CONFIG.horarios[d.getDay()] || [];
    const agora = d.getHours() * 60 + d.getMinutes();
    for (const [a, f] of hoje) {
      if (agora >= minutos(a) && agora < minutos(f)) return { aberto: true, txt: `Aberto agora · fecha às ${hhmmTxt(f)}` };
    }
    for (const [a] of hoje) if (agora < minutos(a)) return { aberto: false, txt: `Fechado agora · abre às ${hhmmTxt(a)}` };
    for (let i = 1; i <= 7; i++) {
      const dia = (d.getDay() + i) % 7;
      const h = CONFIG.horarios[dia] || [];
      if (h.length) return { aberto: false, txt: `Fechado agora · abre ${i === 1 ? "amanhã" : DIAS[dia].toLowerCase()} às ${hhmmTxt(h[0][0])}` };
    }
    return { aberto: false, txt: "Fechado agora" };
  }
  function iniciarStatus() {
    const s = statusAgora();
    $("[data-status]").textContent = s.txt;
    $("[data-status-dot]").classList.toggle("on", s.aberto);
    const ab = $("[data-aberto]");
    ab.innerHTML = `<span class="dot ${s.aberto ? "on" : ""}"></span>${s.txt}`;
    ab.classList.toggle("on", s.aberto);
    const hoje = new Date().getDay();
    const ordem = [1, 2, 3, 4, 5, 6, 0];
    $("[data-horario]").insertAdjacentHTML("beforeend", "<tbody>" + ordem.map((d) => {
      const h = CONFIG.horarios[d] || [];
      const txt = h.length ? h.map(([a, f]) => `${hhmmTxt(a)} às ${hhmmTxt(f)}`).join(" e ") : "Fechado";
      return `<tr class="${d === hoje ? "hoje" : ""}"><td>${DIAS[d]}</td><td>${txt}</td></tr>`;
    }).join("") + "</tbody>");
  }

  /* ---------- Topo e menu ---------- */
  function iniciarTopo() {
    const btn = $(".menu-btn");
    const nav = $("#menu");
    const fechar = () => { nav.classList.remove("aberto"); btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const abre = !nav.classList.contains("aberto");
      nav.classList.toggle("aberto", abre);
      btn.setAttribute("aria-expanded", String(abre));
    });
    $$("a", nav).forEach((a) => a.addEventListener("click", fechar));
    document.addEventListener("click", (e) => { if (!nav.contains(e.target)) fechar(); });
  }

  /* Disco recortado igual à moldura do logo (bolinhas brancas no anel) */
  function disco() {
    const n = 20, r = 100, amp = 9, cx = 110, cy = 110;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)}`; continue; }
      const am = ((i - 0.5) / n) * Math.PI * 2;
      d += ` Q${(cx + (r + amp * 2) * Math.cos(am)).toFixed(1)} ${(cy + (r + amp * 2) * Math.sin(am)).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return `<svg viewBox="0 0 220 220" aria-hidden="true"><path d="${d}Z" fill="currentColor"/><circle cx="110" cy="110" r="92" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0.1 11"/><circle cx="110" cy="110" r="82" fill="var(--disco)"/></svg>`;
  }

  /* ---------- Hero ---------- */
  function iniciarHero() {
    const track = $("[data-hero]");
    const dots = $("[data-hero-dots]");
    const bolhas = [[8, 14, 34], [86, 70, 22], [74, 10, 16], [16, 78, 18]];
    track.innerHTML = SLIDES.map((s, i) => {
      const preco = s.produto ? `<span class="slide__preco"><s>de R$ 219</s><b>R$ 199</b>20 kg</span>` : "";
      const b = bolhas.map(([x, y, t]) => `<span class="bolha" style="left:${x}%;top:${y}%;width:${t}px;height:${t}px"></span>`).join("");
      return `<div class="slide${i === 0 ? " ativo" : ""}" data-tema="${s.tema}" role="group" aria-roledescription="slide" aria-label="${i + 1} de ${SLIDES.length}" ${i === 0 ? "" : 'aria-hidden="true"'}>
        ${b}
        <div class="wrap slide__in">
          <div class="slide__txt">
            <span class="etiqueta">${icone("paw")} ${esc(s.etiqueta)}</span>
            <p class="slide__titulo">${s.titulo.map((t) => `<span>${t}</span>`).join("")}</p>
            <p class="slide__texto">${esc(s.texto)}</p>
            <div class="slide__ctas">
              <a class="btn btn--rosa" href="${s.cta.href || "#"}" data-cta="${i}">${esc(s.cta.label)}</a>
              ${s.cta2 ? (s.cta2.wa ? `<a class="btn btn--branco" data-wa="${esc(s.cta2.wa)}">${icone("wa")} ${esc(s.cta2.label)}</a>`
                : `<a class="btn btn--branco" href="${s.cta2.href}"${/^http/.test(s.cta2.href) ? ' target="_blank" rel="noopener"' : ""}>${esc(s.cta2.label)}</a>`) : ""}
            </div>
          </div>
          <div class="slide__arte${s.produto ? " produto" : ""}">
            <div class="disco">${disco()}</div>
            <img src="${s.imagem}" alt="${esc(s.alt)}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
            ${preco}
          </div>
        </div>
      </div>`;
    }).join("");
    dots.innerHTML = SLIDES.map((_, i) => `<button type="button" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0}"></button>`).join("");
    ligarLinksWa(track);

    // Ações dos botões do slide
    $$("[data-cta]", track).forEach((a) => a.addEventListener("click", () => {
      const s = SLIDES[+a.dataset.cta].cta;
      if (s.buscaLeva) agenda.marcarBuscaLeva();
      if (s.servico) agenda.marcarServico(s.servico);
      if (s.categoria) loja.filtrar(s.categoria, s.sub || null);
    }));

    const slides = $$(".slide", track);
    const botoes = $$("button", dots);
    let atual = 0, timer;
    function ir(n) {
      atual = (n + slides.length) % slides.length;
      slides.forEach((s, i) => {
        const on = i === atual;
        s.classList.toggle("ativo", on);
        s.toggleAttribute("aria-hidden", !on);
        $$("a, button", s).forEach((el) => on ? el.removeAttribute("tabindex") : el.setAttribute("tabindex", "-1"));
      });
      botoes.forEach((b, i) => b.setAttribute("aria-selected", String(i === atual)));
      reiniciar();
    }
    function reiniciar() { clearInterval(timer); timer = setInterval(() => ir(atual + 1), 5500); }
    botoes.forEach((b, i) => b.addEventListener("click", () => ir(i)));
    $("[data-hero-ant]").addEventListener("click", () => ir(atual - 1));
    $("[data-hero-prox]").addEventListener("click", () => ir(atual + 1));
    arrastar($(".hero"), () => ir(atual + 1), () => ir(atual - 1));
    document.addEventListener("visibilitychange", () => document.hidden ? clearInterval(timer) : reiniciar());
    ir(0);
  }

  function arrastar(el, prox, ant) {
    let x0 = null, y0 = null;
    el.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") { x0 = e.clientX; y0 = e.clientY; } });
    el.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? prox : ant)();
      x0 = null;
    });
    el.addEventListener("pointercancel", () => { x0 = null; });
  }

  /* ---------- Banner de serviços: troca a cada 2,3 s ---------- */
  function iniciarBanner() {
    const DUR = 4500;
    const track = $("[data-banner-track]");
    const barra = $("[data-banner-barra]");
    track.innerHTML = SERVICOS.map((s, i) => `<article class="serv" data-cor="${s.cor}" aria-label="${esc(s.nome)}" ${i ? 'aria-hidden="true"' : ""}>
      <div class="serv__txt">
        <h3 class="serv__nome">${esc(s.nome)}</h3>
        <p class="serv__texto">${esc(s.texto)}</p>
        ${s.preco ? `<span class="serv__preco">${esc(s.preco)}</span>` : ""}
        <a class="serv__cta" href="#agendar" data-serv="${s.id}">${s.id === "racoes" ? "Ver a loja" : "Agendar"} ${icone("chev")}</a>
      </div>
      <div class="serv__icone">${icone(s.icone)}</div>
    </article>`).join("");
    $$("[data-serv]", track).forEach((a) => {
      if (a.dataset.serv === "racoes") a.setAttribute("href", "#produtos");
      a.addEventListener("click", () => {
        const id = a.dataset.serv;
        if (id === "buscaleva") agenda.marcarBuscaLeva();
        else if (id === "tosa") agenda.marcarServico("banho-tosa");
        else if (id !== "racoes") agenda.marcarServico(id);
      });
    });
    const itens = $$(".serv", track);
    let atual = 0, timer;
    barra.style.setProperty("--dur", DUR + "ms");
    function ir(n) {
      atual = (n + itens.length) % itens.length;
      track.style.transform = `translateX(-${atual * 100}%)`;
      itens.forEach((it, i) => {
        it.classList.toggle("ativo", i === atual);
        it.toggleAttribute("aria-hidden", i !== atual);
        $$("a", it).forEach((a) => i === atual ? a.removeAttribute("tabindex") : a.setAttribute("tabindex", "-1"));
      });
      barra.classList.remove("corre"); void barra.offsetWidth; barra.classList.add("corre");
      clearTimeout(timer);
      timer = setTimeout(() => ir(atual + 1), DUR);
    }
    $("[data-banner-ant]").addEventListener("click", () => ir(atual - 1));
    $("[data-banner-prox]").addEventListener("click", () => ir(atual + 1));
    arrastar($("[data-banner]"), () => ir(atual + 1), () => ir(atual - 1));
    document.addEventListener("visibilitychange", () => document.hidden ? clearTimeout(timer) : ir(atual));
    ir(0);
  }

  /* Embalagem ilustrada pra produto ainda sem foto */
  function pack(p) {
    const c = p.pack || { bg: "#51AFDD", accent: "#F2479E", txt: "#fff" };
    return `<svg class="pack" viewBox="0 0 120 150" aria-hidden="true">
      <path d="M18 14h84l8 120a8 8 0 0 1-8 9H18a8 8 0 0 1-8-9Z" fill="${c.bg}"/>
      <path d="M18 14h84l1 12H17Z" fill="rgba(0,0,0,.18)"/>
      <rect x="22" y="40" width="76" height="26" rx="6" fill="${c.accent}"/>
      <text x="60" y="58.5" text-anchor="middle" font-family="Baloo 2, Nunito, sans-serif" font-weight="800" font-size="15" fill="${c.bg}">${esc(p.marca)}</text>
      <text x="60" y="86" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="800" font-size="8.5" fill="${c.txt}">${esc(p.nome.split(" ").slice(0, 3).join(" "))}</text>
      <circle cx="60" cy="112" r="13" fill="rgba(255,255,255,.18)"/>
      <text x="60" y="116" text-anchor="middle" font-family="Nunito, sans-serif" font-weight="900" font-size="10" fill="${c.txt}">${esc(p.peso)}</text>
    </svg>`;
  }
  const imagemProduto = (p, alt = true) => p.imagem ? `<img src="${p.imagem}" alt="${alt ? esc(p.marca + " " + p.nome + " " + p.peso) : ""}" loading="lazy">` : pack(p);

  /* ---------- Loja ---------- */
  const loja = (function () {
    const est = { cat: null, sub: null, busca: "", ordem: "destaque" };
    const lista = () => $("[data-cats]");
    const conta = (fn) => PRODUCTS.filter(fn).length;
    const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    function desenharCats() {
      const total = PRODUCTS.length;
      lista().innerHTML = `<li class="cat"><button class="cat__btn${!est.cat && !est.busca ? " ativo" : ""}" type="button" data-todos><span class="ico">${icone("paw")}</span>Todos os produtos<span class="n">${total}</span></button></li>` +
        CATEGORIAS.map((c) => {
          const aberta = est.cat === c.id;
          return `<li class="cat${aberta ? " aberta" : ""}">
            <button class="cat__btn${aberta && !est.sub ? " ativo" : ""}" type="button" aria-expanded="${aberta}" data-cat="${c.id}">
              <span class="ico">${icone(c.icone)}</span>${esc(c.nome)}<span class="n">${conta((p) => p.cat === c.id)}</span>${icone("chev", "seta")}
            </button>
            <div class="cat__subs"><ul>${c.subs.map((s) => `<li><button class="sub__btn${est.sub === s.id ? " ativo" : ""}" type="button" data-sub="${s.id}" data-de="${c.id}" ${aberta ? "" : 'tabindex="-1"'}>${esc(s.nome)}<span>${conta((p) => p.sub === s.id)}</span></button></li>`).join("")}</ul></div>
          </li>`;
        }).join("");
    }

    /* Só troca classes: a lista não é redesenhada, então a abertura anima */
    function atualizarCats() {
      $("[data-todos]").classList.toggle("ativo", !est.cat && !est.busca);
      $$(".cat", lista()).forEach((li) => {
        const b = $("[data-cat]", li); if (!b) return;
        const aberta = est.cat === b.dataset.cat;
        li.classList.toggle("aberta", aberta);
        b.setAttribute("aria-expanded", String(aberta));
        b.classList.toggle("ativo", aberta && !est.sub);
        $$("[data-sub]", li).forEach((sb) => {
          sb.classList.toggle("ativo", est.sub === sb.dataset.sub);
          if (aberta) sb.removeAttribute("tabindex"); else sb.setAttribute("tabindex", "-1");
        });
      });
    }

    function filtrar(cat, sub, rolar = true) {
      est.cat = cat; est.sub = sub; est.busca = "";
      $("#busca-produto").value = "";
      desenhar();
      if (rolar) document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
    }

    let primeira = true;
    function desenhar() {
      atualizarCats();
      let itens = PRODUCTS.slice();
      let trilha = "Todos os produtos";
      if (est.busca) {
        const q = norm(est.busca);
        itens = itens.filter((p) => norm(`${p.marca} ${p.nome} ${p.peso} ${p.cat} ${p.sub}`).includes(q));
        trilha = `Busca: “${esc(est.busca)}”`;
      } else if (est.cat) {
        const c = CATEGORIAS.find((x) => x.id === est.cat);
        itens = itens.filter((p) => p.cat === est.cat && (!est.sub || p.sub === est.sub));
        trilha = esc(c.nome) + (est.sub ? ` › ${esc(c.subs.find((s) => s.id === est.sub).nome)}` : "");
      }
      const preco = (p) => (p.preco == null ? Infinity : p.preco);
      if (est.ordem === "menor") itens.sort((a, b) => preco(a) - preco(b));
      if (est.ordem === "maior") itens.sort((a, b) => (b.preco || 0) - (a.preco || 0));
      if (est.ordem === "az") itens.sort((a, b) => (a.marca + a.nome).localeCompare(b.marca + b.nome, "pt-BR"));
      if (est.ordem === "destaque") itens.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
      $("[data-trilha]").innerHTML = trilha;
      $("[data-cats-atual]").innerHTML = trilha;
      $("[data-qtd]").textContent = `${itens.length} ${itens.length === 1 ? "produto" : "produtos"}`;
      $("[data-vazio]").hidden = itens.length > 0;
      const grade = $("[data-produtos]");
      grade.innerHTML = itens.map(cartao).join("");
      if (!primeira) $$(".card", grade).forEach((c, i) => { c.style.setProperty("--i", i); c.classList.add("entra"); });
      primeira = false;
    }

    function cartao(p) {
      const off = p.precoDe && p.preco ? Math.round((1 - p.preco / p.precoDe) * 100) : 0;
      return `<article class="card" data-id="${p.id}">
        <div class="card__img">${imagemProduto(p)}${off ? `<span class="card__off">-${off}%</span>` : ""}</div>
        <div class="card__corpo">
          <span class="card__marca">${esc(p.marca)}</span>
          <h3 class="card__nome">${esc(p.nome)}</h3>
          <span class="card__peso">${esc(p.peso)}</span>
          <div class="card__preco">${p.preco != null
            ? `${p.precoDe ? `<s>de ${reais(p.precoDe)}</s>` : ""}<b>${reais(p.preco)}</b>`
            : `<span class="consulta">Preço no WhatsApp</span>`}</div>
          <div class="card__acao">
            <div class="qtd"><button type="button" data-menos aria-label="Diminuir">${icone("minus")}</button><span data-n>1</span><button type="button" data-mais aria-label="Aumentar">${icone("plus")}</button></div>
            <button class="card__add" type="button" data-add>${icone("cart")} Adicionar</button>
          </div>
        </div>
      </article>`;
    }

    function iniciar() {
      desenharCats();
      desenhar();
      lista().addEventListener("click", (e) => {
        const todos = e.target.closest("[data-todos]");
        const cat = e.target.closest("[data-cat]");
        const sub = e.target.closest("[data-sub]");
        if (todos) { filtrar(null, null, false); fecharMobile(); }
        if (cat) {
          const id = cat.dataset.cat;
          if (est.cat === id && !est.sub) { est.cat = null; desenhar(); }
          else filtrar(id, null, false);
        }
        if (sub) { filtrar(sub.dataset.de, sub.dataset.sub, false); fecharMobile(); }
      });
      const cats = $(".cats");
      const abrirBtn = $("[data-cats-abrir]");
      function fecharMobile() { cats.classList.remove("aberto"); abrirBtn.setAttribute("aria-expanded", "false"); }
      abrirBtn.addEventListener("click", () => {
        const abre = !cats.classList.contains("aberto");
        cats.classList.toggle("aberto", abre);
        abrirBtn.setAttribute("aria-expanded", String(abre));
      });
      $("[data-ordem]").addEventListener("change", (e) => { est.ordem = e.target.value; desenhar(); });
      const inp = $("#busca-produto");
      let t;
      inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => { est.busca = inp.value.trim(); est.cat = null; est.sub = null; desenhar(); }, 220); });
      $("[data-busca]").addEventListener("submit", (e) => {
        e.preventDefault(); est.busca = inp.value.trim(); est.cat = null; est.sub = null; desenhar();
        document.getElementById("produtos").scrollIntoView({ behavior: "smooth" });
      });
      $("[data-produtos]").addEventListener("click", (e) => {
        const card = e.target.closest(".card"); if (!card) return;
        const n = $("[data-n]", card);
        if (e.target.closest("[data-mais]")) n.textContent = Math.min(99, +n.textContent + 1);
        if (e.target.closest("[data-menos]")) n.textContent = Math.max(1, +n.textContent - 1);
        const add = e.target.closest("[data-add]");
        if (add) {
          carrinho.add(card.dataset.id, +n.textContent);
          n.textContent = "1";
          add.classList.add("ok"); add.innerHTML = `${icone("check")} No carrinho`;
          setTimeout(() => { add.classList.remove("ok"); add.innerHTML = `${icone("cart")} Adicionar`; }, 1400);
        }
      });
    }
    return { iniciar, filtrar };
  })();

  /* ---------- Carrinho ---------- */
  const carrinho = (function () {
    const CHAVE = "petstop:carrinho:v1";
    let itens = guardar.ler(CHAVE, []).filter((i) => PRODUCTS.some((p) => p.id === i.id));
    const prod = (id) => PRODUCTS.find((p) => p.id === id);
    const salvar = () => { guardar.gravar(CHAVE, itens); desenhar(); };
    function add(id, qtd) {
      const it = itens.find((i) => i.id === id);
      if (it) it.qtd = Math.min(99, it.qtd + qtd); else itens.push({ id, qtd });
      salvar();
      $$("[data-contador]").forEach((c) => { c.classList.remove("pula"); void c.offsetWidth; c.classList.add("pula"); });
      const p = prod(id);
      toast(`${qtd}x ${p.marca} ${p.peso} no carrinho`);
    }
    function desenhar() {
      const total = itens.reduce((s, i) => s + i.qtd, 0);
      $$("[data-contador]").forEach((c) => (c.textContent = total));
      $("[data-gaveta-vazio]").hidden = itens.length > 0;
      $("[data-checkout]").hidden = itens.length === 0;
      $("[data-itens]").innerHTML = itens.map((i) => {
        const p = prod(i.id);
        return `<li class="item" data-id="${p.id}">
          <div class="item__img">${imagemProduto(p, false)}</div>
          <div><p class="item__nome">${esc(p.marca)} ${esc(p.nome)} · ${esc(p.peso)}</p>
            <p class="item__preco">${p.preco != null ? reais(p.preco * i.qtd) : "Preço no WhatsApp"}</p></div>
          <div class="item__acoes">
            <div class="qtd"><button type="button" data-menos aria-label="Diminuir">${icone("minus")}</button><span>${i.qtd}</span><button type="button" data-mais aria-label="Aumentar">${icone("plus")}</button></div>
            <button type="button" class="item__rem" data-rem>Remover</button>
          </div>
        </li>`;
      }).join("");
      const comPreco = itens.filter((i) => prod(i.id).preco != null);
      const sub = comPreco.reduce((s, i) => s + prod(i.id).preco * i.qtd, 0);
      const semPreco = itens.length - comPreco.length;
      $("[data-totais]").innerHTML = `<div><span>Subtotal</span><b>${reais(sub)}</b></div>` +
        (semPreco ? `<small>+ ${semPreco} ${semPreco === 1 ? "item" : "itens"} com preço confirmado no WhatsApp</small>` : "") +
        `<small>Entrega e valor final confirmados pela loja.</small>`;
    }
    function mensagem(f) {
      const linhas = itens.map((i) => {
        const p = prod(i.id);
        return `• ${i.qtd}x ${p.marca} ${p.nome} (${p.peso})${p.preco != null ? `: ${reais(p.preco * i.qtd)}` : ": preço a confirmar"}`;
      });
      const sub = itens.reduce((s, i) => s + (prod(i.id).preco || 0) * i.qtd, 0);
      return [
        "*Pedido pelo site · Pet's Top* 🐾", "", ...linhas, "",
        `*Subtotal:* ${reais(sub)}${itens.some((i) => prod(i.id).preco == null) ? " + itens a confirmar" : ""}`,
        `*Nome:* ${f.nome}`,
        `*Recebimento:* ${f.receber === "entrega" ? "Receber em casa" : "Retirar na loja"}`,
        f.receber === "entrega" ? `*Endereço:* ${f.endereco}` : null,
        `*Pagamento:* ${f.pagamento}`,
        f.obs ? `*Obs.:* ${f.obs}` : null, "",
        "Pode confirmar o estoque e o valor final? Obrigado!",
      ].filter((l) => l !== null).join("\n");
    }
    function iniciar() {
      desenhar();
      $("[data-itens]").addEventListener("click", (e) => {
        const li = e.target.closest(".item"); if (!li) return;
        const it = itens.find((i) => i.id === li.dataset.id);
        if (e.target.closest("[data-mais]")) it.qtd = Math.min(99, it.qtd + 1);
        if (e.target.closest("[data-menos]")) it.qtd = Math.max(1, it.qtd - 1);
        if (e.target.closest("[data-rem]")) itens = itens.filter((i) => i !== it);
        salvar();
      });
      const form = $("[data-checkout]");
      const cliente = guardar.ler("petstop:cliente:v1", {});
      if (cliente.nome) form.nome.value = cliente.nome;
      if (cliente.endereco) form.endereco.value = cliente.endereco;
      $("[data-pagamento]").innerHTML = CONFIG.pagamentos.map((p) => `<option>${esc(p)}</option>`).join("");
      let receber = "retirada";
      grupoUnico($("[data-receber]"), (v) => { receber = v; $("[data-entrega]").hidden = v !== "entrega"; });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = { nome: form.nome.value.trim(), endereco: form.endereco.value.trim(), pagamento: form.pagamento.value, obs: form.obs.value.trim(), receber };
        const erro = $("[data-erro]");
        const falta = !f.nome ? "Coloca o seu nome pra loja saber quem é." : (receber === "entrega" && !f.endereco ? "Coloca o endereço pra entrega." : "");
        erro.hidden = !falta; erro.textContent = falta;
        if (falta) return;
        guardar.gravar("petstop:cliente:v1", { nome: f.nome, endereco: f.endereco });
        abrirWa(mensagem(f));
      });
    }
    return { add, iniciar };
  })();

  function grupoUnico(grupo, aoMudar) {
    grupo.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", grupo).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      aoMudar(b.dataset.valor, b);
    });
  }

  /* ---------- Gaveta (painel do carrinho) ---------- */
  function iniciarGaveta() {
    const g = $("[data-gaveta]");
    const fundo = $("[data-gaveta-fundo]");
    let antes = null;
    const focaveis = () => $$("a[href], button:not([disabled]), input, select", g).filter((el) => !el.closest("[hidden]") && el.offsetParent !== null);
    function abrir() {
      antes = document.activeElement;
      g.classList.add("aberta"); g.setAttribute("aria-hidden", "false"); fundo.classList.add("on");
      document.body.style.overflow = "hidden";
      setTimeout(() => $(".gaveta__fechar", g).focus(), 60);
    }
    function fechar() {
      g.classList.remove("aberta"); g.setAttribute("aria-hidden", "true"); fundo.classList.remove("on");
      document.body.style.overflow = "";
      if (antes) antes.focus({ preventScroll: true });
    }
    $$("[data-abrir-carrinho]").forEach((b) => b.addEventListener("click", abrir));
    $$("[data-fechar-carrinho]").forEach((b) => b.addEventListener("click", fechar));
    fundo.addEventListener("click", fechar);
    document.addEventListener("keydown", (e) => {
      if (!g.classList.contains("aberta")) return;
      if (e.key === "Escape") fechar();
      if (e.key === "Tab") {
        const f = focaveis(); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------- Agenda de banho e tosa ---------- */
  const agenda = (function () {
    const est = { servicos: new Set(["banho"]), porte: null, dia: null, hora: null, busca: "nao" };
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    // Protótipo: simula horários ocupados. Na versão final vem da agenda da loja.
    const ocupado = (dia, hora) => { let h = 0; for (const c of dia + hora) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 4 === 0; };
    function proximosDias() {
      const dias = [];
      const d = new Date(); d.setHours(0, 0, 0, 0);
      const agora = new Date();
      for (let i = 0; dias.length < AGENDA.diasNaFrente && i < 30; i++) {
        const x = new Date(d); x.setDate(d.getDate() + i);
        if (!(CONFIG.horarios[x.getDay()] || []).length) continue;
        if (i === 0 && !horasDoDia(x, agora).some((h) => !h.off)) continue;
        dias.push(x);
      }
      return dias;
    }
    function horasDoDia(d, agora = new Date()) {
      const faixas = CONFIG.horarios[d.getDay()] || [];
      const hoje = iso(d) === iso(agora);
      const limite = agora.getHours() * 60 + agora.getMinutes() + 60;
      return AGENDA.horarios
        .filter((h) => faixas.some(([a, f]) => minutos(h) >= minutos(a) && minutos(h) + 60 <= minutos(f) + 30))
        .map((h) => ({ h, off: (hoje && minutos(h) < limite) || ocupado(iso(d), h) }));
    }
    function desenharHoras() {
      const box = $("[data-ag-horas]");
      if (!est.dia) { box.innerHTML = ""; return; }
      const horas = horasDoDia(est.dia);
      const livres = horas.filter((h) => !h.off).length;
      $("[data-ag-livres]").textContent = `${livres} ${livres === 1 ? "horário livre" : "horários livres"} em ${DIAS[est.dia.getDay()].toLowerCase()}, ${est.dia.getDate()}/${est.dia.getMonth() + 1}`;
      box.innerHTML = horas.map(({ h, off }, i) => `<button type="button" class="hora entra" style="--i:${i}" data-hora="${h}" ${off ? "disabled aria-label=\"" + h + " ocupado\"" : ""} aria-pressed="${est.hora === h}">${h}</button>`).join("");
    }
    function marcarServico(id) {
      if (id === "hidratacao") { est.servicos.add("banho"); }
      est.servicos.add(id);
      sincronizarServicos();
    }
    function sincronizarServicos() {
      $$("[data-ag-servicos] .chip").forEach((b) => b.setAttribute("aria-pressed", String(est.servicos.has(b.dataset.valor))));
    }
    function marcarBuscaLeva() {
      est.busca = "sim";
      $$("[data-ag-busca] .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.valor === "sim")));
      $("[data-ag-endereco]").hidden = false;
    }
    function iniciar() {
      const form = $("[data-agenda]");
      $("[data-ag-servicos]").innerHTML = AGENDA.servicos.map((s) => `<button type="button" class="chip" data-valor="${s.id}" aria-pressed="${est.servicos.has(s.id)}">${icone("check")}${esc(s.nome)}</button>`).join("");
      $("[data-ag-servicos]").addEventListener("click", (e) => {
        const b = e.target.closest(".chip"); if (!b) return;
        const id = b.dataset.valor;
        if (est.servicos.has(id)) est.servicos.delete(id); else est.servicos.add(id);
        if (id === "banho-tosa" && est.servicos.has("banho-tosa")) est.servicos.delete("banho");
        if (id === "banho" && est.servicos.has("banho")) est.servicos.delete("banho-tosa");
        sincronizarServicos();
      });
      $("[data-ag-portes]").innerHTML = AGENDA.portes.map((p) => `<button type="button" class="chip" data-valor="${p}" aria-pressed="false">${esc(p)}</button>`).join("");
      grupoUnico($("[data-ag-portes]"), (v) => (est.porte = v));
      const dias = proximosDias();
      est.dia = dias[0] || null;
      $("[data-ag-dias]").innerHTML = dias.map((d, i) => `<button type="button" class="dia" data-i="${i}" aria-pressed="${i === 0}"><small>${DIAS_CURTO[d.getDay()]}</small><b>${d.getDate()}</b><small>${String(d.getMonth() + 1).padStart(2, "0")}</small></button>`).join("");
      $("[data-ag-dias]").addEventListener("click", (e) => {
        const b = e.target.closest(".dia"); if (!b) return;
        $$(".dia", e.currentTarget).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        est.dia = dias[+b.dataset.i]; est.hora = null; desenharHoras();
      });
      $("[data-ag-horas]").addEventListener("click", (e) => {
        const b = e.target.closest(".hora"); if (!b || b.disabled) return;
        est.hora = b.dataset.hora;
        $$(".hora", e.currentTarget).forEach((x) => { x.classList.remove("entra"); x.setAttribute("aria-pressed", String(x === b)); });
      });
      desenharHoras();
      grupoUnico($("[data-ag-busca]"), (v) => { est.busca = v; $("[data-ag-endereco]").hidden = v !== "sim"; });
      const cliente = guardar.ler("petstop:cliente:v1", {});
      if (cliente.nome) form.nome.value = cliente.nome;
      if (cliente.endereco) form.endereco.value = cliente.endereco;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(form));
        const nomes = AGENDA.servicos.filter((s) => est.servicos.has(s.id)).map((s) => s.nome);
        const falta = !nomes.length ? "Escolhe pelo menos um serviço."
          : !f.pet.trim() ? "Qual o nome do pet?"
          : !est.porte ? "Escolhe o porte do pet."
          : !est.hora ? "Escolhe um horário livre."
          : est.busca === "sim" && !f.endereco.trim() ? "Coloca o endereço pra busca e leva."
          : !f.nome.trim() ? "Coloca o seu nome." : "";
        const erro = $("[data-ag-erro]");
        erro.hidden = !falta; erro.textContent = falta;
        if (falta) { erro.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
        guardar.gravar("petstop:cliente:v1", { nome: f.nome.trim(), endereco: (f.endereco || "").trim() });
        const d = est.dia;
        const msg = [
          "*Agendamento pelo site · Pet's Top* 🐾", "",
          `*Serviço:* ${nomes.join(" + ")}`,
          `*Pet:* ${f.pet.trim()} (${f.especie.toLowerCase()}, porte ${est.porte.toLowerCase()})${f.agitado ? ", fica agitado no banho" : ""}`,
          `*Dia:* ${DIAS[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} às ${est.hora}`,
          `*Busca e leva:* ${est.busca === "sim" ? `Sim, ${f.endereco.trim()}${f.bairro.trim() ? `, ${f.bairro.trim()}` : ""}` : "Não, levo na loja"}`,
          `*Tutor:* ${f.nome.trim()}`,
          f.obs.trim() ? `*Obs.:* ${f.obs.trim()}` : null, "",
          "Pode confirmar o horário?",
        ].filter((l) => l !== null).join("\n");
        abrirWa(msg);
      });
    }
    return { iniciar, marcarServico, marcarBuscaLeva };
  })();

  /* ---------- Avaliações e redes ---------- */
  function iniciarDepoimentos() {
    const estrelas = `<span class="estrelas" aria-label="5 estrelas">${icone("star").repeat(5)}</span>`;
    $("[data-depo]").innerHTML = AVALIACOES.map((a) => `<article>${estrelas}<p>“${esc(a.texto)}”</p><footer><i>${esc(a.nome[0])}</i><span>${esc(a.nome)}<small>Avaliação no ${esc(a.quando)}</small></span></footer></article>`).join("");
  }
  function iniciarSocial() {
    $("[data-social]").innerHTML = SOCIAL.map((s) => `<a href="${s.href}" target="_blank" rel="noopener" aria-label="${esc(s.alt)} (${s.rede === "facebook" ? "Facebook" : "Instagram"})"><img src="${s.imagem}" alt="" loading="lazy"><span>${icone(s.rede === "facebook" ? "fb" : "ig")}</span></a>`).join("");
  }

  /* FAQ: abre e fecha animando a altura, sem pulo */
  function iniciarFaq() {
    const curva = "cubic-bezier(.22, 1, .36, 1)";
    $$(".faq__item").forEach((d) => {
      const corpo = $("p", d);
      if (d.open) d.classList.add("on");
      $("summary", d).addEventListener("click", (e) => {
        e.preventDefault();
        if (d.dataset.anim) return;
        const abrindo = !d.open;
        d.dataset.anim = "1";
        d.classList.toggle("on", abrindo);
        if (abrindo) d.open = true;
        const h = corpo.scrollHeight;
        corpo.style.overflow = "hidden";
        const quadros = [{ height: "0px", paddingBottom: "0px", opacity: 0 }, { height: h + "px", paddingBottom: "18px", opacity: 1 }];
        const anim = corpo.animate(abrindo ? quadros : quadros.slice().reverse(), { duration: abrindo ? 480 : 380, easing: curva });
        anim.onfinish = () => { if (!abrindo) d.open = false; corpo.style.overflow = ""; delete d.dataset.anim; };
      });
    });
  }

  function iniciarRevela() {
    const alvos = $$(".servicos .wrap, .loja__cab, .card, .agenda__form, .avaliacoes__cab, .depo article, .grade a, .faq__item, .chegar__card, .chegar__mapa");
    if (!("IntersectionObserver" in window)) return;
    alvos.forEach((el) => el.classList.add("revela"));
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    alvos.forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    $("[data-ano]").textContent = new Date().getFullYear();
    iniciarStatus();
    iniciarTopo();
    agenda.iniciar();
    loja.iniciar();
    carrinho.iniciar();
    iniciarHero();
    iniciarBanner();
    iniciarGaveta();
    iniciarDepoimentos();
    iniciarSocial();
    iniciarFaq();
    ligarLinksWa();
    iniciarRevela();
  });
})();
