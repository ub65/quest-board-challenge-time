
import { useEffect, useRef } from "react";

// Very soft tick using Web Audio API, customizable for future tweaking
function playTick() {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const o = ctx.createOscillator();
  o.type = "sine";
  o.frequency.value = 940;
  const gain = ctx.createGain();
  gain.gain.value = 0.04;
  o.connect(gain);
  gain.connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + 0.07);
  setTimeout(() => ctx.close(), 120); // cleanup
}

const TickSound = ({ tick }: { tick: number }) => {
  const first = useRef(true);
  useEffect(() => {
    // Don't play tick sound on first mount (initial render)
    if (first.current) {
      first.current = false;
      return;
    }
    playTick();
  }, [tick]);
  return null;
};

export default TickSound;
