/* ------------------------------------------------------------------
   ritual.js – the stage + timeline engine that performs a nazar utaro.
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';
  const L = NU.L;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const TAU = Math.PI * 2;
  NU.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (el, sel) => el.querySelector(sel);

  const buzz = (p) => { try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(p); } catch (e) { /* ignore */ } };

  class Ritual {
    constructor(host, trad, info, hooks) {
      this.host = host; this.trad = trad; this.info = info || {}; this.hooks = hooks || {};
      this.name = (info && info.name) || 'friend';
      this.steps = trad.steps;
      this.starts = []; let acc = 0;
      this.steps.forEach((s) => { this.starts.push(acc); acc += s.d; });
      this.total = acc;
      this.build();
      this.reset();
      this._raf = null; this._last = 0;
      this._onResize = () => this.fx.resize();
      window.addEventListener('resize', this._onResize);
    }

    // ---------------------------------------------------------------- DOM
    build() {
      const t = this.trad, name = NU.esc(this.name);
      const wm = NU.buildWoman(Object.assign({ id: t.id }, t.woman), { live: true, look: -1.5 });
      this.arm = wm.arm;
      this.host.innerHTML = `
      <div class="ritual" style="--ta:${t.theme.a};--tb:${t.theme.b}">
        <div class="r-top">
          <button class="ib" data-act="exit" aria-label="Back">←</button>
          <div class="r-title"><b>${NU.esc(t.name)}</b><span>nazar utaro for ${name}</span></div>
          <div class="r-ctl">
            <button class="ib" data-act="voice" aria-label="Toggle voice" title="Voice">🗣️</button>
            <button class="ib" data-act="mute" aria-label="Toggle sound" title="Sound">🔊</button>
            <button class="ib" data-act="pause" aria-label="Pause" title="Pause">⏸</button>
            <button class="ib" data-act="skip" aria-label="Next step" title="Next">⏭</button>
          </div>
        </div>
        <div class="r-progress"><i></i></div>
        <div class="r-stagewrap"><div class="stage">
          <svg viewBox="0 0 ${L.W} ${L.H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A woman performing a nazar utaro ritual">
            <defs>${NU.sharedDefs()}${wm.defs}</defs>
            ${NU.buildScene(t.scene)}
            ${NU.buildPerson(this.name)}
            ${wm.lower}
            ${wm.upper}
            ${NU.buildStation(t.station)}
            ${NU.cloudSVG()}
            <g id="holdF"></g>
            ${NU.armMarkup(wm.arm, 'af', true)}
            ${NU.armMarkup(wm.arm, 'an', true)}
            <g id="holdN"></g>
            <rect width="${L.W}" height="${L.H}" fill="url(#vig)" pointer-events="none"/>
          </svg>
          <canvas class="fx"></canvas>
          <div class="lap" hidden></div>
          <div class="nametag">${name}</div>
        </div></div>
        <div class="r-cap"><div class="cap-n"></div><div class="cap-e"></div></div>
      </div>`;
      const R = this.host;
      this.el = {
        root: $(R, '.ritual'), stage: $(R, '.stage'), svg: $(R, 'svg'), canvas: $(R, 'canvas.fx'), lap: $(R, '.lap'),
        prog: $(R, '.r-progress i'), capN: $(R, '.cap-n'), capE: $(R, '.cap-e'),
        lower: R.querySelector('#w-lower'), upper: R.querySelector('#w-upper'), hb: R.querySelector('#w-hb'), hf: R.querySelector('#w-hf'),
        mouth: R.querySelector('#w-mouth'), holdN: R.querySelector('#holdN'), holdF: R.querySelector('#holdF'),
        cloud: R.querySelector('#cloud'), fire: R.querySelector('#fire'), embers: R.querySelector('#embers'), aura: R.querySelector('#aura'),
        pHead: R.querySelector('#p-head'), pMouth: R.querySelector('#p-mouth'), browL: R.querySelector('#p-browL'), browR: R.querySelector('#p-browR'),
        lidL: R.querySelector('#p-lidL'), lidR: R.querySelector('#p-lidR'), cheekL: R.querySelector('#p-cheekL'), cheekR: R.querySelector('#p-cheekR'),
        teeka: R.querySelector('#p-teeka'), bead: R.querySelector('#p-bead'), eggy: R.querySelector('#eggy'), coco: R.querySelector('#cocohalves'),
        oil: [R.querySelector('#oil1'), R.querySelector('#oil2'), R.querySelector('#oil3')],
        btnPause: $(R, '[data-act=pause]'), btnMute: $(R, '[data-act=mute]'), btnVoice: $(R, '[data-act=voice]')
      };
      this.fx = new NU.FX(this.el.canvas);
      this.arms = {
        n: { u: R.querySelector('#anu'), f: R.querySelector('#anf'), h: R.querySelector('#anh'), c: R.querySelector('#anc'), b: this.arm.bangles.map((_, i) => R.querySelector('#anb' + i)) },
        f: { u: R.querySelector('#afu'), f: R.querySelector('#aff'), h: R.querySelector('#afh'), c: R.querySelector('#afc'), b: this.arm.bangles.map((_, i) => R.querySelector('#afb' + i)) }
      };
      this.el.root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]'); if (!b) return;
        const a = b.dataset.act;
        if (a === 'exit') this.hooks.onExit && this.hooks.onExit();
        if (a === 'pause') this.togglePause();
        if (a === 'mute') { NU.audio.setMuted(!NU.audio.muted); this.syncButtons(); }
        if (a === 'voice') { NU.audio.voiceOn = !NU.audio.voiceOn; if (!NU.audio.voiceOn) NU.audio.stopVoice(); else NU.audio.speak(this.curText().n, this.curText().e, this.trad.lang); try { localStorage.setItem('nu-voice', NU.audio.voiceOn ? '1' : '0'); } catch (x) { /* ignore */ } this.syncButtons(); }
        if (a === 'skip') this.skip();
      });
      this.syncButtons();
    }
    syncButtons() {
      this.el.btnMute.textContent = NU.audio.muted ? '🔇' : '🔊';
      this.el.btnPause.textContent = this.paused ? '▶️' : '⏸';
      this.el.btnVoice.classList.toggle('on', !!NU.audio.voiceOn);
    }
    curText() { const s = this.steps[Math.max(0, this.idx)]; return { n: s.t.n, e: s.t.e.replace(/\{name\}/g, this.name) }; }

    // -------------------------------------------------------------- state
    reset() {
      this.t = 0; this.idx = -1; this.paused = false; this.done = false;
      this.cloud = 0; this.mood = 0.1; this.fireLvl = 0; this.crouch = 0; this.kick = 0;
      this.s0 = { cloud: 0, mood: 0.1, fire: 0, crouch: 0 };
      this.near = [254, 342]; this.far = [346, 342]; this.nearV = [0, 0];
      this.held = { n: null, f: null }; this.heldPop = { n: 1, f: 1 }; this.heldWilt = { n: -1, f: -1 };
      this.rotN = 0; this.smokeT = 0; this.wispT = 0; this.drops = 0; this.spreadAt = -1; this.lapPrev = 0; this.cloudKill = false;
      this.fx && this.fx.clear();
      this.el.teeka.setAttribute('opacity', 0); this.el.bead.setAttribute('opacity', 0);
      if (this.el.eggy) this.el.eggy.setAttribute('opacity', 0); if (this.el.coco) this.el.coco.setAttribute('opacity', 0);
      this.el.oil.forEach((o) => { if (o) { o.setAttribute('rx', 0); o.setAttribute('ry', 0); } });
      this.el.holdN.innerHTML = ''; this.el.holdF.innerHTML = '';
      this.el.lap.hidden = true;
      this.el.capN.textContent = ''; this.el.capE.textContent = '';
    }
    start() {
      NU.audio.init(); NU.audio.resume();
      NU.audio.ambient(this.trad.music);
      this.fx.resize();
      this._last = performance.now();
      const loop = (ts) => {
        const dt = Math.max(0, Math.min(0.05, (ts - this._last) / 1000)); this._last = ts;
        this.tick(dt);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
    tick(dt) {
      if (!this.paused && !this.done) this.update(dt);
      else if (this.done) { this.t += dt; this.idleAnim(dt); }
      this.fx.update(dt); this.fx.draw();
    }
    seek(sec) { for (let i = 0; i < sec * 30; i++) this.update(1 / 30); this.fx.resize(); this.render(); }
    togglePause() {
      this.paused = !this.paused;
      if (this.paused) { NU.audio.stopVoice(); if (NU.audio.ready) NU.audio.stopAmbient(); } else if (!this.done) NU.audio.ambient(this.trad.music);
      this.syncButtons();
    }
    skip() {
      if (this.done) return;
      const n = this.idx + 1;
      if (n >= this.steps.length) { this.t = this.total; } else this.t = this.starts[n] + 0.001;
    }
    destroy() {
      cancelAnimationFrame(this._raf); window.removeEventListener('resize', this._onResize);
      NU.audio.stopAmbient(); NU.audio.stopVoice();
    }
    restart() { cancelAnimationFrame(this._raf); this.reset(); this.paused = false; this.syncButtons(); this.start(); }

    // --------------------------------------------------------------- step
    enterStep(i) {
      this.idx = i;
      const s = this.steps[i];
      this.s0 = { cloud: this.cloud, mood: this.mood, fire: this.fireLvl, crouch: this.crouch };
      this.evi = 0; this.lapPrev = 0; this.cloudKill = false;
      const e = s.t.e.replace(/\{name\}/g, this.name);
      this.el.capN.textContent = s.t.n; this.el.capE.textContent = e;
      this.el.capN.hidden = !s.t.n;
      [this.el.capN, this.el.capE].forEach((x) => { x.classList.remove('in'); void x.offsetWidth; x.classList.add('in'); });
      this.setHeld('n', s.hn || null); this.setHeld('f', s.hf || null);
      NU.audio.speak(s.t.n, e, this.trad.lang);
      this.el.lap.hidden = !s.lap;
      if (s.near && s.near.m === 'circle') NU.audio.whoosh();
    }

    setHeld(which, key) {
      if (this.held[which] === key) return;
      this.held[which] = key; this.heldPop[which] = 0; this.heldWilt[which] = -1;
      const g = which === 'n' ? this.el.holdN : this.el.holdF;
      g.innerHTML = key ? `<g class="hp"><g class="hi"></g></g>` : '';
      if (key) this.drawHeld(which);
    }
    drawHeld(which, wilt) {
      const key = this.held[which]; if (!key) return;
      const g = (which === 'n' ? this.el.holdN : this.el.holdF).querySelector('.hi');
      g.innerHTML = NU.PROPS[key].svg({ wilt: wilt || 0 });
    }

    // --------------------------------------------------------------- motion
    motion(spec, u, time, fallback) {
      if (!spec) return fallback;
      switch (spec.m) {
        case 'pt': {
          const w = TAU * (spec.f || 0) * time;
          return { x: spec.x + (spec.ox || 0) * Math.sin(w), y: spec.y + (spec.oy || 0) * Math.sin(w + 1.3) };
        }
        case 'circle': {
          const e = ease(u), th = -Math.PI / 2 + spec.dir * TAU * spec.turns * e;
          const hd = L.HEAD;
          return { x: hd[0] + spec.rx * Math.cos(th), y: hd[1] - 6 + spec.ry * Math.sin(th), lap: Math.min(spec.turns, Math.floor(spec.turns * e + 1e-6) + 1), laps: Math.floor(spec.turns * e + 1e-6) };
        }
        case 'sweep': {
          const p = u * spec.n * 2, k = Math.min(spec.n * 2 - 1, Math.floor(p)), f = ease(p - k);
          const y = k % 2 === 0 ? lerp(spec.y0, spec.y1, f) : lerp(spec.y1, spec.y0, f);
          return { x: spec.x + spec.amp * Math.sin(p * TAU * .8), y, sweepK: (y - spec.y0) / (spec.y1 - spec.y0) };
        }
        case 'path': {
          const rep = spec.rep || 1, uu = u >= 1 ? 1 : (u * rep) % 1;
          const s = (spec.ease === 'in' ? uu * uu : ease(uu)) * (spec.pts.length - 1);
          const i = Math.min(spec.pts.length - 2, Math.floor(s)), f = s - i, a = spec.pts[i], b = spec.pts[i + 1];
          return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f) };
        }
      }
      return fallback;
    }

    update(dt) {
      this.t += dt;
      if (this.t >= this.total) { this.t = this.total; this.finish(); return; }
      let i = Math.max(0, this.idx);
      while (i + 1 < this.steps.length && this.t >= this.starts[i + 1]) i++;
      if (i !== this.idx) this.enterStep(i);
      const s = this.steps[i], u = clamp((this.t - this.starts[i]) / s.d, 0, 1), time = this.t;

      // slow-moving values
      const tc = s.cloud !== undefined ? s.cloud : this.s0.cloud;
      if (!this.cloudKill) this.cloud = lerp(this.s0.cloud, tc, ease(u));
      this.mood = lerp(this.s0.mood, s.mood !== undefined ? s.mood : this.s0.mood, ease(u));
      const tf = s.fire !== undefined ? s.fire : this.s0.fire;
      this.fireLvl = lerp(this.s0.fire, tf, ease(clamp(u * 4, 0, 1)));
      this.kick = Math.max(0, this.kick - dt * 0.7);

      // hands
      const nm = this.motion(s.near, u, time, { x: 254, y: 342 });
      const fm = this.motion(s.far, u, time, { x: 346, y: 342 });
      let tcr = s.crouch !== undefined ? s.crouch : this.s0.crouch;
      if (s.near && s.near.m === 'sweep') tcr = Math.max(0, 0.9 * nm.sweepK) * ease(clamp(u * 6, 0, 1));
      else if (s.crouch === undefined && this.s0.crouch > 0) tcr = 0;
      this.crouch = lerp(this.crouch, tcr, 1 - Math.exp(-dt * 6));
      const k = (s.near && s.near.m === 'circle') ? 26 : 15;
      const px = this.near[0], py = this.near[1];
      this.near[0] += (nm.x - this.near[0]) * (1 - Math.exp(-dt * k));
      this.near[1] += (nm.y - this.near[1]) * (1 - Math.exp(-dt * k));
      this.far[0] += (fm.x - this.far[0]) * (1 - Math.exp(-dt * 12));
      this.far[1] += (fm.y - this.far[1]) * (1 - Math.exp(-dt * 12));
      this.nearV = [(this.near[0] - px) / Math.max(dt, 1e-3), (this.near[1] - py) / Math.max(dt, 1e-3)];

      // laps
      if (nm.laps !== undefined) {
        if (nm.laps > this.lapPrev) { this.lapPrev = nm.laps; NU.audio.whoosh(); this.fx.pull(L.HEAD[0], L.HEAD[1] - 20, this.near[0], this.near[1], 6); }
        this.el.lap.textContent = Math.min(nm.laps + 1, s.near.turns) + ' / ' + s.near.turns;
      }
      if (s.near && s.near.m === 'circle' && s.near.turns > 0) {
        this.wispT -= dt;
        if (this.wispT <= 0 && this.cloud > 0.05) { this.wispT = 0.14; this.fx.pull(L.HEAD[0] + (Math.random() - .5) * 30, L.HEAD[1] - 34, this.near[0], this.near[1], 2); }
      }
      // emitters
      const pk = this.held.n && NU.PROPS[this.held.n];
      if (pk && pk.emit === 'smoke') { this.smokeT -= dt; if (this.smokeT <= 0) { this.smokeT = 0.07; this.fx.smoke(this.near[0] + 3, this.near[1] - 16, 1); } }
      const fl = this.fireLvl + this.kick;
      if (this.trad.station === 'fire' && fl > 0.2 && Math.random() < dt * (3 + fl * 14)) this.fx.spark(L.STN[0], L.STN[1] - 20, 1, 24);
      if (this.trad.station === 'fire' && fl > 0.2 && Math.random() < dt * (2 + fl * 8)) NU.audio.crackle(1);
      if (this.trad.station === 'fire' && fl > 0.3 && Math.random() < dt * 4) this.fx.smoke(L.STN[0], L.STN[1] - 50, 1, '#9aa0aa');
      if (this.mood > 0.8 && Math.random() < dt * 8) this.fx.stars(L.HEAD[0], L.HEAD[1] + 10, 1, 70);

      // oil spreading
      if (this.spreadAt >= 0) { /* handled in render */ }

      // events
      if (s.ev) while (this.evi < s.ev.length && u >= s.ev[this.evi].at) this.event(s.ev[this.evi++]);

      this.render(s, u);
    }

    finish() {
      if (this.done) return;
      this.done = true;
      this.render();
      NU.audio.stopAmbient();
      this.hooks.onEnd && this.hooks.onEnd();
    }
    idleAnim(dt) {
      const j = Math.sin(this.t * 2) * 6;
      this.near[0] += (BLESS_N_X + j - this.near[0]) * (1 - Math.exp(-dt * 6));
      this.render();
      if (Math.random() < dt * 3) this.fx.stars(L.HEAD[0], L.HEAD[1], 1, 80);
      if (Math.random() < dt * 1.2) this.fx.petals(1);
    }

    // -------------------------------------------------------------- events
    popText(text, x, y, cls) {
      if (!text) return;
      const d = document.createElement('div');
      d.className = 'pop ' + (cls || ''); d.textContent = text;
      d.style.left = (x / L.W * 100) + '%'; d.style.top = (y / L.H * 100) + '%';
      this.el.stage.appendChild(d);
      setTimeout(() => d.remove(), 1500);
    }
    event(ev) {
      const A = NU.audio, fx = this.fx, st = L.STN;
      switch (ev.do) {
        case 'burst':
          A.burst(); this.kick = 1; fx.burst(st[0], st[1] - 30, 46, ['#ffd166', '#ff9f1c', '#ff6a00', '#fff3b0']); fx.smoke(st[0], st[1] - 40, 8, '#8d939e');
          this.popText('PHATT!', st[0] + 10, st[1] - 90, 'hot'); buzz(30);
          break;
        case 'crackle': A.crackle(8); fx.spark(st[0], st[1] - 24, 14, 50); break;
        case 'poof': A.poof(); this.cloud = 0; this.cloudKill = true; fx.dark(L.HEAD[0], L.HEAD[1] - 50, 34); fx.stars(L.HEAD[0], L.HEAD[1] - 50, 14, 50); fx.ring(L.HEAD[0], L.HEAD[1] - 50, '#fff3b0', 90); break;
        case 'pop': A.pop(); this.popText(ev.text, 120, 250); break;
        case 'crack': A.crack(); this.popText(ev.text !== undefined ? ev.text : 'crack!', (Math.random() < .5 ? 214 : 388) + (Math.random() - .5) * 20, 130 + Math.random() * 30, 'hot'); fx.ring(L.CX, 146, '#fff', 56); break;
        case 'teeka': A.pop(); this.el.teeka.setAttribute('opacity', 1); fx.stars(L.PX + 24, 346, 8, 14); break;
        case 'conch': A.conch(); this.popText('ulu-ulu!', 250, 140, 'hot'); fx.stars(L.CX - 20, 160, 10, 40); break;
        case 'petals': fx.petals(46); fx.stars(L.HEAD[0], L.HEAD[1] - 10, 22, 80); break;
        case 'chime': A.chime(this.trad.music); fx.confetti(70); buzz([20, 40, 20]); break;
        case 'smash':
          A.smash(); this.setHeld('n', null); this.el.coco.setAttribute('opacity', 1); fx.drops(st[0], st[1] - 14, 34, '#f4f1e8'); fx.spark(st[0], st[1] - 10, 0);
          for (let i = 0; i < 8; i++) fx.add({ kind: 'dot', x: st[0], y: st[1] - 12, vx: (Math.random() - .5) * 220, vy: -100 - Math.random() * 120, g: 420, life: .9, size: 3.2, color: '#6b4423' });
          this.popText('SMASH!', st[0] + 6, st[1] - 80, 'hot'); this.cloud = Math.min(this.cloud, .15);
          break;
        case 'pin': A.pop(); this.setHeld('n', null); this.el.bead.setAttribute('opacity', 1); fx.stars(L.PX + 26, 402, 14, 20); this.popText('🧿', L.PX + 36, 380); break;
        case 'drop': {
          A.drop(); this.drops++;
          fx.add({ kind: 'dot', x: this.near[0], y: this.near[1] + 24, vy: 120, g: 520, life: .22, size: 3.2, color: '#f2c230' });
          fx.ring(st[0], st[1] - 1, '#fff', 30);
          break;
        }
        case 'spread': this.spreadAt = this.t; A.sparkle(); break;
        case 'crackegg': A.crack(); this.setHeld('n', null); this.el.eggy.setAttribute('opacity', 1); fx.drops(st[0], st[1] - 30, 12, '#fff8ec'); this.popText('crack!', st[0], st[1] - 70); break;
        case 'whisper': A.whisper(); break;
        case 'whoosh': A.whoosh(); break;
        case 'salt': A.crackle(3); fx.salt(this.near[0], this.near[1], L.PX, L.HEAD[1] + 10, 22); break;
        case 'clap': A.clap(); fx.ring(L.CX, 272, '#fff', 60); this.popText('👏', L.CX - 10, 230); break;
      }
    }

    // -------------------------------------------------------------- render
    render(s, u) {
      s = s || this.steps[Math.max(0, this.idx)];
      const E = this.el, c = this.crouch, set = (el, a, v) => el && el.setAttribute(a, v);
      // body
      const sc = 1 - 0.28 * c;
      set(E.lower, 'transform', `translate(0 ${L.FLOOR_Y}) scale(1 ${sc.toFixed(4)}) translate(0 ${-L.FLOOR_Y})`);
      set(E.upper, 'transform', `translate(0 ${(L.CROUCH * c).toFixed(2)})`);
      const tilt = clamp((this.near[0] - L.CX) / 70, -1, 1) * 4 + (this.done ? Math.sin(this.t * 1.6) * 1.5 : 0);
      const ht = `rotate(${tilt.toFixed(2)} ${L.CX} 205)`;
      set(E.hb, 'transform', ht); set(E.hf, 'transform', ht);
      const talking = !this.done && !this.paused && s && u !== undefined && u < 0.82;
      E.mouth && E.mouth.classList.toggle('talking', !!talking);

      // arms
      const dy = L.CROUCH * c;
      const SN = [L.SN[0], L.SN[1] + dy], SF = [L.SF[0], L.SF[1] + dy];
      this.drawArm('n', SN, this.near, -1); this.drawArm('f', SF, this.far, 1);
      // held props
      this.placeHeld('n', this.arms.n.hand, true); this.placeHeld('f', this.arms.f.hand, false);

      // cloud
      const cl = clamp(this.cloud, 0, 1);
      const shake = (s && s.near && s.near.m === 'circle') ? Math.sin(this.t * 40) * 1.4 * cl : 0;
      set(E.cloud, 'transform', `translate(${L.PX + shake} ${L.HEAD[1] - 70}) scale(${(0.3 + 0.7 * cl).toFixed(3)})`);
      set(E.cloud, 'opacity', clamp(cl * 1.6, 0, 1));

      // fire
      const fl = clamp(this.fireLvl + this.kick * 0.9, 0, 1.6);
      if (E.fire) {
        const fs = 0.3 + 0.8 * fl, sx = L.STN[0], sy = L.STN[1] - 8;
        set(E.fire, 'transform', `translate(${sx} ${sy}) scale(${fs.toFixed(3)}) translate(${-sx} ${-sy})`);
        set(E.fire, 'opacity', fl < 0.03 ? 0 : 1);
        set(E.embers, 'opacity', (0.35 + 0.65 * Math.min(1, fl)).toFixed(2));
      }

      // person's mood
      const m = this.mood, x = L.PX, sad = 1 - m;
      set(E.pMouth, 'd', `M${x - 9},${(348 - (m - .5) * 6).toFixed(1)} Q${x},${(348 + (m - .5) * 24 + 2).toFixed(1)} ${x + 9},${(348 - (m - .5) * 6).toFixed(1)}`);
      set(E.browL, 'd', `M${x - 17},${(322 + sad * 3.2).toFixed(1)} L${x - 5},${(322 - sad * 3.2).toFixed(1)}`);
      set(E.browR, 'd', `M${x + 5},${(322 - sad * 3.2).toFixed(1)} L${x + 17},${(322 + sad * 3.2).toFixed(1)}`);
      set(E.lidL, 'height', (sad * 4.4).toFixed(2)); set(E.lidR, 'height', (sad * 4.4).toFixed(2));
      set(E.cheekL, 'opacity', clamp((m - .45) * 1.1, 0, .5)); set(E.cheekR, 'opacity', clamp((m - .45) * 1.1, 0, .5));
      set(E.pHead, 'transform', `translate(0 ${(sad * 3).toFixed(2)}) rotate(${(sad * 4).toFixed(2)} ${x} 372)`);
      set(E.aura, 'opacity', (Math.pow(m, 3) * 0.95).toFixed(2));

      // oil in water (Italy)
      if (E.oil[0]) {
        const sp = this.spreadAt >= 0 ? clamp((this.t - this.spreadAt) / 2.4, 0, 1) : 0;
        E.oil.forEach((o, i) => {
          const present = this.drops > i;
          const rx = present ? lerp(2.6, [26, 14, 18][i], ease(sp)) : 0;
          set(o, 'rx', rx.toFixed(2)); set(o, 'ry', (rx * (0.22 + 0.0)).toFixed(2));
        });
      }
      // progress
      E.prog.style.transform = `scaleX(${clamp(this.t / this.total, 0, 1).toFixed(4)})`;
    }

    drawArm(which, S, T, side) {
      const o = NU.armShape(this.arm, S, T, side), a = this.arms[which];
      a.u.setAttribute('d', o.u); a.f.setAttribute('d', o.f);
      a.h.setAttribute('cx', o.H[0].toFixed(1)); a.h.setAttribute('cy', o.H[1].toFixed(1));
      o.b.forEach((d, i) => a.b[i] && a.b[i].setAttribute('d', d));
      if (a.c) a.c.setAttribute('d', o.c);
      a.hand = o.H;
    }
    placeHeld(which, hand, isNear) {
      const key = this.held[which]; if (!key || !hand) return;
      const P = NU.PROPS[key], g = (which === 'n' ? this.el.holdN : this.el.holdF).querySelector('.hp');
      if (!g) return;
      this.heldPop[which] = Math.min(1, this.heldPop[which] + 0.09);
      const pop = ease(this.heldPop[which]) * (1 + 0.15 * Math.sin(this.heldPop[which] * Math.PI));
      let rot = P.rot0 || 0;
      if (P.rot && isNear) {
        const v = this.nearV, sp = Math.hypot(v[0], v[1]);
        if (sp > 30) { const target = Math.atan2(v[1], v[0]) * 180 / Math.PI; this.rotN = target; }
        rot += this.rotN;
      }
      if (key === 'onusa' && isNear) rot += clamp((this.nearV[0]) / 40, -22, 22);
      if (key === 'oilbottle') rot += (this.steps[this.idx] && this.steps[this.idx].crouch > 0.5) ? -25 : 0;
      g.setAttribute('transform', `translate(${hand[0].toFixed(1)} ${hand[1].toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${pop.toFixed(3)})`);
      if (key === 'rue' || key === 'herbs') {
        const w = Math.round(clamp((1 - this.cloud) * (key === 'rue' ? 1 : 0.5), 0, 1) * 10);
        if (this.heldWilt[which] !== w) { this.heldWilt[which] = w; this.drawHeld(which, w / 10); }
      }
    }
  }
  const BLESS_N_X = 160;
  NU.Ritual = Ritual;
})(window.NU);
