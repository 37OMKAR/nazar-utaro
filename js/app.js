/* ------------------------------------------------------------------
   app.js – the creator page, the gate screen the recipient sees,
   the ritual view and the end card.
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';
  const esc = NU.esc;
  const app = document.getElementById('app');
  const params = new URLSearchParams(location.search);
  const state = { to: '', from: '', msg: '', t: 'maharashtra', ritual: null, mode: 'create', dev: null };
  try { NU.audio.voiceOn = localStorage.getItem('nu-voice') === '1'; } catch (e) { /* ignore */ }

  const baseUrl = () => location.href.split('#')[0].split('?')[0];
  function buildLink() {
    const p = new URLSearchParams();
    p.set('to', state.to.trim());
    if (state.from.trim()) p.set('from', state.from.trim());
    if (state.msg.trim()) p.set('m', state.msg.trim());
    p.set('t', state.t);
    return baseUrl() + '?' + p.toString();
  }
  const pickRandom = (not) => { const l = NU.traditions.filter((t) => t.id !== not); return l[Math.floor(Math.random() * l.length)]; };
  const resolveTrad = (id) => (id === 'surprise' ? pickRandom() : NU.byId(id) || NU.traditions[0]);

  function stopRitual() { if (state.ritual) { state.ritual.destroy(); state.ritual = null; } }

  // ================================================================= CREATE
  function tcard(t, sel) {
    return `<button type="button" class="tcard${sel ? ' sel' : ''}" data-id="${t.id}" aria-pressed="${sel}" style="--ta:${t.theme.a};--tb:${t.theme.b}">
      <span class="ph">${NU.portrait(t, 'bust')}</span><b>${esc(t.name)}</b><small>${esc(t.sub)}</small></button>`;
  }
  function detailHTML(id) {
    if (id === 'surprise') return `<div class="detail-in"><div class="dice">🎲</div><div><h3>Surprise me!</h3><p>She'll arrive in a randomly chosen tradition when the link is opened, so even you won't know whose granny shows up.</p></div></div>`;
    const t = NU.byId(id);
    return `<div class="detail-in" style="--ta:${t.theme.a};--tb:${t.theme.b}"><div class="big-ph">${NU.portrait(t, 'full')}</div>
      <div><h3>${esc(t.name)} <small>${esc(t.group)}</small></h3><p>${esc(t.blurb)}</p>
      <div class="chips">${t.chips.map((c) => `<span>${esc(c)}</span>`).join('')}</div>
      <p class="fact"><b>Did you know?</b> ${esc(t.fact)}</p></div></div>`;
  }

  function showCreate() {
    stopRitual(); state.mode = 'create';
    document.title = 'Nazar Utaro – a little ritual to lift someone\'s spirits';
    const india = NU.traditions.filter((t) => t.group === 'India'), world = NU.traditions.filter((t) => t.group !== 'India');
    app.innerHTML = `
    <div class="wrap">
      <header class="hero">
        <div class="logo" aria-hidden="true"><i></i></div>
        <h1>Nazar Utaro</h1>
        <p class="lead">Someone feeling low? Send them a nani who does the <b>whole nazar utarna ritual</b>, the moment they open your link. Pick her state, community or country, and watch her dress, props and chants change.</p>
      </header>

      <section class="card">
        <h2><span class="n">1</span> Who needs some love?</h2>
        <div class="fields">
          <label>Their name <em>*</em><input id="f-to" maxlength="30" placeholder="e.g. Priya" autocomplete="off" value="${esc(state.to)}"></label>
          <label>Your name <small>(optional)</small><input id="f-from" maxlength="30" placeholder="e.g. Omkar" autocomplete="off" value="${esc(state.from)}"></label>
          <label class="wide">A sweet message for the end <small>(optional)</small><textarea id="f-msg" maxlength="180" rows="2" placeholder="e.g. You've been carrying too much lately. Rest. I'm always a call away.">${esc(state.msg)}</textarea></label>
        </div>
      </section>

      <section class="card">
        <h2><span class="n">2</span> Choose her tradition</h2>
        <h4 class="grp">🇮🇳 India: states &amp; communities</h4>
        <div class="grid" id="g-india">${india.map((t) => tcard(t, t.id === state.t)).join('')}</div>
        <h4 class="grp">🌍 Around the world</h4>
        <div class="grid" id="g-world">${world.map((t) => tcard(t, t.id === state.t)).join('')}
          <button type="button" class="tcard dicecard${state.t === 'surprise' ? ' sel' : ''}" data-id="surprise" aria-pressed="${state.t === 'surprise'}"><span class="ph dice">🎲</span><b>Surprise me</b><small>A random tradition</small></button></div>
        <div class="detail" id="detail">${detailHTML(state.t)}</div>
      </section>

      <div class="actions">
        <button class="btn ghost" id="b-prev">▶ Preview the ritual</button>
        <button class="btn" id="b-make">🧿 Create the link</button>
      </div>
      <p class="err" id="err" role="alert"></p>

      <section class="card result" id="result" hidden></section>

      <footer class="foot">
        <p>A playful, loving take on folk traditions that people have shared for generations. It is meant to make someone smile, not to replace real care. If a friend is really struggling, call them. 💛</p>
        <p>Never burn chillies near anyone's face for real: here the fire is virtual and perfectly safe.</p>
      </footer>
    </div>`;

    const $ = (s) => app.querySelector(s);
    const bind = (id, key) => $(id).addEventListener('input', (e) => { state[key] = e.target.value; });
    bind('#f-to', 'to'); bind('#f-from', 'from'); bind('#f-msg', 'msg');
    app.querySelectorAll('.tcard').forEach((b) => b.addEventListener('click', () => {
      state.t = b.dataset.id;
      app.querySelectorAll('.tcard').forEach((x) => { const on = x.dataset.id === state.t; x.classList.toggle('sel', on); x.setAttribute('aria-pressed', on); });
      $('#detail').innerHTML = detailHTML(state.t);
      $('#detail').classList.remove('flash'); void $('#detail').offsetWidth; $('#detail').classList.add('flash');
    }));
    const needName = () => {
      if (!state.to.trim()) { $('#err').textContent = 'Please type the name of the person who needs the nazar utaro 🙏'; $('#f-to').focus(); return false; }
      $('#err').textContent = ''; return true;
    };
    $('#b-prev').addEventListener('click', () => { if (!needName()) return; showGate({ to: state.to.trim(), from: state.from.trim(), msg: state.msg.trim(), t: state.t }, true); });
    $('#b-make').addEventListener('click', () => { if (!needName()) return; showResult(); });
  }

  function showResult() {
    const link = buildLink(), name = state.to.trim(), from = state.from.trim();
    const text = `🧿 ${from ? from + ' has' : 'Someone who cares has'} sent you a nazar utaro, ${name}! Open this and let her take all the bad vibes away 👇`;
    const box = app.querySelector('#result');
    box.hidden = false;
    box.innerHTML = `<h2><span class="n">✓</span> Your link is ready</h2>
      <p class="small">Send this to <b>${esc(name)}</b>. As soon as they open it, she begins.</p>
      <div class="linkrow"><input id="lnk" readonly value="${esc(link)}" aria-label="Link to share"><button class="btn small" id="b-copy">Copy</button></div>
      <div class="share">
        <a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}">💬 WhatsApp</a>
        <a class="btn tg" target="_blank" rel="noopener" href="https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}">✈️ Telegram</a>
        <button class="btn ghost" id="b-share" ${navigator.share ? '' : 'hidden'}>⤴ Share…</button>
      </div>`;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.querySelector('#b-copy').addEventListener('click', async (e) => {
      const inp = box.querySelector('#lnk');
      try { await navigator.clipboard.writeText(link); } catch (x) { inp.select(); document.execCommand('copy'); }
      e.target.textContent = 'Copied ✓'; setTimeout(() => { e.target.textContent = 'Copy'; }, 1800);
    });
    const sh = box.querySelector('#b-share');
    if (sh) sh.addEventListener('click', () => navigator.share({ title: 'Nazar Utaro 🧿', text, url: link }).catch(() => {}));
  }

  // ================================================================== GATE
  function showGate(info, fromCreator) {
    stopRitual(); state.mode = 'gate';
    const t = resolveTrad(info.t);
    document.title = `${info.from || 'Someone'} sent ${info.to} a nazar utaro 🧿`;
    app.innerHTML = `
    <div class="gate" style="--ta:${t.theme.a};--tb:${t.theme.b}">
      ${fromCreator ? '<button class="ib back" id="g-back" aria-label="Back">←</button>' : ''}
      <div class="gate-card">
        <div class="gate-ph">${NU.portrait(t, 'full')}</div>
        <p class="kicker">${info.from ? esc(info.from) + ' sent you something' : 'Someone who cares sent you something'}</p>
        <h1>${esc(info.to)}, a little <span>nazar utaro</span> is waiting for you</h1>
        <p class="sub">${esc(t.name)} style · ${esc(t.chips.slice(0, 3).join(' · '))}</p>
        <button class="btn big" id="g-go">🧿 Begin the ritual</button>
        <p class="hint">🔊 Turn your sound on for the full experience</p>
        <a class="mk" href="${baseUrl()}">Make one for someone you love →</a>
      </div>
    </div>`;
    app.querySelector('#g-go').addEventListener('click', () => startRitual(info, t, fromCreator));
    const back = app.querySelector('#g-back'); if (back) back.addEventListener('click', showCreate);
  }

  // =============================================================== RITUAL
  function startRitual(info, trad, fromCreator) {
    stopRitual(); state.mode = 'ritual';
    const r = new NU.Ritual(app, trad, { name: info.to }, {
      onExit: () => { if (fromCreator) showCreate(); else showGate(info, false); },
      onEnd: () => setTimeout(() => showEnd(info, trad, fromCreator), 1600)
    });
    state.ritual = r;
    r.start();
    if (state.dev) { r.seek(state.dev); r.paused = true; r.syncButtons(); }
  }

  function showEnd(info, trad, fromCreator) {
    const r = state.ritual; if (!r || state.mode !== 'ritual') return;
    const root = app.querySelector('.ritual'); if (!root) return;
    const div = document.createElement('div');
    div.className = 'endcard';
    const msg = info.msg ? `<blockquote>“${esc(info.msg)}”<cite>${info.from ? '— ' + esc(info.from) : ''}</cite></blockquote>` : '';
    div.innerHTML = `<div class="end-in">
      <div class="badge">🧿✨</div>
      <h2>Nazar utar gayi, ${esc(info.to)}!</h2>
      <p class="lead">Take a deep breath. You are loved, and the evil eye has officially been shown the door.</p>
      ${msg}
      <p class="fact"><b>Did you know?</b> ${esc(trad.fact)}</p>
      <div class="end-actions">
        <button class="btn" data-a="again">↺ Watch again</button>
        <button class="btn ghost" data-a="styles">👗 Try another style</button>
        <button class="btn ghost" data-a="make">💌 Send one to someone</button>
      </div>
      <div class="styles" hidden></div>
    </div>`;
    root.appendChild(div);
    requestAnimationFrame(() => div.classList.add('show'));
    div.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a],[data-t]'); if (!b) return;
      if (b.dataset.t) { div.remove(); startRitual(info, NU.byId(b.dataset.t), fromCreator); return; }
      const a = b.dataset.a;
      if (a === 'again') { div.remove(); startRitual(info, trad, fromCreator); }
      if (a === 'make') { window.location.href = baseUrl(); }
      if (a === 'styles') {
        const box = div.querySelector('.styles');
        box.hidden = !box.hidden;
        if (!box.hidden && !box.innerHTML) box.innerHTML = NU.traditions.filter((x) => x.id !== trad.id).map((x) => `<button class="mini" data-t="${x.id}" style="--ta:${x.theme.a}"><span class="ph">${NU.portrait(x, 'bust')}</span><b>${esc(x.name)}</b></button>`).join('');
      }
    });
  }

  // ================================================================== BOOT
  function boot() {
    const to = (params.get('to') || '').trim().slice(0, 30);
    if (to) {
      const info = { to, from: (params.get('from') || '').slice(0, 30), msg: (params.get('m') || '').slice(0, 180), t: params.get('t') || 'maharashtra' };
      if (params.get('at') != null) state.dev = parseFloat(params.get('at')) || 0;
      if (params.get('autostart')) { startRitual(info, resolveTrad(info.t), false); return; }
      showGate(info, false);
    } else showCreate();
  }
  boot();
})(window.NU);
