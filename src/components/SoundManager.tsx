
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
  win: (ctx) => {
    const o = ctx.createOscillator();
    o.type = "square";
    o.frequency.value = 466;
    const g = ctx.createGain();
    g.gain.value = 0.09;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.frequency.linearRampToValueAtTime(932, ctx.currentTime + 0.2);
    o.stop(ctx.currentTime + 0.31);
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
