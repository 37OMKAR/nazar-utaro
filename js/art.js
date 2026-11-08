/* ------------------------------------------------------------------
   art.js – everything that is drawn: the woman (in many costumes),
   the person being cleansed, the nazar cloud, props and stations.
   All shapes are plain SVG strings in a 480 x 640 stage.
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';

  const CX = 300;                 // woman's centre line
  const PX = 165;                 // person's centre line
  const L = {
    W: 480, H: 640, CX, PX,
    SN: [CX - 38, 222], SF: [CX + 38, 222],   // shoulders (near = towards the person)
    HEAD: [PX, 335], STN: [236, 455], FLOOR_Y: 590, WAIST: 330,
    CROUCH: 72.8,                             // how far the upper body drops at crouch = 1
    ARM: [100, 101]
  };
  NU.L = L;
  let UID = 0;

  // ---- colour helper ---------------------------------------------------------
  function rgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function shade(h, a) {
    const c = rgb(h), t = a < 0 ? 0 : 255, p = Math.abs(a);
    return 'rgb(' + c.map((v) => Math.round((t - v) * p + v)).join(',') + ')';
  }
  NU.shade = shade;

  function pattern(pid, type, c, bg) {
    if (type === 'dots') return `<pattern id="${pid}" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="6.5" cy="6.5" r="2" fill="${c}"/></pattern>`;
    if (type === 'florals') return `<pattern id="${pid}" width="24" height="24" patternUnits="userSpaceOnUse"><g fill="${c}"><circle cx="7" cy="5" r="2.2"/><circle cx="7" cy="9.6" r="2.2"/><circle cx="4.7" cy="7.3" r="2.2"/><circle cx="9.3" cy="7.3" r="2.2"/></g><circle cx="7" cy="7.3" r="1.5" fill="#ffe082"/><circle cx="19" cy="19" r="2.3" fill="${c}" opacity=".8"/></pattern>`;
    if (type === 'phulkari') return `<pattern id="${pid}" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M9,1.5 L16.5,9 L9,16.5 L1.5,9Z" fill="none" stroke="${c}" stroke-width="1.7"/><circle cx="9" cy="9" r="2.1" fill="#35a853"/></pattern>`;
    return '';
  }

  // =============================== THE WOMAN ===================================
  function neckline(kind) {          // returns the path part from left shoulder to right shoulder
    switch (kind) {
      case 'v': return `L${CX - 20},207 L${CX},252 L${CX + 20},207 L${CX + 42},214`;
      case 'square': return `L${CX - 22},207 L${CX - 22},238 L${CX + 22},238 L${CX + 22},207 L${CX + 42},214`;
      case 'high': return `L${CX - 13},201 Q${CX},213 ${CX + 13},201 L${CX + 42},214`;
      case 'kimono': return `L${CX - 17},205 L${CX + 8},262 L${CX + 17},205 L${CX + 42},214`;
      default: return `L${CX - 24},207 Q${CX - 20},247 ${CX},249 Q${CX + 20},247 ${CX + 24},207 L${CX + 42},214`;
    }
  }
  function neckTrimPath(kind) {
    return 'M' + neckline(kind).slice(1).replace(/L\d+,214$/, '').replace(/^L/, '');
  }

  function bodice(w, yb, wb) {
    return `M${CX - 42},214 ${neckline(w.top.neck)} L${CX + 34},300 L${CX + wb},${yb} L${CX - wb},${yb} L${CX - 34},300 Z`;
  }

  function halfW(y0, hy, w0, w1, p) { return (y) => w0 + (w1 - w0) * Math.pow(Math.max(0, (y - y0) / (hy - y0)), p); }

  function lowerSVG(w, id) {
    const Lw = w.lower, y0 = L.WAIST, hy = Lw.hemY || 582;
    let s = '', defs = '';
    if (Lw.pattern) defs += pattern(id + 'lp', Lw.pattern, Lw.patC || '#fff');
    const feetCol = w.shoes || null;
    const feet = (yy) => {
      let f = '';
      const col = feetCol || w.skin;
      f += `<ellipse cx="${CX - 17}" cy="${yy}" rx="12" ry="6.5" fill="${col}"/><ellipse cx="${CX + 17}" cy="${yy}" rx="12" ry="6.5" fill="${col}"/>`;
      if (!feetCol) f += `<path d="M${CX - 28},${yy - 7} h22 M${CX + 6},${yy - 7} h22" stroke="#e8c26a" stroke-width="2.4"/>`;
      return f;
    };
    switch (Lw.type) {
      case 'sari': case 'flare': {
        const flare = Lw.type === 'flare';
        const hw = Lw.hw || (flare ? 90 : 66);
        const W = halfW(y0, hy, 30, hw, flare ? 1.05 : 1.25);
        if (hy < 578) {            // calf-length: show stockinged legs + shoes
          s += `<rect x="${CX - 27}" y="${hy - 6}" width="15" height="${590 - hy}" fill="${w.hose || shade(w.skin, -.08)}"/><rect x="${CX + 12}" y="${hy - 6}" width="15" height="${590 - hy}" fill="${w.hose || shade(w.skin, -.08)}"/>`;
          s += feet(588);
        } else s += feet(hy + 4);
        const body = `M${CX - 30},${y0} L${CX + 30},${y0} L${CX + W(hy)},${hy} Q${CX},${hy + 8} ${CX - W(hy)},${hy} Z`;
        s += `<path d="${body}" fill="${Lw.color}"/>`;
        if (Lw.pattern) s += `<path d="${body}" fill="url(#${id}lp)"/>`;
        if (!flare) for (let i = -5; i <= 5; i++) s += `<path d="M${CX + i * 3.4},${y0 + 5} L${CX + i * 8.8},${y0 + 150}" stroke="${shade(Lw.color, -.35)}" stroke-width="1.3" opacity=".42"/>`;
        if (Lw.pleats) for (let i = -9; i <= 9; i++) s += `<path d="M${CX + i * 3.2},${y0 + 2} L${CX + i * (W(hy) / 9.4)},${hy}" stroke="${shade(Lw.color, -.4)}" stroke-width="1.4" opacity=".5"/>`;
        (Lw.bands || []).forEach((b) => {
          const ya = hy - b.o - b.h, yb = hy - b.o;
          s += `<path d="M${CX - W(ya)},${ya} L${CX + W(ya)},${ya} L${CX + W(yb)},${yb} L${CX - W(yb)},${yb} Z" fill="${b.c}"/>`;
        });
        if (Lw.border) {
          const ya = hy - Lw.bh;
          s += `<path d="M${CX - W(ya)},${ya} L${CX + W(ya)},${ya} L${CX + W(hy)},${hy} Q${CX},${hy + 8} ${CX - W(hy)},${hy} Z" fill="${Lw.border}"/>`;
          if (Lw.zari) {
            s += `<path d="M${CX - W(hy - Lw.bh * .62)},${hy - Lw.bh * .62} L${CX + W(hy - Lw.bh * .62)},${hy - Lw.bh * .62}" stroke="${Lw.zari}" stroke-width="2.4"/>`;
            s += `<path d="M${CX - W(ya)},${ya} L${CX + W(ya)},${ya}" stroke="${Lw.zari}" stroke-width="1.6"/>`;
          }
        }
        if (Lw.dots) for (let r = 0; r < Lw.dots.rows; r++) {
          const y = hy - 54 - r * Lw.dots.gap, ww = W(y) - 10;
          for (let x = -ww + (r % 2) * 10; x <= ww; x += Lw.dots.step) s += `<circle cx="${CX + x}" cy="${y}" r="2.7" fill="${Lw.dots.c}"/>`;
        }
        if (Lw.apron) {
          const ay = hy - 62;
          s += `<path d="M${CX - 22},${y0 + 10} L${CX + 22},${y0 + 10} L${CX + W(ay) - 6},${ay} L${CX - W(ay) + 6},${ay} Z" fill="${Lw.apron.c}"/>`;
          s += `<path d="M${CX - W(ay) + 6},${ay} L${CX + W(ay) - 6},${ay}" stroke="${Lw.apron.trim}" stroke-width="5"/>`;
          s += `<rect x="${CX - 16}" y="${y0 + 60}" width="32" height="24" rx="4" fill="none" stroke="${Lw.apron.trim}" stroke-width="2" opacity=".8"/>`;
          for (let i = 0; i < 5; i++) s += `<circle cx="${CX - 24 + i * 12}" cy="${y0 + 120 + (i % 2) * 14}" r="3" fill="${Lw.apron.trim}" opacity=".55"/>`;
        }
        break;
      }
      case 'kashta': {
        const hy2 = hy - 8;
        s += feet(hy + 3);
        s += `<path d="M${CX - 29},${hy - 5} h22 M${CX + 7},${hy - 5} h22" stroke="#e8c26a" stroke-width="2.4"/>`;
        const leg = (sx) => {
          const a = CX + sx * 2, b = CX + sx * 33, c2 = CX + sx * 38, d2 = CX + sx * 4;
          return `<path d="M${a},${y0} L${b},${y0} L${c2},${hy2} L${d2},${hy2} Z" fill="${Lw.color}"/>`;
        };
        s += leg(-1) + leg(1);
        // ankle borders
        s += `<path d="M${CX - 4},${hy2 - Lw.bh} L${CX - 36},${hy2 - Lw.bh} L${CX - 38},${hy2} L${CX - 4},${hy2} Z" fill="${Lw.border}"/>`;
        s += `<path d="M${CX + 4},${hy2 - Lw.bh} L${CX + 36},${hy2 - Lw.bh} L${CX + 38},${hy2} L${CX + 4},${hy2} Z" fill="${Lw.border}"/>`;
        s += `<path d="M${CX - 4},${hy2 - Lw.bh * .5} L${CX - 37},${hy2 - Lw.bh * .5} M${CX + 4},${hy2 - Lw.bh * .5} L${CX + 37},${hy2 - Lw.bh * .5}" stroke="${Lw.zari}" stroke-width="2.2"/>`;
        // pleated centre fan (the "nirya")
        s += `<path d="M${CX - 14},${y0} L${CX + 14},${y0} L${CX + 26},${y0 + 170} L${CX - 26},${y0 + 170} Z" fill="${shade(Lw.color, .12)}"/>`;
        for (let i = -4; i <= 4; i++) s += `<path d="M${CX + i * 3.3},${y0 + 4} L${CX + i * 6},${y0 + 170}" stroke="${shade(Lw.color, -.35)}" stroke-width="1.3" opacity=".5"/>`;
        s += `<path d="M${CX - 26},${y0 + 170} Q${CX},${y0 + 182} ${CX + 26},${y0 + 170}" stroke="${Lw.border}" stroke-width="5" fill="none"/>`;
        break;
      }
      case 'salwar': {
        const hy2 = hy - 6;
        s += feet(hy + 2);
        const leg = (sx) => {
          const a = CX + sx * 2, b = CX + sx * 35, c2 = CX + sx * 28, d2 = CX + sx * 5;
          return `<path d="M${a},400 L${b},400 L${c2},${hy2} L${d2},${hy2} Z" fill="${Lw.color}"/>` +
            `<path d="M${d2},${hy2 - 14} L${c2},${hy2 - 14} L${c2},${hy2} L${d2},${hy2} Z" fill="${Lw.cuff}"/>`;
        };
        s += leg(-1) + leg(1);
        for (let i = 0; i < 4; i++) {
          const yy = hy2 - 24 - i * 7;
          s += `<path d="M${CX - 32 + i},${yy} Q${CX - 17},${yy + 4} ${CX - 5},${yy}  M${CX + 5},${yy} Q${CX + 17},${yy + 4} ${CX + 32 - i},${yy}" stroke="${shade(Lw.color, -.35)}" stroke-width="1.4" fill="none" opacity=".6"/>`;
        }
        break;
      }
      case 'baggy': {
        const hy2 = hy - 10;
        s += feet(hy + 3);
        const leg = (sx) => {
          const p = (x) => CX + sx * x;
          return `<path d="M${p(0)},${y0} L${p(34)},${y0} C${p(80)},${y0 + 36} ${p(78)},${hy2 - 80} ${p(32)},${hy2 - 26} L${p(30)},${hy2} L${p(5)},${hy2} L${p(4)},${hy2 - 36} C${p(2)},${y0 + 150} ${p(2)},${y0 + 50} ${p(0)},${y0} Z" fill="${Lw.color}"/>` +
            `<path d="M${p(31)},${hy2 - 18} L${p(5)},${hy2 - 18} L${p(5)},${hy2} L${p(30)},${hy2} Z" fill="${Lw.cuff}"/>`;
        };
        s += leg(-1) + leg(1);
        if (Lw.pattern) {
          const pp = (sx) => { const p = (x) => CX + sx * x; return `<path d="M${p(0)},${y0} L${p(34)},${y0} C${p(80)},${y0 + 36} ${p(78)},${hy2 - 80} ${p(32)},${hy2 - 26} L${p(5)},${hy2 - 26} L${p(4)},${hy2 - 36} C${p(2)},${y0 + 150} ${p(2)},${y0 + 50} ${p(0)},${y0} Z" fill="url(#${id}lp)"/>`; };
          s += pp(-1) + pp(1);
        }
        s += `<path d="M${CX - 40},${y0 + 110} C${CX - 20},${y0 + 130} ${CX - 12},${y0 + 150} ${CX - 8},${y0 + 190} M${CX + 40},${y0 + 110} C${CX + 20},${y0 + 130} ${CX + 12},${y0 + 150} ${CX + 8},${y0 + 190}" stroke="${shade(Lw.color, -.3)}" stroke-width="1.5" fill="none" opacity=".5"/>`;
        break;
      }
    }
    return { defs, svg: s };
  }

  function buildWoman(w, opt) {
    opt = opt || {};
    const live = !!opt.live;
    const id = 'w' + (++UID);
    const ida = (n) => (live ? ` id="${n}"` : '');
    const skin = w.skin, skinD = shade(skin, -0.16);
    const Lw = w.lower, T = w.top, H = w.head, A = w.acc || {};
    const hc = H.hair || '#17110f';
    let defs = '';

    const low = lowerSVG(w, id);
    defs += low.defs;

    // ---- torso --------------------------------------------------------------
    let torso = `<path d="M${CX - 42},214 L${CX + 42},214 L${CX + 34},300 L${CX + 33},340 L${CX - 33},340 L${CX - 34},300 Z" fill="${skin}"/>`;
    const tunic = T.tunic || 0;
    const yb = tunic || (T.midriff ? 298 : 340);
    const wb = tunic ? 46 : (T.midriff ? 33 : 33);
    if (T.pattern) defs += pattern(id + 'tp', T.pattern, T.patC || '#fff');
    torso += `<path d="${bodice(w, yb, wb)}" fill="${T.color}"/>`;
    if (T.pattern) torso += `<path d="${bodice(w, yb, wb)}" fill="url(#${id}tp)"/>`;
    if (tunic) {   // side slits + hem trim
      torso += `<path d="M${CX - 46},${yb} L${CX + 46},${yb}" stroke="${T.hemTrim || T.trim}" stroke-width="5"/>`;
      torso += `<path d="M${CX - 44},${yb - 40} L${CX - 45},${yb}  M${CX + 44},${yb - 40} L${CX + 45},${yb}" stroke="${shade(T.color, -.3)}" stroke-width="1.6"/>`;
    }
    if (T.midriff) torso += `<path d="M${CX - 34},298 Q${CX},304 ${CX + 34},298" stroke="${T.trim}" stroke-width="4" fill="none"/>`;
    // neckline trim
    if (T.neck !== 'kimono') torso += `<path d="${neckTrimPath(T.neck)}" fill="none" stroke="${T.trim}" stroke-width="3"/>`;
    else torso += `<path d="M${CX - 17},205 L${CX + 8},262 M${CX + 17},205 L${CX - 6},258" stroke="${T.trim}" stroke-width="3.4" fill="none"/>`;
    if (T.embroid) {
      for (let i = 0; i < 9; i++) torso += `<circle cx="${CX - 24 + i * 6}" cy="${244 + (i % 2) * 2}" r="2.6" fill="${T.embroid[i % 3]}"/>`;
      for (let i = 0; i < 9; i++) torso += `<circle cx="${CX - 22 + i * 5.5}" cy="${252}" r="1.8" fill="${T.embroid[(i + 1) % 3]}"/>`;
    }
    if (T.vest) {
      const vp = (sx) => `<path d="M${CX + sx * 42},214 L${CX + sx * 21},207 Q${CX + sx * 13},262 ${CX + sx * 11},324 L${CX + sx * 34},324 Q${CX + sx * 36},270 ${CX + sx * 42},214Z" fill="${T.vest.c}"/>` +
        `<path d="M${CX + sx * 21},207 Q${CX + sx * 13},262 ${CX + sx * 11},324" stroke="${T.vest.trim}" stroke-width="2.6" fill="none"/>`;
      torso += vp(-1) + vp(1);
    }
    if (T.cardigan) {
      const cp = (sx) => `<path d="M${CX + sx * 43},214 L${CX + sx * 15},204 Q${CX + sx * 10},300 ${CX + sx * 12},370 L${CX + sx * 44},370 Q${CX + sx * 36},290 ${CX + sx * 43},214Z" fill="${T.cardigan}"/>` +
        `<path d="M${CX + sx * 15},204 Q${CX + sx * 10},300 ${CX + sx * 12},370" stroke="${shade(T.cardigan, -.3)}" stroke-width="2" fill="none"/>`;
      if (T.apron) torso += `<path d="M${CX - 16},262 L${CX + 16},262 L${CX + 24},346 L${CX - 24},346Z" fill="${T.apron}"/><path d="M${CX - 16},262 L${CX + 16},262" stroke="#d62828" stroke-width="3"/>`;
      torso += cp(-1) + cp(1);
    }
    if (T.sash) torso += `<path d="M${CX - 34},320 L${CX + 34},320 L${CX + 37},346 L${CX - 37},346 Z" fill="${T.sash}"/><path d="M${CX - 35},333 L${CX + 35},333" stroke="#ffcdd2" stroke-width="1.6" stroke-dasharray="3 4"/>`;
    if (T.obi) torso += `<path d="M${CX - 34},322 L${CX + 34},322 L${CX + 36},352 L${CX - 36},352 Z" fill="${T.obi}"/><path d="M${CX - 36},352 L${CX + 36},352" stroke="#c62828" stroke-width="3"/><path d="M${CX + 6},330 L${CX + 22},348 M${CX + 10},330 L${CX + 30},340" stroke="#c62828" stroke-width="3"/>`;

    // ---- drape (pallu / dupatta / rebozo) -----------------------------------
    let drape = '';
    const D = w.drape;
    if (D) {
      if (D.type === 'pallu') {
        drape += `<path d="M${CX + 20},206 L${CX + 46},216 L${CX - 20},342 L${CX - 47},334 Z" fill="${D.c}"/>`;
        drape += `<path d="M${CX - 47},334 L${CX - 20},342 L${CX - 14},478 L${CX - 54},468 Z" fill="${D.c}"/>`;
        drape += `<path d="M${CX + 46},216 L${CX - 20},342 M${CX - 47},334 L${CX - 54},468" stroke="${D.border}" stroke-width="4.5" fill="none"/>`;
        drape += `<path d="M${CX - 20},342 L${CX - 14},478" stroke="${D.border}" stroke-width="4" fill="none"/>`;
        drape += `<path d="M${CX + 41},216 L${CX - 24},339 M${CX - 51},336 L${CX - 58},466" stroke="${D.zari}" stroke-width="1.6" fill="none"/>`;
        drape += `<path d="M${CX - 54},468 L${CX - 14},478" stroke="${D.border}" stroke-width="7"/>`;
        for (let i = 0; i < 4; i++) drape += `<circle cx="${CX - 38 + (i % 2) * 6}" cy="${368 + i * 24}" r="3.2" fill="${D.zari}" opacity=".8"/>`;
      } else if (D.type === 'dupatta') {
        defs += pattern(id + 'dp', D.pattern, D.border);
        const band = `M${CX - 46},206 Q${CX},258 ${CX + 46},206 L${CX + 42},224 Q${CX},276 ${CX - 42},224 Z`;
        const lp = `M${CX - 46},212 Q${CX - 58},320 ${CX - 38},438 L${CX - 10},438 Q${CX - 22},320 ${CX - 18},226 Z`;
        const rp = `M${CX + 46},212 Q${CX + 56},300 ${CX + 40},410 L${CX + 12},410 Q${CX + 22},300 ${CX + 18},226 Z`;
        [band, lp, rp].forEach((p) => { drape += `<path d="${p}" fill="${D.c}"/><path d="${p}" fill="url(#${id}dp)"/>`; });
        drape += `<path d="M${CX - 38},438 L${CX - 10},438 M${CX + 40},410 L${CX + 12},410" stroke="${D.border}" stroke-width="6"/>`;
      } else if (D.type === 'rebozo') {
        const lp = (sx) => `<path d="M${CX + sx * 24},204 Q${CX + sx * 70},224 ${CX + sx * 66},318 L${CX + sx * 62},392 L${CX + sx * 20},392 Q${CX + sx * 26},300 ${CX + sx * 20},228Z" fill="${D.c}"/>` +
          `<path d="M${CX + sx * 62},392 L${CX + sx * 20},392" stroke="${D.stripes[0]}" stroke-width="5"/><path d="M${CX + sx * 63},378 L${CX + sx * 22},378" stroke="${D.stripes[1]}" stroke-width="3"/>` +
          Array.from({ length: 7 }, (_, i) => `<path d="M${CX + sx * (24 + i * 6)},392 v10" stroke="${D.stripes[0]}" stroke-width="1.6"/>`).join('');
        drape += lp(-1) + lp(1);
      }
    }

    // ---- necklaces ----------------------------------------------------------
    let neck = '';
    const NK = A.neck;
    if (NK === 'mangal') neck += `<path d="M${CX - 17},209 Q${CX},268 ${CX + 17},209" stroke="#111" stroke-width="2.6" fill="none" stroke-dasharray="1.2 3" stroke-linecap="round"/><circle cx="${CX}" cy="257" r="4.2" fill="#f2c230"/><circle cx="${CX}" cy="257" r="1.6" fill="#8f1b3f"/>`;
    if (NK === 'collar') neck += `<path d="M${CX - 17},208 Q${CX},232 ${CX + 17},208" stroke="#cfd6e0" stroke-width="6" fill="none" stroke-dasharray="1.5 4.5" stroke-linecap="round"/><path d="M${CX - 20},210 Q${CX},240 ${CX + 20},210" stroke="#aeb6c4" stroke-width="2" fill="none"/>`;
    if (NK === 'temple') neck += `<path d="M${CX - 21},209 Q${CX},256 ${CX + 21},209" stroke="#f2c230" stroke-width="3.4" fill="none"/><path d="M${CX - 18},212 Q${CX},238 ${CX + 18},212" stroke="#f2c230" stroke-width="2.4" fill="none" stroke-dasharray="2 3.4" stroke-linecap="round"/>` +
      [-12, -5, 0, 5, 12].map((x, i) => `<circle cx="${CX + x}" cy="${232 + Math.abs(x) * -0.4 + 11 - Math.abs(x) * 0.3 + (x === 0 ? 14 : 0)}" r="${x === 0 ? 4 : 2.6}" fill="${i % 2 ? '#e53935' : '#2fa35f'}"/>`).join('');
    if (NK === 'beads') neck += `<path d="M${CX - 18},209 Q${CX},246 ${CX + 18},209" stroke="${w.id === 'mexico' ? '#e91e63' : '#e0a526'}" stroke-width="4" fill="none" stroke-dasharray="2 3" stroke-linecap="round"/>` +
      `<path d="M${CX - 21},209 Q${CX},258 ${CX + 21},209" stroke="#ffc107" stroke-width="4" fill="none" stroke-dasharray="3 3" stroke-linecap="round"/><path d="M${CX - 24},208 Q${CX},268 ${CX + 24},208" stroke="#00a6a6" stroke-width="3.4" fill="none" stroke-dasharray="2 4" stroke-linecap="round"/>`;
    if (NK === 'cross') neck += `<path d="M${CX - 13},202 Q${CX},232 ${CX + 13},202" stroke="#e0b84c" stroke-width="1.6" fill="none"/><path d="M${CX},234 v13 M${CX - 4.5},239 h9" stroke="#e0b84c" stroke-width="2.4"/><path d="M${CX + 9},230 q6,2 4,10 q-3,-2 -6,-1 z" fill="#d62828"/>`;
    if (NK === 'rosary') neck += `<path d="M${CX - 16},204 Q${CX - 20},300 ${CX},330 Q${CX + 20},300 ${CX + 16},204" stroke="#8d4a2b" stroke-width="3.4" fill="none" stroke-dasharray="1.2 3.6" stroke-linecap="round"/><path d="M${CX},331 v11 M${CX - 4},336 h8" stroke="#6d4c41" stroke-width="2.6"/>`;
    if (NK === 'blue') neck += `<path d="M${CX - 17},207 Q${CX},238 ${CX + 17},207" stroke="#2a64d9" stroke-width="4.4" fill="none" stroke-dasharray="1.6 4" stroke-linecap="round"/><circle cx="${CX}" cy="228" r="6" fill="#0d3b9c"/><circle cx="${CX}" cy="228" r="4" fill="#fff"/><circle cx="${CX}" cy="228" r="2.6" fill="#59b6ff"/><circle cx="${CX}" cy="228" r="1.2" fill="#111"/>`;

    // ---- hair, head, face -----------------------------------------------------
    let hb = '', hfront = '';       // back-of-head layer / front-of-head layer
    const hairMass = `<ellipse cx="${CX}" cy="150" rx="33" ry="38" fill="${hc}"/>`;
    const bun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}"/><path d="M${x - r * .6},${y - r * .3} Q${x},${y - r * .8} ${x + r * .6},${y - r * .3}" stroke="${shade(hc, .25)}" stroke-width="2" fill="none" opacity=".6"/>`;
    const ring = (x, y, r, n, c1, c2) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return `<circle cx="${x + Math.cos(a) * r}" cy="${y + Math.sin(a) * r}" r="3.5" fill="${i % 2 ? c2 : c1}" stroke="rgba(0,0,0,.12)" stroke-width=".6"/>`; }).join('');
    const hairCap = `<path d="M${CX - 30},153 C${CX - 34},116 ${CX - 14},106 ${CX},106 C${CX + 14},106 ${CX + 34},116 ${CX + 30},153 C${CX + 27},132 ${CX + 14},124 ${CX + 3},123 C${CX - 10},124 ${CX - 24},134 ${CX - 30},153Z" fill="${hc}"/>`;

    const st = H.style;
    if (st === 'scarf') {
      const C = H.cover;
      hb += `<path d="M${CX - 39},166 C${CX - 46},96 ${CX + 46},96 ${CX + 39},166 C${CX + 44},204 ${CX + 36},222 ${CX + 22},228 L${CX - 22},228 C${CX - 36},222 ${CX - 44},204 ${CX - 39},166Z" fill="${C.c}"/>`;
      hb += `<path d="M${CX - 39},166 C${CX - 46},96 ${CX + 46},96 ${CX + 39},166" stroke="${C.trim}" stroke-width="2.6" fill="none"/>`;
      hfront += `<path d="M${CX - 31},153 C${CX - 36},112 ${CX - 14},99 ${CX},99 C${CX + 14},99 ${CX + 36},112 ${CX + 31},153 C${CX + 27},130 ${CX + 15},121 ${CX},121 C${CX - 15},121 ${CX - 27},130 ${CX - 31},153Z" fill="${C.c}"/>`;
      hfront += `<path d="M${CX - 29},150 C${CX - 26},130 ${CX - 15},123 ${CX},123 C${CX + 15},123 ${CX + 26},130 ${CX + 29},150" stroke="${C.trim}" stroke-width="3.2" fill="none"/>`;
      if (C.dots) for (let i = 0; i < 9; i++) { const a = Math.PI + (i + .5) / 9 * Math.PI; hfront += `<circle cx="${CX + Math.cos(a) * 31}" cy="${152 + Math.sin(a) * 31 * 0.95}" r="2.3" fill="${C.dots}"/>`; }
      if (C.knot) hfront += `<path d="M${CX - 24},106 l-14,-10 l-2,18z M${CX - 24},106 l10,-16 l8,10z" fill="${C.trim}"/><circle cx="${CX - 24}" cy="106" r="4.5" fill="${C.trim}"/>`;
      if (hc) hfront += `<path d="M${CX - 29},150 Q${CX - 31},142 ${CX - 28},138" stroke="${hc}" stroke-width="3" fill="none"/>`;
    } else {
      hb += hairMass;
      if (st === 'bun' || H.under === 'bun') {
        hb += bun(CX + 1, 100, 19);
        if (H.flowers) hb += ring(CX + 1, 100, 19, 9, H.flowers[0], H.flowers[1]);
      }
      if (st === 'long') {
        hb += `<path d="M${CX - 36},138 C${CX - 46},200 ${CX - 44},276 ${CX - 36},326 L${CX + 36},326 C${CX + 44},276 ${CX + 46},200 ${CX + 36},138Z" fill="${hc}"/>`;
      }
      hfront += hairCap;
      if (A.sindoor) hfront += `<path d="M${CX + 1},107 L${CX + 3},123" stroke="#e01b24" stroke-width="3.2" stroke-linecap="round"/>`;
      if (st === 'long') {
        hfront += `<path d="M${CX - 31},147 C${CX - 36},190 ${CX - 36},240 ${CX - 31},288 L${CX - 22},288 C${CX - 25},232 ${CX - 25},190 ${CX - 25},150Z" fill="${hc}"/>`;
        hfront += `<path d="M${CX + 31},147 C${CX + 36},190 ${CX + 36},240 ${CX + 31},288 L${CX + 22},288 C${CX + 25},232 ${CX + 25},190 ${CX + 25},150Z" fill="${hc}"/>`;
        hfront += `<path d="M${CX - 30},224 h8 M${CX + 22},224 h8" stroke="${H.ribbon}" stroke-width="5"/><path d="M${CX - 28},228 l-3,22 M${CX + 26},228 l3,22" stroke="${H.ribbon}" stroke-width="3"/>`;
        hfront += `<circle cx="${CX + 22}" cy="112" r="6" fill="${H.ornament}"/><circle cx="${CX + 22}" cy="112" r="2.3" fill="#f2c230"/><circle cx="${CX + 31}" cy="118" r="3.4" fill="#fff"/>`;
      }
      if (st === 'odhani') {
        const C = H.cover;
        const shape = `M${CX - 35},156 C${CX - 40},98 ${CX - 12},90 ${CX},90 C${CX + 12},90 ${CX + 40},98 ${CX + 35},156 C${CX + 33},134 ${CX + 18},122 ${CX},122 C${CX - 18},122 ${CX - 33},134 ${CX - 35},156Z`;
        hfront += `<path d="${shape}" fill="${C.c}" opacity=".88"/>`;
        hfront += `<path d="M${CX - 33},150 C${CX - 31},132 ${CX - 18},122 ${CX},122 C${CX + 18},122 ${CX + 31},132 ${CX + 33},150" stroke="${C.trim}" stroke-width="3" fill="none"/>`;
        const fall = (sx) => `<path d="M${CX + sx * 35},152 C${CX + sx * 52},196 ${CX + sx * 60},246 ${CX + sx * 56},304 L${CX + sx * 36},304 C${CX + sx * 42},240 ${CX + sx * 36},196 ${CX + sx * 28},164Z" fill="${C.c}" opacity=".82"/><path d="M${CX + sx * 56},304 L${CX + sx * 36},304" stroke="${C.trim}" stroke-width="4"/><path d="M${CX + sx * 35},152 C${CX + sx * 52},196 ${CX + sx * 60},246 ${CX + sx * 56},304" stroke="${C.trim}" stroke-width="2.4" fill="none"/>`;
        hfront += fall(-1) + fall(1);
        if (H.borla) hfront += `<path d="M${CX},123 v10" stroke="#f2c230" stroke-width="1.6"/><circle cx="${CX}" cy="126" r="5.2" fill="#f2c230"/><circle cx="${CX}" cy="126" r="2.2" fill="#e53935"/>`;
      }
      if (st === 'braid' || st === 'twoBraids') {
        const braid = (x0, dx) => {
          let b = '';
          for (let k = 0; k < 11; k++) {
            const y = 196 + k * 13.5, x = x0 + dx * (k / 10) + (k % 2 ? 1.6 : -1.6);
            b += `<ellipse cx="${x}" cy="${y}" rx="${8.4 - k * 0.25}" ry="8" fill="${hc}"/><path d="M${x - 5},${y - 1} q5,5 10,-1" stroke="${shade(hc, .3)}" stroke-width="1.3" fill="none" opacity=".7"/>`;
            if (H.flowers && st === 'braid') b += `<circle cx="${x + (k % 2 ? 3 : -3)}" cy="${y + 2}" r="3.2" fill="${H.flowers[0]}" stroke="rgba(0,0,0,.18)" stroke-width=".6"/>`;
          }
          return b;
        };
        if (st === 'braid') {
          hfront += braid(CX + 40, 5);
          const bx = CX + 45, by = 342;
          const cols = H.paranda || [];
          if (cols.length) {
            cols.forEach((c, i) => { hfront += `<path d="M${bx - 8 + i * 8},${by} v34" stroke="${c}" stroke-width="2.4"/><circle cx="${bx - 8 + i * 8}" cy="${by + 37}" r="4.3" fill="${c}"/>`; });
          } else hfront += `<path d="M${bx},${by - 4} q-3,16 0,26 q3,-10 0,-26" fill="${hc}"/>`;
          if (H.flowers) hfront += `<path d="M${CX + 30},120 q8,18 12,76" stroke="none"/>`;
        } else {
          hfront += braid(CX - 38, -4);
          hfront += braid(CX + 38, 4);
          const rb = H.ribbons;
          [-1, 1].forEach((sx) => { hfront += `<path d="M${CX + sx * 40},196 l${-8},-9 v18z M${CX + sx * 40},196 l8,-9 v18z" fill="${rb[0]}"/><path d="M${CX + sx * 43},334 l-9,6 l-1,-12z M${CX + sx * 43},334 l9,6 l1,-12z" fill="${rb[1]}"/>`; });
          if (H.flower) hfront += `<g transform="translate(${CX - 24} 112)"><circle r="8" fill="${H.flower}"/><circle r="3.2" fill="#ffd54f"/><circle cx="-6" cy="-4" r="5" fill="${H.flower}"/><circle cx="6" cy="-4" r="5" fill="${H.flower}"/></g>`;
        }
      }
    }

    // face
    let face = '';
    const ears = `<ellipse cx="${CX - 29}" cy="157" rx="5.6" ry="8" fill="${skin}"/><ellipse cx="${CX + 29}" cy="157" rx="5.6" ry="8" fill="${skin}"/>`;
    face += `<ellipse cx="${CX}" cy="152" rx="29" ry="35" fill="${skin}"/>`;
    face += `<ellipse cx="${CX - 17}" cy="167" rx="7.5" ry="4.8" fill="#ff6f81" opacity=".28"/><ellipse cx="${CX + 17}" cy="167" rx="7.5" ry="4.8" fill="#ff6f81" opacity=".28"/>`;
    const look = opt.look != null ? opt.look : 0;
    const eye = (sx) => {
      const x = CX + sx * 11.5;
      return `<g class="eye"><ellipse cx="${x}" cy="152" rx="6.4" ry="4.8" fill="#fff"/><circle cx="${x + look}" cy="152.4" r="3.6" fill="#3a2417"/><circle cx="${x + look}" cy="152.4" r="1.9" fill="#0b0705"/><circle cx="${x + look + 1.3}" cy="151" r="1" fill="#fff"/>` +
        `<path d="M${x - 7.4},152 Q${x},145.4 ${x + 7.4},152" stroke="#1a0f0a" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M${x + sx * 6.5},151.6 l${sx * 3.4},-2.2" stroke="#1a0f0a" stroke-width="1.6" stroke-linecap="round"/></g>`;
    };
    face += eye(-1) + eye(1);
    const browC = st === 'scarf' ? '#3b2a20' : (hc === '#b9bec7' ? '#7b7f88' : hc);
    face += `<path d="M${CX - 19},141 Q${CX - 11.5},136.5 ${CX - 4},140" stroke="${browC}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M${CX + 19},141 Q${CX + 11.5},136.5 ${CX + 4},140" stroke="${browC}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    face += `<path d="M${CX},156 Q${CX - 3.4},165 ${CX + 1.2},167" stroke="${skinD}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
    face += `<g${ida('w-mouth')}><path class="m-closed" d="M${CX - 8.6},175.5 Q${CX},184.5 ${CX + 8.6},175.5 Q${CX},178 ${CX - 8.6},175.5Z" fill="#c4413a"/><path class="m-closed" d="M${CX - 8.6},175.5 Q${CX},173 ${CX + 8.6},175.5" stroke="#b03a35" stroke-width="1.6" fill="none"/>` +
      `<ellipse class="m-open" cx="${CX}" cy="177.5" rx="7" ry="5.4" fill="#6d1a1a"/><ellipse class="m-open" cx="${CX}" cy="180" rx="4" ry="2.2" fill="#e8736f"/></g>`;
    // bindi
    const bi = A.bindi;
    if (bi === 'dot') face += `<circle cx="${CX}" cy="132.5" r="3" fill="#d71920"/>`;
    if (bi === 'dot-big') face += `<circle cx="${CX}" cy="132.5" r="4.2" fill="#d71920"/>`;
    if (bi === 'moon') face += `<path d="M${CX - 7},131 Q${CX},143 ${CX + 7},131 Q${CX},137 ${CX - 7},131Z" fill="#d71920"/><circle cx="${CX}" cy="128" r="1.6" fill="#111"/>`;
    // nose ornament
    if (A.nath === 'nath') face += `<circle cx="${CX + 8}" cy="167" r="8.5" fill="none" stroke="#e8c26a" stroke-width="1.8"/>` + [0, 1, 2, 3].map((i) => `<circle cx="${CX + 8 + Math.cos(.5 + i * .7) * 8.5}" cy="${167 + Math.sin(.5 + i * .7) * 8.5}" r="1.9" fill="#fff" stroke="#c9b27a" stroke-width=".5"/>`).join('');
    if (A.nath === 'stud') face += `<circle cx="${CX + 6}" cy="164.4" r="1.9" fill="#f2c230"/>`;
    if (A.nath === 'ring') face += `<circle cx="${CX + 7}" cy="167" r="6.2" fill="none" stroke="#f2c230" stroke-width="1.8"/><circle cx="${CX + 7}" cy="173" r="1.8" fill="#e53935"/>`;
    // earrings
    const ear = (sx) => {
      const x = CX + sx * 30, y = 163;
      if (A.ear === 'jhumka') return `<path d="M${x - 4.5},${y} Q${x},${y - 6} ${x + 4.5},${y} L${x + 3.5},${y + 7} L${x - 3.5},${y + 7}Z" fill="#f2c230"/><circle cx="${x}" cy="${y + 11}" r="2.8" fill="#f2c230"/><circle cx="${x}" cy="${y + 4}" r="1.1" fill="#e53935"/>`;
      if (A.ear === 'hoop') return `<circle cx="${x + sx * 1}" cy="${y + 6}" r="7" fill="none" stroke="#f2c230" stroke-width="2.2"/>`;
      if (A.ear === 'stud') return `<circle cx="${x}" cy="${y + 2}" r="2.3" fill="#f2c230"/>`;
      if (A.ear === 'pearl') return `<circle cx="${x}" cy="${y + 2}" r="2.8" fill="#fff6e8" stroke="#d8c8a8" stroke-width=".6"/>`;
      if (A.ear === 'drop') return `<path d="M${x},${y} v6" stroke="#f2c230" stroke-width="1.5"/><path d="M${x},${y + 5} q-4,5 0,9 q4,-4 0,-9z" fill="#2ec4d6"/>`;
      return '';
    };
    face += ear(-1) + ear(1);
    if (A.glasses) face += `<g fill="rgba(255,255,255,.14)" stroke="#5d4037" stroke-width="2"><circle cx="${CX - 11.5}" cy="152.4" r="9.4"/><circle cx="${CX + 11.5}" cy="152.4" r="9.4"/></g><path d="M${CX - 2},151 h4 M${CX - 21},150 l-6,-3 M${CX + 21},150 l6,-3" stroke="#5d4037" stroke-width="2"/>`;

    // neck
    const neckSVG = `<rect x="${CX - 11}" y="180" width="22" height="34" fill="${skinD}"/><path d="M${CX - 11},196 Q${CX},206 ${CX + 11},196 L${CX + 11},214 L${CX - 11},214Z" fill="${skinD}" opacity=".0"/>`;

    // arms config
    const sl = w.sleeve || { c: T.color, long: false };
    const arm = { skin, sc: sl.c, long: !!sl.long, w: sl.w || [18, 12.5], bangles: A.bangles || [], longWide: !!sl.w };

    const svgLower = `<g${ida('w-lower')}>${low.svg}</g>`;
    const svgUpper = `<g${ida('w-upper')}><g class="breathe">` +
      `<g${ida('w-hb')}>${hb}</g>` +
      torso + drape + neckSVG +
      `<g${ida('w-hf')}>${ears}${face}${hfront}</g>` +
      neck +
      `</g></g>`;
    return { defs, lower: svgLower, upper: svgUpper, arm, id };
  }
  NU.buildWoman = buildWoman;

  // ---- arms -----------------------------------------------------------------
  function ik(S, T, a, b, side) {
    let dx = T[0] - S[0], dy = T[1] - S[1], d = Math.hypot(dx, dy);
    const maxd = (a + b) * 0.985;
    let tx = T[0], ty = T[1];
    if (d > maxd) { dx *= maxd / d; dy *= maxd / d; d = maxd; tx = S[0] + dx; ty = S[1] + dy; }
    if (d < 1) d = 1;
    const base = Math.atan2(dy, dx);
    const A = Math.acos(Math.max(-1, Math.min(1, (a * a + d * d - b * b) / (2 * a * d))));
    const e1 = [S[0] + a * Math.cos(base + A), S[1] + a * Math.sin(base + A)];
    const e2 = [S[0] + a * Math.cos(base - A), S[1] + a * Math.sin(base - A)];
    // prefer the elbow that is lower and points away from the body
    const sc = (e) => e[1] + (side || 0) * (e[0] - S[0]) * 0.8;
    return { E: sc(e1) > sc(e2) ? e1 : e2, H: [tx, ty] };
  }
  NU.ik = ik;

  function armMarkup(cfg, p, live) {
    const sw = cfg.w;
    const fc = cfg.long ? cfg.sc : cfg.skin;
    const fw = cfg.long ? (cfg.longWide ? sw[1] : sw[1] + 3.5) : sw[1];
    let g = `<g${live ? ` id="${p}"` : ''}><path${live ? ` id="${p}u"` : ''} fill="none" stroke="${cfg.sc}" stroke-width="${sw[0]}" stroke-linecap="round"/>` +
      `<path${live ? ` id="${p}f"` : ''} fill="none" stroke="${fc}" stroke-width="${fw}" stroke-linecap="round"/>`;
    if (!cfg.long && cfg.bangles.length) cfg.bangles.forEach((c, i) => { g += `<path${live ? ` id="${p}b${i}"` : ''} stroke="${c}" stroke-width="3.1" stroke-linecap="round" fill="none"/>`; });
    if (cfg.long && !cfg.longWide) g += `<path${live ? ` id="${p}c"` : ''} stroke="${NU.shade(cfg.sc, -.2)}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    g += `<circle${live ? ` id="${p}h"` : ''} r="8.2" fill="${cfg.skin}"/></g>`;
    return g;
  }
  NU.armMarkup = armMarkup;

  // returns attr map for an arm given shoulder S and hand target T
  function armShape(cfg, S, T, side) {
    const { E, H } = ik(S, T, L.ARM[0], L.ARM[1], side);
    const out = { u: `M${S[0].toFixed(1)},${S[1].toFixed(1)} L${E[0].toFixed(1)},${E[1].toFixed(1)}`, f: `M${E[0].toFixed(1)},${E[1].toFixed(1)} L${H[0].toFixed(1)},${H[1].toFixed(1)}`, H, E, b: [] };
    const dx = H[0] - E[0], dy = H[1] - E[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const n = cfg.bangles.length;
    for (let i = 0; i < n; i++) {
      const t = 0.9 - i * 0.065, bx = E[0] + dx * t, by = E[1] + dy * t, hw = 7;
      out.b.push(`M${(bx + nx * hw).toFixed(1)},${(by + ny * hw).toFixed(1)} L${(bx - nx * hw).toFixed(1)},${(by - ny * hw).toFixed(1)}`);
    }
    const tcx = E[0] + dx * 0.84, tcy = E[1] + dy * 0.84;
    out.c = `M${(tcx + nx * (cfg.w[1] / 2 + 2)).toFixed(1)},${(tcy + ny * (cfg.w[1] / 2 + 2)).toFixed(1)} L${(tcx - nx * (cfg.w[1] / 2 + 2)).toFixed(1)},${(tcy - ny * (cfg.w[1] / 2 + 2)).toFixed(1)}`;
    return out;
  }
  NU.armShape = armShape;

  // a still portrait of a tradition (used on cards and the gate screen)
  NU.portrait = function (trad, view) {
    const wm = buildWoman(Object.assign({ id: trad.id }, trad.woman), { look: 0 });
    const cfg = wm.arm;
    const sn = L.SN, sf = L.SF;
    const a = armShape(cfg, sn, [sn[0] - 6, 338], -1);
    const b = armShape(cfg, sf, [sf[0] + 6, 338], 1);
    const armSvg = (o) => `<path d="${o.u}" fill="none" stroke="${cfg.sc}" stroke-width="${cfg.w[0]}" stroke-linecap="round"/><path d="${o.f}" fill="none" stroke="${cfg.long ? cfg.sc : cfg.skin}" stroke-width="${cfg.long ? (cfg.longWide ? cfg.w[1] : cfg.w[1] + 3.5) : cfg.w[1]}" stroke-linecap="round"/>` +
      (cfg.long ? '' : o.b.map((d, i) => `<path d="${d}" stroke="${cfg.bangles[i]}" stroke-width="3.1" stroke-linecap="round"/>`).join('')) + `<circle cx="${o.H[0]}" cy="${o.H[1]}" r="8.2" fill="${cfg.skin}"/>`;
    const vb = view === 'full' ? '188 78 224 530' : '206 78 188 286';
    return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${wm.defs}</defs>${wm.lower}${wm.upper}${armSvg(a)}${armSvg(b)}</svg>`;
  };

  // =============================== THE PERSON ==================================
  const SHIRTS = ['#5c6bc0', '#26a69a', '#ef6c00', '#8e24aa', '#43a047', '#d81b60', '#039be5'];
  NU.hash = function (s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

  NU.buildPerson = function (name) {
    const shirt = SHIRTS[NU.hash(name || 'x') % SHIRTS.length];
    const sk = '#e9b58c', skd = '#d29b72', hair = '#2a1a12';
    const x = PX;
    return `<g id="person">
      <circle id="aura" cx="${x}" cy="380" r="130" fill="url(#auraG)" opacity="0"/>
      <rect x="${x - 46}" y="488" width="92" height="12" rx="6" fill="#8d5a3b"/>
      <path d="M${x - 38},500 L${x - 46},580 M${x + 38},500 L${x + 46},580 M${x - 42},548 H${x + 42}" stroke="#6d4228" stroke-width="7" stroke-linecap="round"/>
      <ellipse cx="${x - 16}" cy="582" rx="17" ry="7" fill="#37474f"/><ellipse cx="${x + 16}" cy="582" rx="17" ry="7" fill="#37474f"/>
      <rect x="${x - 29}" y="522" width="22" height="58" rx="9" fill="#3b4a6b"/><rect x="${x + 7}" y="522" width="22" height="58" rx="9" fill="#3b4a6b"/>
      <rect x="${x - 34}" y="470" width="68" height="40" rx="16" fill="#3b4a6b"/>
      <g id="p-torso">
        <path d="M${x - 38},384 Q${x},366 ${x + 38},384 L${x + 32},484 L${x - 32},484 Z" fill="${shirt}"/>
        <path d="M${x - 14},370 Q${x},384 ${x + 14},370" stroke="${NU.shade(shirt, -.25)}" stroke-width="3" fill="none"/>
        <path d="M${x - 37},388 Q${x - 54},440 ${x - 24},478" stroke="${shirt}" stroke-width="17" fill="none" stroke-linecap="round"/>
        <path d="M${x + 37},388 Q${x + 54},440 ${x + 24},478" stroke="${shirt}" stroke-width="17" fill="none" stroke-linecap="round"/>
        <circle cx="${x - 22}" cy="480" r="8" fill="${sk}"/><circle cx="${x + 22}" cy="480" r="8" fill="${sk}"/>
        <g id="p-bead" opacity="0" transform="translate(${x + 26} 402)"><path d="M-3,-20 L0,-6" stroke="#8d6e63" stroke-width="2"/><circle r="9" fill="#0d3b9c"/><circle r="6.4" fill="#fff"/><circle r="4.4" fill="#59b6ff"/><circle r="2" fill="#111"/></g>
      </g>
      <g id="p-head">
        <rect x="${x - 9}" y="352" width="18" height="22" fill="${skd}"/>
        <ellipse cx="${x - 27}" cy="338" rx="4.5" ry="7" fill="${sk}"/><ellipse cx="${x + 27}" cy="338" rx="4.5" ry="7" fill="${sk}"/>
        <circle cx="${x}" cy="335" r="27" fill="${sk}"/>
        <path d="M${x - 29},334 C${x - 32},304 ${x - 8},300 ${x + 4},303 C${x + 22},300 ${x + 33},314 ${x + 28},336 C${x + 24},322 ${x + 14},316 ${x - 2},316 C${x - 14},316 ${x - 24},322 ${x - 29},334Z" fill="${hair}"/>
        <ellipse id="p-cheekL" cx="${x - 16}" cy="347" rx="6" ry="4" fill="#ff6f81" opacity="0"/><ellipse id="p-cheekR" cx="${x + 16}" cy="347" rx="6" ry="4" fill="#ff6f81" opacity="0"/>
        <g class="eye"><ellipse cx="${x - 10}" cy="335" rx="5" ry="4.6" fill="#fff"/><circle cx="${x - 10}" cy="336" r="2.8" fill="#2a1a12"/></g>
        <g class="eye"><ellipse cx="${x + 10}" cy="335" rx="5" ry="4.6" fill="#fff"/><circle cx="${x + 10}" cy="336" r="2.8" fill="#2a1a12"/></g>
        <rect id="p-lidL" x="${x - 15.5}" y="330" width="11" height="0" fill="${sk}"/><rect id="p-lidR" x="${x + 4.5}" y="330" width="11" height="0" fill="${sk}"/>
        <path id="p-browL" stroke="${hair}" stroke-width="2.6" stroke-linecap="round" fill="none"/><path id="p-browR" stroke="${hair}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
        <path d="M${x},338 q-2.5,6 1,8" stroke="${skd}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path id="p-mouth" stroke="#a8453c" stroke-width="2.8" stroke-linecap="round" fill="none"/>
        <circle id="p-teeka" cx="${x + 25}" cy="346" r="3" fill="#111" opacity="0"/>
      </g>
    </g>`;
  };

  NU.cloudSVG = function () {
    return `<g id="cloud"><g class="cwob">
      <ellipse cx="-38" cy="8" rx="30" ry="21" fill="#3b2f4f"/><ellipse cx="38" cy="8" rx="30" ry="20" fill="#3b2f4f"/>
      <ellipse cx="-14" cy="-10" rx="30" ry="24" fill="#463a5e"/><ellipse cx="22" cy="-12" rx="28" ry="23" fill="#463a5e"/>
      <ellipse cx="0" cy="10" rx="46" ry="19" fill="#2e2442"/>
      <path d="M-20,-4 Q0,-24 20,-4 Q0,10 -20,-4Z" fill="#fff"/><circle cy="-6" r="7" fill="#d62828"/><circle cy="-6" r="3" fill="#111"/>
      <path d="M-25,-18 L18,-8" stroke="#1a1325" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M-34,20 l-5,13 l8,-4 l-4,12" stroke="#ffd60a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M32,20 l5,13 l-8,-4 l4,12" stroke="#ffd60a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    </g></g>`;
  };

  // ================================ PROPS ======================================
  // Every prop is drawn around (0,0) = the grip point of the hand.
  const chilli = (rot, len) => `<g transform="rotate(${rot})"><path d="M0,0 C${len * .3},-6 ${len * .75},-5 ${len},5 C${len * .7},4 ${len * .3},5 0,4Z" fill="#d00000"/><path d="M0,0 l-4,-1.5 l1,4z" fill="#2d6a1f"/><path d="M${len * .2},-1 C${len * .5},-3 ${len * .7},-2 ${len * .9},3" stroke="#ff6b6b" stroke-width="1.2" fill="none"/></g>`;
  const dots = (n, r, cols, seed) => { let s = '', k = seed || 1; for (let i = 0; i < n; i++) { k = (k * 9301 + 49297) % 233280; const a = k / 233280 * Math.PI * 2; k = (k * 9301 + 49297) % 233280; const d = Math.sqrt(k / 233280) * r; s += `<circle cx="${(Math.cos(a) * d).toFixed(1)}" cy="${(Math.sin(a) * d).toFixed(1)}" r="1.5" fill="${cols[i % cols.length]}"/>`; } return s; };

  NU.PROPS = {
    handful: { svg: () => `${chilli(-50, 24)}${chilli(10, 26)}${chilli(70, 22)}${chilli(150, 20)}${dots(26, 17, ['#fff', '#f5f0e0', '#c9a227', '#6b4423'], 4)}` },
    chappal: { rot: true, svg: () => `<g transform="rotate(90) scale(1.05)"><path d="M-30,0 C-30,-13 -17,-15 0,-14 C20,-13 33,-8 33,0 C33,8 20,13 0,14 C-17,15 -30,13 -30,0Z" fill="#c9893f" stroke="#7a4a1a" stroke-width="2.2"/>` +
      `<path d="M-23,-8 C-10,-14 6,-12 15,-6 L15,6 C6,12 -10,14 -23,8Z" fill="#a0602a" stroke="#6b3d16" stroke-width="1.6"/><path d="M-19,-6 C-8,-10 4,-9 11,-4" stroke="#e1b074" stroke-width="1.2" fill="none" stroke-dasharray="2 2"/>` +
      `<path d="M-6,-13 C2,-3 2,3 -6,13" stroke="#6b3d16" stroke-width="4.5" fill="none"/><ellipse cx="25" cy="0" rx="4" ry="3.4" fill="#6b3d16"/><path d="M22,-1 C14,-6 8,-4 6,-2" stroke="#6b3d16" stroke-width="3" fill="none"/></g>` },
    thali: { up: true, svg: () => `<ellipse cx="0" cy="3" rx="38" ry="9" fill="#9a6b10"/><ellipse cx="0" cy="0" rx="38" ry="9" fill="#e7b730"/><ellipse cx="0" cy="-1" rx="30" ry="6.5" fill="#f5cf5a"/>` +
      `<path d="M-24,-2 q6,-14 12,0z" fill="#fff"/><path d="M-4,-2 q6,-12 12,0z" fill="#e5b100"/><path d="M-20,-2 q4,-6 9,-2" stroke="#d00000" stroke-width="3.4" fill="none"/><path d="M14,-3 q4,-6 12,-3" stroke="#d00000" stroke-width="3.4" fill="none"/><path d="M18,-2 q5,-4 11,0" stroke="#d00000" stroke-width="3" fill="none"/>` },
    aarti: { up: true, svg: () => `<ellipse cx="0" cy="3" rx="40" ry="10" fill="#9a6b10"/><ellipse cx="0" cy="0" rx="40" ry="10" fill="#e7b730"/><ellipse cx="0" cy="-1" rx="32" ry="7.4" fill="#c1121f"/><ellipse cx="-6" cy="-2" rx="10" ry="2.6" fill="#e5383b" opacity=".7"/>` +
      `<circle cx="14" cy="-3" r="6.4" fill="#f6e04a"/><path d="M8,-3 a6,6 0 0 0 12,0" fill="#d9c21d"/><circle cx="-14" cy="-3" r="3.6" fill="#fff6d0"/><path class="flame" d="M-14,-7 q-5,-9 0,-15 q5,6 0,15z" fill="#ffb703"/><path class="flame" d="M-14,-8 q-2.4,-5 0,-9 q2.4,4 0,9z" fill="#fff3b0"/>` },
    coconut: { svg: () => `<circle r="15" fill="#6b4423"/><circle cx="-4" cy="-4" r="9" fill="#8a5a31" opacity=".8"/><circle cx="-4" cy="-3" r="2.2" fill="#2b1a0e"/><circle cx="4" cy="-4" r="2.2" fill="#2b1a0e"/><circle cx="0" cy="3" r="2.2" fill="#2b1a0e"/><path d="M-12,8 l-5,5 M12,6 l5,6 M0,14 v6" stroke="#6b4423" stroke-width="2"/>` },
    egg: { svg: () => `<ellipse rx="9.5" ry="12.5" fill="#fff1dc" stroke="#e8d3b2" stroke-width="1.2"/><ellipse cx="-3" cy="-4" rx="2.4" ry="4" fill="#fff" opacity=".8"/>` },
    herbs: { svg: (o) => herbBunch(o && o.wilt, 24) },
    rue: { svg: (o) => herbBunch(o && o.wilt, 46) },
    oilbottle: { rot0: -35, svg: () => `<g><rect x="-7" y="-4" width="14" height="30" rx="5" fill="#5b8f2a" opacity=".92"/><rect x="-3.5" y="-14" width="7" height="12" fill="#5b8f2a" opacity=".92"/><rect x="-4.5" y="-18" width="9" height="5" rx="2" fill="#b57a3d"/><rect x="-4" y="6" width="8" height="12" rx="2" fill="#f4e7a6" opacity=".9"/><ellipse cx="-3" cy="8" rx="1.4" ry="6" fill="#fff" opacity=".35"/></g>` },
    censer: { rot0: 0, emit: 'smoke', svg: () => `<path d="M0,0 L36,-6" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round"/><path d="M-16,-14 Q0,18 16,-14Z" fill="#c9852a" stroke="#8a5a14" stroke-width="2"/><ellipse cx="0" cy="-14" rx="16" ry="4.6" fill="#7a3d12"/><ellipse cx="0" cy="-14.5" rx="12" ry="3" fill="#ff7b29"/><circle cx="-5" cy="-15" r="1.8" fill="#ffd166"/><circle cx="4" cy="-14" r="1.6" fill="#ffd166"/>` },
    onusa: { svg: () => `<rect x="-2.5" y="-68" width="5" height="82" rx="2" fill="#a0764a"/><g fill="#fff" stroke="#d6cfc2" stroke-width="1">` +
      `<path d="M2,-66 l16,6 l-10,8 l16,8 l-10,8 l14,8 l-14,4 l-8,-10 z"/><path d="M-2,-66 l-16,6 l10,8 l-16,8 l10,8 l-14,8 l14,4 l8,-10 z"/></g><circle cy="-70" r="3" fill="#c62828"/>` },
    conch: { rot0: -30, svg: () => `<path d="M-6,10 C-24,2 -22,-16 -4,-22 C12,-26 26,-14 22,0 C20,8 12,12 6,12Z" fill="#fff4e6" stroke="#e0a07a" stroke-width="2"/><path d="M-10,-6 C-2,-12 8,-12 14,-4 M-12,2 C-2,-4 10,-4 17,4" stroke="#e8a37d" stroke-width="2" fill="none"/><path d="M-6,10 L-14,16" stroke="#e0a07a" stroke-width="5" stroke-linecap="round"/><path d="M-20,4 q-6,-2 -8,-8" stroke="#c62828" stroke-width="2" fill="none"/>` },
    bead: { svg: () => `<circle r="12" fill="#0d3b9c"/><circle r="9" fill="#fff"/><circle r="6.4" fill="#59b6ff"/><circle r="3" fill="#0a0a0a"/><circle cx="-2" cy="-2" r="1" fill="#fff"/><path d="M0,-12 v-8" stroke="#c9a227" stroke-width="2"/>` }
  };
  function herbBunch(wilt, len) {
    wilt = wilt || 0;
    const mix = (a, b, t) => { const A = rgb(a), B = rgb(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')'; };
    const leaf = mix('#2f9e44', '#8a6a2a', wilt), leaf2 = mix('#51cf66', '#a88a43', wilt);
    let s = '';
    const droop = wilt * 22;
    for (let i = -2; i <= 2; i++) {
      const a = (-90 + i * 14 + droop * Math.sign(i || 1) * 0.5) * Math.PI / 180, x = Math.cos(a) * len, y = Math.sin(a) * len + wilt * 8;
      s += `<path d="M0,0 Q${x * .4 + i * 2},${y * .5} ${x},${y}" stroke="#3b7a26" stroke-width="2" fill="none"/>`;
      for (let k = 1; k <= 4; k++) {
        const t = k / 4, lx = x * t + i * 2 * (1 - t), ly = y * t;
        s += `<ellipse cx="${(lx - 3).toFixed(1)}" cy="${ly.toFixed(1)}" rx="${3.6 - wilt}" ry="2.3" fill="${k % 2 ? leaf : leaf2}" transform="rotate(${-30 + wilt * 60} ${lx} ${ly})"/>`;
        s += `<ellipse cx="${(lx + 3).toFixed(1)}" cy="${(ly - 2).toFixed(1)}" rx="${3.6 - wilt}" ry="2.3" fill="${k % 2 ? leaf2 : leaf}" transform="rotate(${30 - wilt * 60} ${lx} ${ly})"/>`;
      }
    }
    s += `<rect x="-4" y="-3" width="8" height="8" rx="2" fill="#e91e63" opacity=".9"/>`;
    return s;
  }

  // ================================ STATIONS ===================================
  NU.buildStation = function (kind) {
    const [sx, sy] = L.STN;
    if (kind === 'none') return '<g id="station"></g>';
    const table = `<rect x="${sx - 34}" y="${sy + 9}" width="68" height="8" rx="3" fill="#7a4a2b"/><path d="M${sx - 28},${sy + 17} L${sx - 34},586 M${sx + 28},${sy + 17} L${sx + 34},586" stroke="#6b3f23" stroke-width="6" stroke-linecap="round"/><path d="M${sx - 31},540 H${sx + 31}" stroke="#6b3f23" stroke-width="4"/>`;
    let top = '';
    if (kind === 'fire') {
      top = `<path d="M${sx - 26},${sy - 6} Q${sx},${sy + 14} ${sx + 26},${sy - 6} L${sx + 20},${sy + 9} L${sx - 20},${sy + 9}Z" fill="#b5532a"/><ellipse cx="${sx}" cy="${sy - 6}" rx="26" ry="6" fill="#6b2d12"/><ellipse id="embers" cx="${sx}" cy="${sy - 7}" rx="21" ry="4" fill="#ff7b29"/>` +
        `<path d="M${sx - 22},${sy + 2} Q${sx},${sy + 9} ${sx + 22},${sy + 2}" stroke="#d98255" stroke-width="2" fill="none"/>`;
    } else if (kind === 'bowl') {
      top = `<path d="M${sx - 34},${sy - 2} Q${sx},${sy + 22} ${sx + 34},${sy - 2}Z" fill="#f3efe6" stroke="#cfc7b6" stroke-width="2"/><ellipse cx="${sx}" cy="${sy - 2}" rx="34" ry="8" fill="#f8f4ea" stroke="#cfc7b6" stroke-width="2"/><ellipse cx="${sx}" cy="${sy - 1}" rx="28" ry="5.8" fill="#8ec8e8"/>` +
        `<g id="oilg"><ellipse id="oil1" cx="${sx}" cy="${sy - 1}" rx="0" ry="0" fill="#f2c230" opacity=".95"/><ellipse id="oil2" cx="${sx - 6}" cy="${sy - 1.6}" rx="0" ry="0" fill="#f6d35a" opacity=".95"/><ellipse id="oil3" cx="${sx + 7}" cy="${sy - 0.4}" rx="0" ry="0" fill="#f2c230" opacity=".95"/></g>`;
    } else if (kind === 'glass') {
      top = `<path d="M${sx - 17},${sy - 38} L${sx - 13},${sy + 9} L${sx + 13},${sy + 9} L${sx + 17},${sy - 38}Z" fill="rgba(190,230,255,.35)" stroke="#bfe6ff" stroke-width="2.4"/><path d="M${sx - 15.5},${sy - 18} L${sx - 12.5},${sy + 8} L${sx + 12.5},${sy + 8} L${sx + 15.5},${sy - 18}Z" fill="rgba(110,190,235,.55)"/>` +
        `<g id="eggy" opacity="0"><path d="M${sx - 10},${sy - 18} q-4,12 4,22 q6,2 8,-6 q4,-8 -2,-16z" fill="#fff8ec" opacity=".9"/><circle cx="${sx - 2}" cy="${sy - 6}" r="6.4" fill="#ffb703"/><circle cx="${sx}" cy="${sy - 8}" r="1.6" fill="#fff3b0"/></g>`;
    } else if (kind === 'plain') {
      top = `<ellipse cx="${sx}" cy="${sy + 3}" rx="30" ry="6" fill="#8a8f98"/><ellipse cx="${sx}" cy="${sy + 1}" rx="30" ry="6" fill="#aab0bb"/>` +
        `<g id="cocohalves" opacity="0"><path d="M${sx - 22},${sy - 2} a11,10 0 0 1 22,0z" fill="#6b4423"/><path d="M${sx - 20},${sy - 2} h18" stroke="#fff" stroke-width="3"/><path d="M${sx + 2},${sy - 2} a11,10 0 0 1 22,0z" fill="#6b4423"/><path d="M${sx + 4},${sy - 2} h18" stroke="#fff" stroke-width="3"/></g>`;
    }
    const flame = (sc, c1, c2, c3) => `<g class="fl" style="transform-origin:${sx}px ${sy - 8}px">` +
      `<path d="M${sx},${sy - 8} C${sx - 24 * sc},${sy - 9} ${sx - 28 * sc},${sy - 34 * sc} ${sx - 10 * sc},${sy - 52 * sc} C${sx - 8 * sc},${sy - 40 * sc} ${sx - 2 * sc},${sy - 36 * sc} ${sx},${sy - 66 * sc} C${sx + 5 * sc},${sy - 42 * sc} ${sx + 11 * sc},${sy - 38 * sc} ${sx + 13 * sc},${sy - 50 * sc} C${sx + 30 * sc},${sy - 30 * sc} ${sx + 24 * sc},${sy - 9} ${sx},${sy - 8}Z" fill="${c1}"/></g>`;
    const fire = kind === 'fire' ? `<g id="fire" opacity="0"><ellipse cx="${sx}" cy="${sy - 24}" rx="64" ry="54" fill="url(#fireGlow)"/>` +
      `<g class="f1" style="transform-origin:${sx}px ${sy - 8}px">${flame(1, '#ff6a00')}</g><g class="f2" style="transform-origin:${sx}px ${sy - 8}px">${flame(.72, '#ffb703')}</g><g class="f3" style="transform-origin:${sx}px ${sy - 8}px">${flame(.4, '#fff3b0')}</g></g>` : '';
    return `<g id="station">${table}${top}${fire}</g>`;
  };

  NU.sharedDefs = function () {
    return `<radialGradient id="auraG"><stop offset="0" stop-color="#fff2a8" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd166" stop-opacity=".35"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="fireGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".75"/><stop offset=".6" stop-color="#ff7b29" stop-opacity=".22"/><stop offset="1" stop-color="#ff7b29" stop-opacity="0"/></radialGradient>` +
      `<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></radialGradient>`;
  };
})(window.NU);
