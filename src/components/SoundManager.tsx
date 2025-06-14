
import { useEffect } from "react";

// Plays a simple beep or win/wrong with Web Audio API
const sounds: Record<string, (audio: AudioContext) => void> = {
  move: (ctx) => {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = 832;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.13);
  },
  wrong: (ctx) => {
    const o = ctx.createOscillator();
    o.type = "sawtooth";
    o.frequency.value = 160;
    const g = ctx.createGain();
    g.gain.value = 0.11;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.24);
  },
  // HAPPIER/JINGLY "WIN" SOUND
  win: (ctx) => {
    // Simulate a short jingle: high - up - up - up
    const notes = [
      { freq: 523.25, time: 0 },      // C5
      { freq: 659.25, time: 0.09 },   // E5
      { freq: 783.99, time: 0.18 },   // G5
      { freq: 1046.5, time: 0.24 },   // C6, higher
    ];
    notes.forEach(({ freq, time }, i) => {
      const o = ctx.createOscillator();
      o.type = i === notes.length - 1 ? "triangle" : "square";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = i === notes.length - 1 ? 0.13 : 0.1;
      o.connect(g);
      g.connect(ctx.destination);
      o.start(ctx.currentTime + time);
      o.stop(ctx.currentTime + time + 0.09);
    });
  }
};

const SoundManager = ({ trigger }: { trigger: "move" | "wrong" | "win" | null }) => {
  useEffect(() => {
    if (!trigger) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    sounds[trigger]?.(ctx);
    // Clean up after
    setTimeout(() => ctx.close(), 550);
  }, [trigger]);
  return null;
};

export default SoundManager;
