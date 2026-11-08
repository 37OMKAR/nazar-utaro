/* ------------------------------------------------------------------
   audio.js – all sound is synthesised with WebAudio (no files to load),
   plus an optional spoken voice using the browser's speech engine.
   ------------------------------------------------------------------ */
(function (NU) {
  'use strict';
  let ctx = null, master = null, noiseBuf = null, muted = false, amb = null;

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
    return ctx;
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function noise(t, dur, type, f0, f1, peak, q) {
    if (!ctx) return;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); env(g, t, Math.min(0.03, dur / 3), peak, dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random()); s.stop(t + dur + 0.1);
  }
  function tone(freq, t, dur, type, peak, detune) {
    if (!ctx) return;
    const o = ctx.createOscillator(); o.type = type || 'sine'; o.frequency.value = freq; if (detune) o.detune.value = detune;
    const g = ctx.createGain(); env(g, t, 0.01, peak, dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.1);
  }
  function bell(freq, peak, t) {
    if (!ctx) return; t = t || ctx.currentTime;
    [1, 2.76, 5.4, 8.93].forEach((m, i) => tone(freq * m, t, 2.2 / (i + 1), 'sine', (peak || 0.12) / (i * 1.6 + 1)));
  }

  const A = {
    init, resume,
    get ready() { return !!ctx; },
    get muted() { return muted; },
    setMuted(m) { muted = m; if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05); if (m) A.stopVoice(); },
    whoosh() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.5, 'bandpass', 350, 1800, 0.22, 1.2); },
    crackle(n) { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < (n || 1); i++) noise(t + Math.random() * 0.1, 0.03 + Math.random() * 0.03, 'highpass', 2500 + Math.random() * 3000, 6000, 0.13); },
    burst() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.7, 'lowpass', 900, 200, 0.55, 0.7); tone(90, t, 0.5, 'sine', 0.4); A.crackle(8); },
    pop() { if (!ctx) return; const t = ctx.currentTime; const o = ctx.createOscillator(); o.frequency.setValueAtTime(500, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.08); const g = ctx.createGain(); env(g, t, 0.005, 0.12, 0.12); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2); },
    poof() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.55, 'lowpass', 1400, 150, 0.35); A.sparkle(); },
    sparkle() { if (!ctx) return; const t = ctx.currentTime; [1318, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 0.5, 'sine', 0.05)); },
    crack() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.025, 'highpass', 3000, 7000, 0.5); noise(t + 0.05, 0.02, 'highpass', 3000, 7000, 0.35); },
    clap() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.09, 'bandpass', 1500, 900, 0.7, 0.8); },
    drop() { if (!ctx) return; const t = ctx.currentTime; const o = ctx.createOscillator(); o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(380, t + 0.12); const g = ctx.createGain(); env(g, t, 0.004, 0.2, 0.18); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3); },
    smash() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.12, 'highpass', 1200, 4000, 0.7); noise(t + 0.02, 0.35, 'lowpass', 800, 150, 0.6); tone(120, t, 0.3, 'triangle', 0.5); },
    whisper() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.9, 'bandpass', 2600, 3400, 0.05, 2); },
    conch() {
      if (!ctx) return; const t = ctx.currentTime;
      [233, 234.4, 466].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.96, t); o.frequency.linearRampToValueAtTime(f, t + 0.25);
        const lf = ctx.createBiquadFilter(); lf.type = 'lowpass'; lf.frequency.value = 900;
        const lfo = ctx.createOscillator(); lfo.frequency.value = 6; const lg = ctx.createGain(); lg.gain.value = 4; lfo.connect(lg); lg.connect(o.frequency);
        const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(i === 2 ? 0.05 : 0.14, t + 0.3); g.gain.setValueAtTime(i === 2 ? 0.05 : 0.14, t + 1.9); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
        o.connect(lf); lf.connect(g); g.connect(master); o.start(t); lfo.start(t); o.stop(t + 2.7); lfo.stop(t + 2.7);
      });
    },
    chime(music) {
      if (!ctx) return; const m = music || { root: 220, scale: [0, 2, 4, 7, 9] }; const t = ctx.currentTime;
      const notes = [0, 1, 2, 3, 4].map((i) => m.root * 2 * Math.pow(2, m.scale[i % m.scale.length] / 12 + (i >= m.scale.length ? 1 : 0)));
      notes.forEach((f, i) => bell(f, 0.1, t + i * 0.16));
    },
    // soft background pad + random bells in the tradition's scale
    ambient(music) {
      A.stopAmbient(); if (!ctx) return;
      const m = music || { root: 220, scale: [0, 2, 4, 7, 9] }, t = ctx.currentTime;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 3); g.connect(master);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(g);
      const oscs = [m.root / 2, m.root / 2 * 1.5, m.root].map((f, i) => { const o = ctx.createOscillator(); o.type = i === 2 ? 'sine' : 'triangle'; o.frequency.value = f; o.detune.value = i * 4; o.connect(lp); o.start(t); return o; });
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.18; const lg = ctx.createGain(); lg.gain.value = 180; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(t);
      const timer = setInterval(() => {
        if (!ctx || muted) return;
        const deg = m.scale[Math.floor(Math.random() * m.scale.length)];
        bell(m.root * 2 * Math.pow(2, deg / 12 + (Math.random() < 0.3 ? 1 : 0)), 0.045);
      }, 2600);
      amb = { g, oscs, lfo, timer };
    },
    stopAmbient() {
      if (!amb) return;
      clearInterval(amb.timer);
      try { amb.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4); const a = amb; setTimeout(() => { try { a.oscs.forEach((o) => o.stop()); a.lfo.stop(); } catch (e) { /* ignore */ } }, 2000); } catch (e) { /* ignore */ }
      amb = null;
    },
    // ---- voice ---------------------------------------------------------------
    voiceOn: false,
    // speaks the native line when the device has a voice for that language,
    // otherwise falls back to the English line
    speak(native, english, lang) {
      if (!A.voiceOn || muted || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const vs = window.speechSynthesis.getVoices();
        const pre = lang.split('-')[0];
        const pick = vs.filter((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(pre));
        const useNative = pick.length > 0 && native;
        const u = new SpeechSynthesisUtterance(useNative ? native : english);
        u.rate = 0.92; u.pitch = 1.12;
        if (useNative) {
          u.lang = lang;
          u.voice = pick.find((v) => /female|woman|swara|neerja|heera|kalpana|aditi|lekha|sangeeta|priya|google/i.test(v.name)) || pick[0];
        } else {
          u.lang = 'en-IN';
          const en = vs.filter((v) => /^en/i.test(v.lang));
          u.voice = en.find((v) => /female|woman|heera|veena|neerja|samantha|zira|google/i.test(v.name)) || en[0] || null;
        }
        window.speechSynthesis.speak(u);
      } catch (e) { /* ignore */ }
    },
    stopVoice() { try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
  };
  NU.audio = A;
})(window.NU);
