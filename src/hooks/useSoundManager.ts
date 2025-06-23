import { useEffect, useRef } from 'react';
import { soundManager } from '@/lib/soundManager';

export function useSoundManager(enabled: boolean, volume: number) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      soundManager.setEnabled(enabled);
      soundManager.setVolume(volume);
      initializedRef.current = true;
      console.log('Sound manager initialized:', { enabled, volume });
    }
  }, []);

  useEffect(() => {
    soundManager.setEnabled(enabled);
    console.log('Sound enabled changed to:', enabled);
  }, [enabled]);

  useEffect(() => {
    soundManager.setVolume(volume);
    console.log('Sound volume changed to:', volume);
  }, [volume]);

  return {
    playSound: (soundName: string) => soundManager.play(soundName),
    testSound: () => soundManager.test(),
  };
}