/* Tiny synthesised sound set — no audio files, and silent until the
   presenter turns it on with M. */

let ctx = null, on = false;

function voice(type, notes, vol = .06){
  if (!on) return;
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  const t0 = ctx.currentTime;
  const g = ctx.createGain();
  g.connect(ctx.destination);
  g.gain.setValueAtTime(0, t0);

  const osc = ctx.createOscillator();
  osc.type = type;
  osc.connect(g);

  let t = t0;
  notes.forEach(([freq, dur]) => { osc.frequency.setValueAtTime(freq, t); t += dur; });

  g.gain.linearRampToValueAtTime(vol, t0 + .012);
  g.gain.setValueAtTime(vol, t - .05);
  g.gain.exponentialRampToValueAtTime(.0001, t + .04);
  osc.start(t0);
  osc.stop(t + .06);
}

export const Sound = {
  toggle(){ on = !on; return on; },
  isOn(){ return on; },
  enableGesture(){
    if (!ctx && (window.AudioContext || window.webkitAudioContext)){
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e){ /* ignore */ }
    }
  },
  coin(){ voice('square', [[987.77, .07], [1318.51, .18]], .05); },
  warp(){ voice('sawtooth', [[523, .05], [392, .05], [294, .05], [220, .07], [165, .1]], .045); },
  bump(){ voice('square', [[196, .05], [147, .06]], .05); }
};
