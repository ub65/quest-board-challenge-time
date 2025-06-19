
import { useEffect } from "react";

const createSound = (type: string, ctx: AudioContext, volume: number) => {
  try {
    switch (type) {
      case "move": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = 832;
        gainNode.gain.value = 0.06 * volume;
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.13);
        break;
      }
      case "wrong": {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = "sawtooth";
        oscillator.frequency.value = 160;
        gainNode.gain.value = 0.11 * volume;
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.24);
        break;
      }
      case "win": {
        const notes = [
          { freq: 523.25, time: 0 },
          { freq: 659.25, time: 0.09 },
          { freq: 783.99, time: 0.18 },
          { freq: 1046.5, time: 0.24 },
        ];
        notes.forEach(({ freq, time }, i) => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.type = i === notes.length - 1 ? "triangle" : "square";
          oscillator.frequency.value = freq;
          gainNode.gain.value = (i === notes.length - 1 ? 0.13 : 0.1) * volume;
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start(ctx.currentTime + time);
          oscillator.stop(ctx.currentTime + time + 0.09);
        });
        break;
      }
    }
  } catch (error) {
    console.warn(`Could not play ${type} sound:`, error);
  }
};

type SoundManagerProps = {
  trigger: "move" | "wrong" | "win" | null;
  enabled?: boolean;
  volume?: number;
};

const SoundManager = ({ trigger, enabled = true, volume = 0.5 }: SoundManagerProps) => {
  useEffect(() => {
    if (!trigger || !enabled || volume === 0) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      createSound(trigger, ctx, volume);
      setTimeout(() => {
        ctx.close().catch(() => {});
      }, 550);
    } catch (error) {
      console.warn("Audio context not available:", error);
    }
  }, [trigger, enabled, volume]);
  
  return null;
};

export default SoundManager;
