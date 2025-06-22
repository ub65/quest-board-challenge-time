import { useEffect, useRef } from 'react';
import { soundManager } from '@/lib/soundManager';

export function useSoundManager(enabled: boolean, volume: number) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      soundManager.setEnabled(enabled);
      soundManager.setVolume(volume);
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    soundManager.setEnabled(enabled);
  }, [enabled]);

  useEffect(() => {
    soundManager.setVolume(volume);
  }, [volume]);

  return {
    playSound: (soundName: string) => soundManager.play(soundName),
  };
}