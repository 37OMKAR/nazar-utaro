/* ------------------------------------------------------------------
   scenes.js – the painted backdrops (480 x 640), one per tradition.
   The floor starts at y = 548.
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';
  const FY = 548;

  function base(s) {
    return `<defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.wall ? s.wall[0] : '#fff'}"/><stop offset="1" stop-color="${s.wall ? s.wall[1] : '#eee'}"/></linearGradient></defs>`;
  }
  function floor(s, extra) {
    let f = `<rect y="${FY}" width="480" height="92" fill="${s.floor}"/><rect y="${FY}" width="480" height="7" fill="rgba(0,0,0,.28)"/><rect y="${FY + 7}" width="480" height="3" fill="rgba(255,255,255,.12)"/>`;
    f += `<path d="M0,574 H480 M0,600 H480 M0,626 H480" stroke="rgba(0,0,0,.14)" stroke-width="2"/>`;
    for (let r = 0; r < 3; r++) for (let x = (r % 2) * 40; x < 480; x += 80) f += `<path d="M${x},${[560, 587, 613][r]} v13" stroke="rgba(0,0,0,.1)" stroke-width="2"/>`;
    return f + (extra || '');
  }
  const diya = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-14,0 Q0,16 14,0 Q0,5 -14,0Z" fill="#b5532a"/><ellipse rx="14" ry="4" fill="#d98255"/><path class="flame" d="M0,-3 q-6,-11 0,-19 q6,8 0,19z" fill="#ffb703"/><path class="flame" d="M0,-4 q-2.6,-6 0,-11 q2.6,5 0,11z" fill="#fff3b0"/></g>`;
  const rangoli = (cx, cy, rx, ry, cols) => {
    let r = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="rgba(255,255,255,.2)"/>`;
    for (let i = 0; i < 12; i++) r += `<ellipse cx="${cx}" cy="${cy}" rx="${rx * .5}" ry="${ry * .22}" fill="${cols[i % cols.length]}" opacity=".85" transform="rotate(${i * 30} ${cx} ${cy})"/>`;
    return r + `<ellipse cx="${cx}" cy="${cy}" rx="${rx * .16}" ry="${ry * .16}" fill="#fff"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * .07}" ry="${ry * .07}" fill="${cols[0]}"/>`;
  };
  const garland = (y, amp, c1, c2) => {
    let g = `<path d="M0,${y} Q120,${y + amp * 2} 240,${y} T480,${y}" stroke="#2d6a1f" stroke-width="3" fill="none"/>`;
    for (let x = 6; x < 480; x += 17) {
      const u = (x % 240) / 240, yy = y + amp * 1.6 * Math.sin(Math.PI * u) * (x < 240 ? 1 : 1) * (x < 240 ? 1 : 1);
      g += `<circle cx="${x}" cy="${yy.toFixed(1)}" r="8" fill="${Math.floor(x / 17) % 2 ? c1 : c2}"/><circle cx="${x}" cy="${yy.toFixed(1)}" r="3.2" fill="rgba(255,255,255,.35)"/>`;
    }
    for (let x = 40; x < 480; x += 100) {
      const u = (x % 240) / 240, yy = y + amp * 1.6 * Math.sin(Math.PI * u);
      for (let k = 1; k < 5; k++) g += `<circle cx="${x}" cy="${(yy + 8 + k * 9).toFixed(1)}" r="5.4" fill="${k % 2 ? c1 : c2}"/>`;
    }
    return g;
  };
  const frond = (x, y, sc, flip) => `<g transform="translate(${x} ${y}) scale(${flip * sc} ${sc})"><path d="M0,0 C20,-90 70,-150 120,-170 C100,-100 60,-40 0,0Z" fill="#2e8b57"/><path d="M0,0 C30,-70 80,-130 120,-170" stroke="#1b5e3a" stroke-width="3" fill="none"/><path d="M0,0 C-30,-80 -70,-130 -110,-150 C-90,-80 -40,-30 0,0Z" fill="#3aa56a"/><path d="M0,0 C-30,-70 -70,-120 -110,-150" stroke="#1b5e3a" stroke-width="3" fill="none"/></g>`;

  const decos = {
    toran: (s) => garland(30, 14, '#ff9f1c', '#ffd23f') + diya(46, 572) + diya(434, 572),
    fronds: (s) => `<path d="M0,0 H480 V30 H0Z" fill="${s.frame}"/><path d="M0,30 H480" stroke="#fbf6ea" stroke-width="5"/><path d="M0,40 H480" stroke="#e0a526" stroke-width="2" stroke-dasharray="6 4"/>` +
      frond(0, 548, 1, 1) + frond(480, 548, 1, -1) + diya(50, 574) + diya(430, 574) +
      `<g transform="translate(404 150)"><path d="M0,0 v50" stroke="#8d6e63" stroke-width="3"/><path d="M-14,50 Q0,34 14,50 Q0,76 -14,50Z" fill="#e0a526" stroke="#8a5a14" stroke-width="2"/><path class="flame" d="M0,52 q-5,-9 0,-15 q5,6 0,15z" fill="#ffb703"/></g>`,
    jharokha: (s) => garland(26, 12, '#ff9f1c', '#e8453c') + diya(46, 572) + diya(434, 572),
    tilework: (s) => `<g transform="translate(398 58)"><path d="M0,-58 V0" stroke="#8a5a14" stroke-width="2.4"/><path d="M-22,0 Q0,-12 22,0 L14,34 Q0,46 -14,34Z" fill="#c62828" stroke="#f2c230" stroke-width="2"/><circle cx="-6" cy="12" r="4.4" fill="#2ec4d6"/><circle cx="6" cy="16" r="4.4" fill="#f2c230"/><circle cx="0" cy="26" r="3.6" fill="#59b66a"/><circle cx="0" cy="4" r="3" fill="#fff"/></g>`
  };

  function arch(s) {
    let g = base(s) + `<rect width="480" height="${FY}" fill="url(#wallG)"/>`;
    if (s.dots) {
      g += `<defs><pattern id="bandh" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="3" fill="rgba(255,255,255,.55)"/><circle cx="0" cy="0" r="2" fill="rgba(255,255,255,.4)"/><circle cx="22" cy="22" r="2" fill="rgba(255,255,255,.4)"/></pattern></defs><rect width="480" height="${FY}" fill="url(#bandh)"/>`;
    }
    const inner = s.deco === 'jharokha'
      ? '<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7e5f"/><stop offset=".6" stop-color="#feb47b"/><stop offset="1" stop-color="#ffe29a"/></linearGradient></defs>'
      : '';
    const archPath = `M34,${FY} V240 Q34,92 240,88 Q446,92 446,240 V${FY}Z`;
    g += inner;
    if (s.deco === 'jharokha') {
      g += `<path d="${archPath}" fill="url(#dusk)"/>`;
      g += `<circle cx="352" cy="190" r="34" fill="#fff3c4" opacity=".85"/>`;
      g += `<path d="M34,400 L78,360 L96,360 L96,336 L116,336 L116,360 L150,366 L176,392 L210,376 L240,350 L240,336 L262,336 L262,356 L300,380 L330,372 L352,336 L372,336 L372,366 L446,400 V${FY} H34Z" fill="#8a3b3b" opacity=".72"/>`;
    } else if (s.deco === 'tilework') {
      g += `<defs><pattern id="tile" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#14b8c4"/><path d="M15,2 L28,15 L15,28 L2,15Z" fill="#fff" opacity=".9"/><path d="M15,8 L22,15 L15,22 L8,15Z" fill="#1c4f8a"/><circle cx="15" cy="15" r="2.4" fill="#f2c230"/></pattern></defs><path d="${archPath}" fill="url(#tile)"/>`;
      g += `<path d="M34,${FY} V240 Q34,92 240,88 Q446,92 446,240 V${FY}" fill="none" stroke="#f2c230" stroke-width="5"/>`;
    } else {
      g += `<path d="${archPath}" fill="rgba(255,248,225,.46)"/>`;
    }
    g += `<path d="M34,${FY} V240 Q34,92 240,88 Q446,92 446,240 V${FY}" fill="none" stroke="${s.frame}" stroke-width="11"/>`;
    if (s.deco === 'jharokha') for (let i = 0; i < 17; i++) { const a = Math.PI + (i + .5) / 17 * Math.PI; g += `<circle cx="${240 + Math.cos(a) * 200}" cy="${240 + Math.sin(a) * 150}" r="7" fill="#f4a300" opacity=".95"/>`; }
    g += decos[s.deco](s);
    g += floor(s);
    if (s.rangoli) g += rangoli(236, 604, 150, 22, [s.accent, '#e91e63', '#fff', '#7cb342', '#ffeb3b']);
    if (s.alpona) {
      let a = `<ellipse cx="236" cy="604" rx="160" ry="22" fill="none" stroke="#fffaf0" stroke-width="3"/><ellipse cx="236" cy="604" rx="118" ry="15" fill="none" stroke="#fffaf0" stroke-width="2.4"/>`;
      for (let i = 0; i < 10; i++) a += `<ellipse cx="236" cy="604" rx="62" ry="8" fill="none" stroke="#fffaf0" stroke-width="2.4" transform="rotate(${i * 18} 236 604)"/>`;
      g += a + `<ellipse cx="236" cy="604" rx="10" ry="2.6" fill="#fffaf0"/>`;
    }
    if (s.rug) {
      g += `<path d="M30,628 L66,556 H410 L450,628Z" fill="#7a1f2a"/><path d="M48,622 L76,566 H400 L432,622Z" fill="none" stroke="#f2c230" stroke-width="3"/>`;
      for (let i = 0; i < 7; i++) g += `<path d="M${130 + i * 40},${560 + (i % 2) * 3} l16,16 l-16,16 l-16,-16z" fill="${i % 2 ? '#2ec4d6' : '#f2c230'}" opacity=".85" transform="translate(${-8} ${6})"/>`;
    }
    return g;
  }

  function fields(s) {
    let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient><linearGradient id="mus" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c62a"/><stop offset="1" stop-color="#f7d51d"/></linearGradient></defs>`;
    g += `<rect width="480" height="${FY}" fill="url(#sky)"/><circle cx="90" cy="110" r="38" fill="#fff7c2"/><circle cx="90" cy="110" r="56" fill="#fff7c2" opacity=".35"/>`;
    g += `<path d="M300,150 q30,-20 60,0 q-30,-6 -60,0z M380,110 q20,-14 40,0 q-20,-4 -40,0z" fill="#fff" opacity=".8"/>`;
    g += `<path d="M0,372 Q80,352 160,370 T330,364 T480,372 V${FY} H0Z" fill="#7cb342"/>`;
    g += `<rect y="392" width="480" height="${FY - 392}" fill="url(#mus)"/>`;
    for (let r = 0; r < 12; r++) {
      const y = 396 + r * r * 1.15 + r * 7;
      if (y > FY - 4) break;
      for (let x = (r * 13) % 24; x < 490; x += 10 + r * 0.9) g += `<circle cx="${x}" cy="${y.toFixed(1)}" r="${(1.4 + r * 0.32).toFixed(1)}" fill="${r % 2 ? '#f4b400' : '#fff176'}" opacity=".95"/>`;
      g += `<path d="M0,${(y + 4 + r * .8).toFixed(1)} H480" stroke="#6a9a2a" stroke-width="${(1 + r * .25).toFixed(1)}" opacity=".5"/>`;
    }
    g += `<g transform="translate(386 356)"><rect x="-26" y="-22" width="52" height="30" fill="#b0845a"/><path d="M-32,-22 L0,-48 L32,-22Z" fill="#8d5a3b"/><rect x="-6" y="-8" width="12" height="16" fill="#5d3b24"/></g>`;
    g += `<g transform="translate(60 344)"><rect x="-3" y="-6" width="6" height="26" fill="#6b4423"/><circle cx="0" cy="-20" r="22" fill="#4f8a2e"/><circle cx="-14" cy="-10" r="14" fill="#5e9c37"/><circle cx="14" cy="-10" r="14" fill="#5e9c37"/></g>`;
    g += `<path d="M0,22 H480" stroke="#6b4423" stroke-width="2"/>`;
    const cols = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ec407a'];
    for (let i = 0; i < 16; i++) { const x = 8 + i * 30, y = 22 + 9 * Math.sin(i / 15 * Math.PI); g += `<path d="M${x},${y.toFixed(1)} l14,0 l-7,18z" fill="${cols[i % 5]}"/>`; }
    g += floor(s);
    g += `<ellipse cx="236" cy="604" rx="150" ry="20" fill="rgba(255,255,255,.12)"/>`;
    return g;
  }

  function gopuram(s) {
    let g = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.sky[0]}"/><stop offset="1" stop-color="${s.sky[1]}"/></linearGradient></defs><rect width="480" height="${FY}" fill="url(#sky)"/>`;
    g += `<circle cx="360" cy="400" r="70" fill="#ffd9a0" opacity=".55"/><circle cx="360" cy="400" r="40" fill="#fff0c2" opacity=".9"/>`;
    // gopuram
    let y = FY - 20, w = 170, gp = '';
    const cols = ['#7a2430', '#8a2c39', '#6a1f2b'];
    gp += `<rect x="${240 - w / 2}" y="${y - 6}" width="${w}" height="26" fill="#5b1f2b"/>`;
    for (let t = 0; t < 8; t++) {
      const h = 40, w2 = w - 18;
      gp += `<path d="M${240 - w / 2},${y} L${240 - w2 / 2},${y - h} H${240 + w2 / 2} L${240 + w / 2},${y}Z" fill="${cols[t % 3]}"/>`;
      for (let k = 0; k < 4 - Math.floor(t / 3); k++) gp += `<rect x="${240 - w2 / 2 + 12 + k * (w2 - 30) / (3 - Math.floor(t / 3) || 1) - 5}" y="${y - h + 8}" width="9" height="20" rx="4" fill="#f2c230" opacity=".7"/>`;
      gp += `<rect x="${240 - w2 / 2 - 4}" y="${y - h - 4}" width="${w2 + 8}" height="6" fill="#f2c230" opacity=".8"/>`;
      y -= h; w = w2;
    }
    gp += `<ellipse cx="240" cy="${y - 4}" rx="${w / 2}" ry="8" fill="#6a1f2b"/><path d="M${240 - 14},${y - 8} q14,-34 28,0z" fill="#f2c230"/><path d="M240,${y - 36} v-14" stroke="#f2c230" stroke-width="3"/>`;
    g += `<g opacity=".92" transform="translate(70 0) scale(.82 .82) translate(0 70)">${gp}</g>`;
    const palm = (x, h, f) => `<g transform="translate(${x} ${FY})"><path d="M0,0 Q${6 * f},${-h / 2} ${2 * f},${-h}" stroke="#4a2c14" stroke-width="9" fill="none"/>` +
      Array.from({ length: 7 }, (_, i) => `<path d="M${2 * f},${-h} q${(i - 3) * 22},${-34 + Math.abs(i - 3) * 8} ${(i - 3) * 34},${10 + Math.abs(i - 3) * 8}" stroke="#2b5d34" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('') + '</g>';
    g += palm(26, 330, 1) + palm(456, 290, -1);
    g += floor(s);
    // kolam
    let k = `<ellipse cx="236" cy="604" rx="150" ry="21" fill="rgba(0,0,0,.12)"/>`;
    for (let r = 0; r < 3; r++) for (let c = -5 + r; c <= 5 - r; c++) k += `<circle cx="${236 + c * 24}" cy="${586 + r * 14}" r="1.9" fill="#fffaf0"/>`;
    for (let c = -4; c <= 4; c += 2) k += `<path d="M${236 + c * 24 - 24},${586} q24,-12 48,0 q-24,26 -48,0z" fill="none" stroke="#fffaf0" stroke-width="1.8" opacity=".9"/>`;
    k += `<path d="M${236 - 100},600 Q236,616 ${236 + 100},600" stroke="#fffaf0" stroke-width="2" fill="none"/>`;
    g += k;
    g += `<path d="M452,548 C446,520 430,500 408,492 C420,516 424,534 428,548Z" fill="#3aa56a"/>`;
    return g;
  }

  function tiles(s) {
    let g = base(s) + `<defs><pattern id="tl" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#f4f8ff"/><path d="M24,3 L45,24 L24,45 L3,24Z" fill="none" stroke="${s.accent}" stroke-width="2"/><path d="M24,12 L36,24 L24,36 L12,24Z" fill="#59a0ff" opacity=".55"/><circle cx="24" cy="24" r="3.6" fill="${s.accent2}"/><circle cx="0" cy="0" r="4" fill="${s.accent}" opacity=".6"/><circle cx="48" cy="48" r="4" fill="${s.accent}" opacity=".6"/></pattern></defs>`;
    g += `<rect width="480" height="${FY}" fill="url(#tl)"/><rect width="480" height="${FY}" fill="url(#wallG)" opacity=".25"/>`;
    g += `<path d="M70,${FY} V230 Q70,140 160,130 Q250,140 250,230 V${FY}" fill="#12306e" opacity=".0"/>`;
    g += `<rect y="${FY - 26}" width="480" height="26" fill="${s.accent}" opacity=".9"/><path d="M0,${FY - 26} H480" stroke="#f2c230" stroke-width="3"/>`;
    // hanging mosaic lamps
    const lamp = (x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M0,-90 V-10" stroke="#8a5a14" stroke-width="2.4"/><path d="M-26,0 Q0,-16 26,0 L16,40 Q0,56 -16,40Z" fill="#c62828" stroke="#f2c230" stroke-width="2"/><circle cx="-8" cy="14" r="5" fill="#2ec4d6"/><circle cx="8" cy="20" r="5" fill="#f2c230"/><circle cx="0" cy="32" r="4" fill="#59b66a"/><circle cx="0" cy="8" r="3.4" fill="#fff"/><circle cx="0" cy="16" r="26" fill="#ffd166" opacity=".16"/></g>`;
    g += lamp(78, 98, 1) + lamp(420, 70, .8) + lamp(240, 40, .7);
    g += floor(s);
    g += `<path d="M26,632 L70,556 H410 L456,632Z" fill="#a32636"/><path d="M46,626 L84,566 H396 L436,626Z" fill="none" stroke="#f2c230" stroke-width="3"/>`;
    for (let i = 0; i < 6; i++) g += `<path d="M${122 + i * 46},${590} l17,-16 l17,16 l-17,16z" fill="${i % 2 ? '#1d4fd8' : '#f2c230'}" opacity=".8"/>`;
    return g;
  }

  function terracotta(s) {
    let g = base(s) + `<rect width="480" height="${FY}" fill="url(#wallG)"/>`;
    let k = 7;
    for (let i = 0; i < 70; i++) { k = (k * 9301 + 49297) % 233280; const x = k / 233280 * 480; k = (k * 9301 + 49297) % 233280; const y = k / 233280 * FY; g += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${3 + (i % 5) * 3}" fill="${i % 2 ? 'rgba(255,255,255,.06)' : 'rgba(120,50,20,.07)'}"/>`; }
    // window with shutters
    g += `<rect x="326" y="120" width="116" height="170" fill="#2b2a3a"/><rect x="326" y="120" width="116" height="170" fill="url(#sk)" opacity=".0"/><path d="M326,120 H442 V290 H326Z" stroke="#e8d9c0" stroke-width="8" fill="none"/>`;
    g += `<path d="M334,290 L384,120 M384,290 L384,120" stroke="none"/><path d="M326,120 L290,128 V282 L326,290Z" fill="#2e7d32"/><path d="M442,120 L478,128 V282 L442,290Z" fill="#2e7d32"/>`;
    for (let i = 0; i < 6; i++) g += `<path d="M292,${134 + i * 24} L324,${130 + i * 24} M476,${134 + i * 24} L444,${130 + i * 24}" stroke="#1b5e20" stroke-width="3"/>`;
    g += `<rect x="318" y="288" width="132" height="22" fill="#8d5a3b"/>`;
    for (let i = 0; i < 9; i++) g += `<circle cx="${334 + i * 13}" cy="${284 + (i % 2) * 4}" r="${6 + (i % 3)}" fill="${i % 2 ? '#e53935' : '#ef5350'}"/><circle cx="${334 + i * 13}" cy="${292 + (i % 2) * 3}" r="5" fill="#2e7d32"/>`;
    g += `<path d="M0,56 Q120,100 240,56 T480,56" stroke="#3b2f2f" stroke-width="2.4" fill="none"/>`;
    for (let i = 0; i < 12; i++) { const x = 18 + i * 40, y = 56 + (i % 2 ? 0 : 0) + 22 * Math.sin((x % 240) / 240 * Math.PI) * (x < 0 ? 1 : 1); g += `<circle cx="${x}" cy="${(y).toFixed(1)}" r="6.5" fill="#ffe08a"/><circle cx="${x}" cy="${(y).toFixed(1)}" r="14" fill="#ffe08a" opacity=".2"/>`; }
    g += `<rect y="${FY - 18}" width="480" height="18" fill="rgba(90,40,20,.35)"/>`;
    g += floor(Object.assign({}, s, { floor: '#8d7b6a' }));
    for (let r = 0; r < 4; r++) for (let x = (r % 2) * 22; x < 490; x += 44) g += `<ellipse cx="${x}" cy="${558 + r * 24}" rx="20" ry="${6 + r * 2}" fill="${(x / 44 + r) % 2 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)'}" stroke="rgba(0,0,0,.18)" stroke-width="1.4"/>`;
    return g;
  }

  function papel(s) {
    let g = base(s) + `<rect width="480" height="${FY}" fill="url(#wallG)"/>`;
    g += `<rect y="${FY - 120}" width="480" height="120" fill="${s.accent2}" opacity=".85"/><path d="M0,${FY - 120} H480" stroke="#ffc107" stroke-width="5"/>`;
    for (let i = 0; i < 8; i++) g += `<path d="M${20 + i * 60},${FY - 64} l24,-24 l24,24 l-24,24z" fill="#ffc107" opacity=".5"/>`;
    const cols = ['#e91e63', '#ffc107', '#7cb342', '#00bcd4', '#ff7043', '#9c27b0'];
    [[20, 0], [58, 1]].forEach(([y0, off]) => {
      g += `<path d="M0,${y0} Q120,${y0 + 26} 240,${y0} T480,${y0}" stroke="#5d4037" stroke-width="2" fill="none"/>`;
      for (let i = 0; i < 12; i++) {
        const x = 12 + i * 40 + off * 18, u = (x % 240) / 240, y = y0 + 20 * Math.sin(u * Math.PI) + 2;
        g += `<g transform="translate(${x} ${y.toFixed(1)}) rotate(${(u - 0.5) * 14})"><rect x="-14" y="0" width="28" height="30" fill="${cols[(i + off) % 6]}"/><path d="M-14,30 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4 l4,-4 l4,4" fill="#fff" opacity="0"/><circle cx="0" cy="9" r="4" fill="rgba(255,255,255,.65)"/><circle cx="-7" cy="20" r="2.4" fill="rgba(255,255,255,.65)"/><circle cx="7" cy="20" r="2.4" fill="rgba(255,255,255,.65)"/><path d="M-14,30 l3.5,5 l3.5,-5 l3.5,5 l3.5,-5 l3.5,5 l3.5,-5 l3.5,5 l3.5,-5" fill="${cols[(i + off) % 6]}"/></g>`;
      }
    });
    g += floor(s);
    g += `<defs><pattern id="tal" width="46" height="26" patternUnits="userSpaceOnUse"><rect width="46" height="26" fill="#2b5876" opacity=".0"/><path d="M0,13 L23,0 L46,13 L23,26Z" fill="#f4f1ea" opacity=".85"/><path d="M0,13 L23,3 L46,13 L23,23Z" fill="none" stroke="#e91e63" stroke-width="1.6"/><circle cx="23" cy="13" r="3.4" fill="#ffc107"/></pattern></defs><rect y="${FY + 10}" width="480" height="82" fill="url(#tal)"/>`;
    g += `<g transform="translate(436 ${FY + 6})"><path d="M-20,0 L-16,-34 H16 L20,0Z" fill="#c9572b"/><rect x="-12" y="-90" width="24" height="60" rx="12" fill="#2e7d32"/><rect x="-36" y="-70" width="20" height="14" rx="8" transform="rotate(-24 -26 -63)" fill="#2e7d32"/><rect x="16" y="-58" width="20" height="14" rx="8" transform="rotate(24 26 -51)" fill="#2e7d32"/><circle cx="0" cy="-92" r="5" fill="#e91e63"/></g>`;
    return g;
  }

  function tropical(s) {
    let g = base(s) + `<rect width="480" height="${FY}" fill="url(#wallG)"/>`;
    g += `<circle cx="110" cy="190" r="70" fill="#fff6c8" opacity=".55"/>`;
    const leaf = (x, y, rot, sc, c) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sc})"><path d="M0,0 C30,-30 90,-40 150,-10 C100,-4 50,10 0,0Z" fill="${c}"/><path d="M0,0 C40,-14 100,-18 150,-10" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/></g>`;
    for (let i = 0; i < 6; i++) g += leaf(0, 0, 10 + i * 14, 1.1, i % 2 ? '#2e9e4f' : '#1f7a3c');
    for (let i = 0; i < 6; i++) g += `<g transform="translate(480 0) scale(-1 1)">${leaf(0, 0, 10 + i * 14, 1.1, i % 2 ? '#2e9e4f' : '#1f7a3c')}</g>`;
    const cols = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#ec407a', '#ff9800', '#ffffff'];
    for (let i = 0; i < 22; i++) { const x = 150 + i * 8, h = 70 + ((i * 37) % 60); g += `<path d="M${x},0 q${(i % 2 ? 3 : -3)},${h / 2} 0,${h}" stroke="${cols[i % 7]}" stroke-width="5.4" fill="none" stroke-linecap="round"/>`; }
    g += `<rect x="330" y="150" width="110" height="140" rx="8" fill="#bfeaff"/><path d="M330,220 H440 M385,150 V290" stroke="#fff" stroke-width="6"/><rect x="330" y="150" width="110" height="140" rx="8" fill="none" stroke="#e07a1f" stroke-width="8"/>`;
    g += `<path d="M340,282 q20,-40 50,-30 q-10,24 -50,30z" fill="#2e9e4f" opacity=".85"/>`;
    g += floor(s);
    g += `<g transform="translate(70 ${FY + 14})"><ellipse cy="40" rx="50" ry="8" fill="rgba(0,0,0,.18)"/><path d="M-30,40 L-24,0 H24 L30,40Z" fill="#c9572b"/><path d="M-4,0 C-30,-30 -50,-30 -64,-22 M4,0 C30,-36 50,-36 62,-26 M0,0 C0,-40 -6,-60 -12,-70" stroke="#2e9e4f" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
    return g;
  }

  function shoji(s) {
    let g = base(s) + `<rect width="480" height="${FY}" fill="url(#wallG)"/>`;
    for (let i = 0; i < 4; i++) {
      const x = 14 + i * 114;
      g += `<rect x="${x}" y="70" width="108" height="${FY - 70}" fill="#fffaf0" opacity=".92"/>`;
      for (let k = 0; k <= 3; k++) g += `<path d="M${x + k * 36},70 V${FY}" stroke="${s.accent2}" stroke-width="3"/>`;
      for (let k = 0; k < 7; k++) g += `<path d="M${x},${70 + k * 68} H${x + 108}" stroke="${s.accent2}" stroke-width="3"/>`;
      g += `<rect x="${x}" y="70" width="108" height="${FY - 70}" fill="none" stroke="#6d4c41" stroke-width="6"/>`;
    }
    g += `<rect y="40" width="480" height="30" fill="#6d4c41"/><rect y="${FY - 12}" width="480" height="12" fill="#6d4c41"/>`;
    const lantern = (x, y) => `<g transform="translate(${x} ${y})"><path d="M0,-40 V0" stroke="#333" stroke-width="2"/><ellipse rx="22" ry="30" cy="26" fill="#e53935"/><path d="M-20,12 Q0,6 20,12 M-22,26 Q0,22 22,26 M-20,40 Q0,34 20,40" stroke="#8e1b1b" stroke-width="2" fill="none"/><rect x="-10" y="-2" width="20" height="6" fill="#222"/><rect x="-10" y="54" width="20" height="6" fill="#222"/><ellipse rx="22" ry="30" cy="26" fill="#ffd166" opacity=".16"/></g>`;
    g += lantern(60, 70) + lantern(430, 70);
    // sakura
    g += `<path d="M480,30 Q400,20 340,60 Q300,84 270,70" stroke="#5d4037" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M400,36 Q384,60 360,70" stroke="#5d4037" stroke-width="4" fill="none"/>`;
    let k = 3;
    for (let i = 0; i < 38; i++) { k = (k * 9301 + 49297) % 233280; const a = k / 233280; k = (k * 9301 + 49297) % 233280; const b = k / 233280; g += `<circle cx="${(274 + a * 206).toFixed(0)}" cy="${(24 + b * 66 + (a * -20)).toFixed(0)}" r="${(5 + b * 4).toFixed(1)}" fill="${i % 3 ? '#ffc4d6' : '#ff9ebb'}" opacity=".95"/>`; }
    g += floor(s);
    g += `<path d="M0,${FY + 46} H480" stroke="#7a6642" stroke-width="3"/>`;
    for (let x = 40; x < 480; x += 96) g += `<path d="M${x},${FY + 10} V${FY + 92}" stroke="#7a6642" stroke-width="2.4"/>`;
    g += `<path d="M0,${FY + 8} H480" stroke="#3b3a2a" stroke-width="5"/>`;
    return g;
  }

  NU.scenes = { arch, fields, gopuram, tiles, terracotta, papel, tropical, shoji };
  NU.buildScene = (s) => `<g id="scene">${NU.scenes[s.type](s)}</g>`;
})(window.NU);
