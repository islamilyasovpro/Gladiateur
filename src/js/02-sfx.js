/* ---------- sons générés (Web Audio), aucun fichier ---------- */
const SFX = (() => {
  let ctx = null, master = null, on = true, nbuf = null;
  try { on = localStorage.getItem('ludus-sfx') !== 'off'; } catch (e) {}
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      nbuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { ctx = null; }
  }
  const ok = () => on && ctx && master;
  function noise(dur, type, f0, f1, q, gain, delay) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0), s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = nbuf; s.loop = true; fl.type = type; fl.Q.value = q || 1;
    fl.frequency.setValueAtTime(f0, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.02, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
  }
  function tone(f0, dur, type, gain, delay, f1) {
    if (!ok()) return;
    const t = ctx.currentTime + (delay || 0), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  const arp = (notes, type, gain, step) => notes.forEach((n, i) => tone(n, 0.22, type, gain, i * (step || 0.11)));
  return {
    init, get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('ludus-sfx', on ? 'on' : 'off'); } catch (e) {} if (on) init(); return on; },
    click() { tone(520, 0.05, 'triangle', 0.08); },
    hit() { noise(0.14, 'bandpass', 1100, 400, 0.9, 0.5); tone(120, 0.16, 'sine', 0.5, 0, 48); },
    crit() { noise(0.2, 'bandpass', 1600, 300, 0.8, 0.7); tone(100, 0.28, 'sine', 0.7, 0, 38); tone(1900, 0.22, 'triangle', 0.14, 0.02); },
    miss() { noise(0.22, 'highpass', 2600, 500, 0.7, 0.18); },
    block() { tone(1250, 0.16, 'triangle', 0.18); tone(1870, 0.12, 'triangle', 0.1, 0.01); noise(0.06, 'highpass', 3000, 0, 1, 0.1); },
    crowd(l) { const g = [0.12, 0.2, 0.3, 0.42][Math.max(0, Math.min(3, l))]; noise(1.3, 'lowpass', 500, 900, 0.6, g); noise(1.1, 'bandpass', 1400, 900, 0.7, g * 0.4, 0.1); },
    drum() { tone(70, 0.5, 'sine', 0.8, 0, 38); tone(70, 0.5, 'sine', 0.6, 0.45, 38); },
    coin() { tone(988, 0.09, 'square', 0.07); tone(1319, 0.16, 'square', 0.07, 0.08); },
    win() { arp([392, 494, 587, 784], 'sawtooth', 0.09, 0.12); },
    lose() { tone(300, 0.7, 'sawtooth', 0.12, 0, 120); },
    level() { arp([523, 659, 784, 1047], 'triangle', 0.16, 0.09); },
    quest() { arp([659, 880], 'triangle', 0.14, 0.1); },
    event() { tone(330, 0.12, 'triangle', 0.12); tone(494, 0.2, 'triangle', 0.12, 0.1); },
    loot(r) { arp([523, 659, 784, 1047, 1319].slice(0, 2 + (r || 0)), 'triangle', 0.15, 0.08); if (r >= 2) tone(2093, 0.4, 'sine', 0.08, 0.3); },
    bad() { tone(220, 0.35, 'sawtooth', 0.1, 0, 110); },
    slash() { noise(0.25, 'highpass', 3200, 600, 0.6, 0.35); }
  };
})();

