
import { useEffect, useRef } from "react";

function playTick(volume: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.value = 940;
    gainNode.gain.value = 0.04 * volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.07);
    
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 120);
  } catch (error) {
    console.warn("Could not play tick sound:", error);
  }
}

type TickSoundProps = {
  tick: number;
  enabled?: boolean;
  volume?: number;
};

const TickSound = ({ tick, enabled = true, volume = 0.5 }: TickSoundProps) => {
  const firstRender = useRef(true);
  
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    
    if (!enabled || volume === 0) return;
    
    playTick(volume);
  }, [tick, enabled, volume]);
  
  return null;
};

export default TickSound;
