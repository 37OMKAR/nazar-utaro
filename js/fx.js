/* ------------------------------------------------------------------
   fx.js – a tiny canvas particle system drawn over the SVG stage.
   Coordinates are stage coordinates (480 x 640).
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';
  const rnd = (a, b) => a + Math.random() * (b - a);
  const CONF = ['#ff4d6d', '#ffd166', '#06d6a0', '#4cc9f0', '#b185db', '#ff9f1c'];

  class FX {
    constructor(canvas) {
      this.c = canvas; this.ctx = canvas.getContext('2d'); this.p = []; this.scale = 1;
    }
    resize() {
      const r = this.c.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.c.width = Math.max(2, Math.round(r.width * dpr)); this.c.height = Math.max(2, Math.round(r.height * dpr));
      this.scale = this.c.width / NU.L.W;
    }
    add(o) { if (this.p.length < 700) this.p.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0, life: 1, age: 0, size: 3, grow: 0, kind: 'dot', color: '#fff', rot: 0, vr: 0 }, o)); }

    spark(x, y, n, spread) {
      for (let i = 0; i < n; i++) this.add({ kind: 'spark', x: x + rnd(-8, 8), y, vx: rnd(-1, 1) * (spread || 40), vy: rnd(-60, -170), g: 120, drag: .2, life: rnd(.6, 1.4), size: rnd(1.4, 3.2), color: ['#ffd166', '#ff9f1c', '#ff6a00', '#fff3b0'][i % 4] });
    }
    smoke(x, y, n, col) {
      for (let i = 0; i < n; i++) this.add({ kind: 'smoke', x: x + rnd(-4, 4), y, vx: rnd(-8, 12), vy: rnd(-26, -50), life: rnd(1.4, 2.6), size: rnd(5, 9), grow: rnd(9, 16), color: col || '#cfd3dc' });
    }
    dark(x, y, n) {   // little pieces of nazar leaving the head
      for (let i = 0; i < n; i++) this.add({ kind: 'dark', x: x + rnd(-24, 24), y: y + rnd(-14, 10), vx: rnd(-20, 20), vy: rnd(-30, -6), life: rnd(.9, 1.6), size: rnd(3, 7), color: '#3b2f4f' });
    }
    pull(x, y, tx, ty, n) {
      for (let i = 0; i < n; i++) this.add({ kind: 'pull', x: x + rnd(-14, 14), y: y + rnd(-14, 14), tx, ty, life: rnd(.55, .9), size: rnd(3, 6), color: '#463a5e' });
    }
    salt(x, y, tx, ty, n) {
      for (let i = 0; i < n; i++) { const a = Math.atan2(ty - y, tx - x) + rnd(-.5, .5), v = rnd(60, 150); this.add({ kind: 'salt', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, g: 220, life: rnd(.7, 1.3), size: rnd(1.4, 2.6), color: '#ffffff' }); }
    }
    petals(n) {
      for (let i = 0; i < n; i++) this.add({ kind: 'petal', x: rnd(40, 440), y: rnd(-40, -4), vx: rnd(-14, 14), vy: rnd(40, 90), g: 6, life: rnd(3.5, 6), size: rnd(4, 7), color: ['#ff9f1c', '#ff6b9d', '#ffd166', '#ff4d6d', '#fff'][i % 5], rot: rnd(0, 6.3), vr: rnd(-3, 3), sway: rnd(0, 6.3) });
    }
    confetti(n) {
      for (let i = 0; i < n; i++) this.add({ kind: 'conf', x: rnd(60, 420), y: rnd(-60, -5), vx: rnd(-30, 30), vy: rnd(70, 150), life: rnd(3, 5), size: rnd(3, 6), color: CONF[i % CONF.length], rot: rnd(0, 6.3), vr: rnd(-8, 8) });
    }
    stars(x, y, n, r) {
      for (let i = 0; i < n; i++) this.add({ kind: 'star', x: x + rnd(-r, r), y: y + rnd(-r, r), vy: rnd(-12, -2), life: rnd(.8, 1.8), size: rnd(3, 7), color: ['#fff3b0', '#ffd166', '#fff'][i % 3] });
    }
    drops(x, y, n, col) {
      for (let i = 0; i < n; i++) this.add({ kind: 'dot', x, y, vx: rnd(-80, 80), vy: rnd(-140, -40), g: 360, life: rnd(.5, 1), size: rnd(2, 3.6), color: col || '#e8f6ff' });
    }
    ring(x, y, col, max) { this.add({ kind: 'ring', x, y, life: .6, size: 4, grow: (max || 80) / .6, color: col || '#fff' }); }
    burst(x, y, n, cols) {
      for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), v = rnd(60, 230); this.add({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, g: 160, drag: 1.2, life: rnd(.5, 1.2), size: rnd(1.6, 3.4), color: cols[i % cols.length] }); }
    }

    update(dt) {
      const P = this.p;
      for (let i = P.length - 1; i >= 0; i--) {
        const q = P[i];
        q.age += dt;
        if (q.age >= q.life) { P.splice(i, 1); continue; }
        if (q.kind === 'pull') {
          const k = q.age / q.life; q.x += (q.tx - q.x) * Math.min(1, dt * (3 + k * 10)); q.y += (q.ty - q.y) * Math.min(1, dt * (3 + k * 10));
          if (Math.hypot(q.tx - q.x, q.ty - q.y) < 5) q.age = q.life;
          continue;
        }
        q.vy += q.g * dt;
        const d = Math.max(0, 1 - q.drag * dt);
        q.vx *= d; q.vy *= d;
        if (q.kind === 'petal') q.vx += Math.sin(q.age * 2.4 + q.sway) * 30 * dt;
        q.x += q.vx * dt; q.y += q.vy * dt; q.size += q.grow * dt; q.rot += q.vr * dt;
      }
    }
    draw() {
      const ctx = this.ctx, s = this.scale;
      ctx.clearRect(0, 0, this.c.width, this.c.height);
      for (const q of this.p) {
        const k = Math.min(1, Math.max(0, q.age / q.life)), x = q.x * s, y = q.y * s, r = Math.max(0, q.size * s);
        ctx.save();
        switch (q.kind) {
          case 'spark': ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 1 - k; ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); break;
          case 'smoke': ctx.globalAlpha = (1 - k) * .34; ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); break;
          case 'dark': case 'pull': ctx.globalAlpha = (q.kind === 'pull' ? .85 : 1 - k) * .85; ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(x, y, r * (1 - k * .5), 0, 6.283); ctx.fill(); break;
          case 'salt': ctx.globalAlpha = 1 - k * k; ctx.fillStyle = '#fff'; ctx.fillRect(x, y, r, r); break;
          case 'dot': ctx.globalAlpha = 1 - k; ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); break;
          case 'petal': ctx.globalAlpha = Math.min(1, (1 - k) * 2.5); ctx.translate(x, y); ctx.rotate(q.rot); ctx.fillStyle = q.color; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .55, 0, 0, 6.283); ctx.fill(); break;
          case 'conf': ctx.globalAlpha = Math.min(1, (1 - k) * 3); ctx.translate(x, y); ctx.rotate(q.rot); ctx.scale(1, Math.abs(Math.sin(q.age * 6 + q.rot))); ctx.fillStyle = q.color; ctx.fillRect(-r, -r * .6, r * 2, r * 1.2); break;
          case 'star': {
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.sin(k * Math.PI); ctx.fillStyle = q.color; ctx.translate(x, y);
            ctx.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .28 : r, a = i * Math.PI / 4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); break;
          }
          case 'ring': ctx.globalAlpha = (1 - k) * .8; ctx.strokeStyle = q.color; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); break;
        }
        ctx.restore();
      }
    }
    clear() { this.p.length = 0; }
  }
  NU.FX = FX;
})(window.NU);
