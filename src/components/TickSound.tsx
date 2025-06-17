
import { useEffect, useRef } from "react";

// Very soft tick using Web Audio API, customizable for future tweaking
function playTick(volume: number) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = 940;
  const gain = ctx.createGain();
  gain.gain.value = 0.04 * volume;
  o.connect(gain);
  gain.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.07);
  setTimeout(() => ctx.close(), 120); // cleanup
}

type TickSoundProps = {
  tick: number;
  enabled?: boolean;
  volume?: number;
};

const TickSound = ({ tick, enabled = true, volume = 0.5 }: TickSoundProps) => {
  const first = useRef(true);
  useEffect(() => {
    // Don't play tick sound on first mount (initial render)
    if (first.current) {
      first.current = false;
      return;
    }
    
    if (!enabled || volume === 0) return;
    
    playTick(volume);
  }, [tick, enabled, volume]);
  return null;
};

export default TickSound;
