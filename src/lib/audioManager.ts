/**
 * Audio Manager for handling MP3 sound effects
 * Provides a centralized system for loading and playing audio files
 */

export type SoundType = 'move' | 'correct' | 'wrong' | 'win' | 'surprise' | 'defense' | 'test';

class AudioManager {
  private audioCache: Map<SoundType, HTMLAudioElement> = new Map();
  private isInitialized = false;
  private volume = 0.5;
  private enabled = true;

  // Sound file mappings
  private soundFiles: Record<SoundType, string> = {
    move: '/sounds/move.mp3',
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    win: '/sounds/win.mp3',
    surprise: '/sounds/surprise.mp3',
    defense: '/sounds/defense.mp3',
    test: '/sounds/test.mp3',
  };

  constructor() {
    this.preloadSounds();
  }

  /**
   * Preload all sound files into memory
   */
  private async preloadSounds() {
    console.log('[AUDIO] Preloading sound files...');
    
    for (const [soundType, filePath] of Object.entries(this.soundFiles)) {
      try {
        const audio = new Audio(filePath);
        audio.preload = 'auto';
        audio.volume = this.volume;
        
        // Handle loading events
        audio.addEventListener('canplaythrough', () => {
          console.log(`[AUDIO] Loaded: ${soundType}`);
        });
        
        audio.addEventListener('error', (e) => {
          console.warn(`[AUDIO] Failed to load ${soundType}:`, e);
          // Create fallback audio element
          this.createFallbackAudio(soundType as SoundType);
        });
        
        this.audioCache.set(soundType as SoundType, audio);
      } catch (error) {
        console.warn(`[AUDIO] Error preloading ${soundType}:`, error);
        this.createFallbackAudio(soundType as SoundType);
      }
    }
  }

  /**
   * Create fallback audio using Web Audio API for sounds that fail to load
   */
  private createFallbackAudio(soundType: SoundType) {
    console.log(`[AUDIO] Creating fallback for ${soundType}`);
    
    // Create a dummy audio element that will use Web Audio API
    const dummyAudio = new Audio();
    dummyAudio.volume = this.volume;
    
    // Override the play method to use Web Audio API
    dummyAudio.play = () => {
      return new Promise<void>((resolve, reject) => {
        try {
          this.playFallbackSound(soundType);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    };
    
    this.audioCache.set(soundType, dummyAudio);
  }

  /**
   * Fallback sound generation using Web Audio API
   */
  private playFallbackSound(soundType: SoundType) {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.4);
        
        oscillator.type = 'sine';
        
        // Different frequencies for different sound types
        switch (soundType) {
          case 'move':
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.15);
            break;
          case 'correct':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            break;
          case 'wrong':
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.4);
            break;
          case 'win':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3);
            oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45);
            break;
          case 'surprise':
            oscillator.frequency.setValueAtTime(330, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(415, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime + 0.2);
            break;
          case 'defense':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
            break;
          case 'test':
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            break;
          default:
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        
        setTimeout(() => {
          if (audioContext.state !== 'closed') {
            audioContext.close();
          }
        }, 500);
      };
      
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(playTone);
      } else {
        playTone();
      }
    } catch (error) {
      console.error('[AUDIO] Fallback sound failed:', error);
    }
  }

  /**
   * Initialize audio system (call on first user interaction)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[AUDIO] Initializing audio system...');
    
    try {
      // Test audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      await audioContext.close();
      
      this.isInitialized = true;
      console.log('[AUDIO] Audio system initialized successfully');
    } catch (error) {
      console.error('[AUDIO] Failed to initialize audio system:', error);
    }
  }

  /**
   * Play a sound effect
   */
  public async playSound(soundType: SoundType): Promise<void> {
    if (!this.enabled) {
      console.log(`[AUDIO] Sound disabled, skipping ${soundType}`);
      return;
    }

    if (this.volume === 0) {
      console.log(`[AUDIO] Volume is 0, skipping ${soundType}`);
      return;
    }

    console.log(`[AUDIO] Playing ${soundType} at volume ${this.volume}`);

    const audio = this.audioCache.get(soundType);
    if (!audio) {
      console.warn(`[AUDIO] Sound not found: ${soundType}`);
      return;
    }

    try {
      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = this.volume;
      
      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`[AUDIO] Successfully played ${soundType}`);
      }
    } catch (error) {
      console.warn(`[AUDIO] Failed to play ${soundType}:`, error);
      
      // Try fallback if MP3 fails
      if (error.name === 'NotSupportedError' || error.name === 'NotAllowedError') {
        console.log(`[AUDIO] Attempting fallback for ${soundType}`);
        this.playFallbackSound(soundType);
      }
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`[AUDIO] Volume set to ${this.volume}`);
    
    // Update volume for all cached audio elements
    for (const audio of this.audioCache.values()) {
      audio.volume = this.volume;
    }
  }

  /**
   * Enable or disable sound
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[AUDIO] Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Check if sound is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Check if audio system is initialized
   */
  public isReady(): boolean {
    return this.isInitialized;
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Convenience function for playing sounds
export const playSound = async (soundType: SoundType, enabled: boolean = true, volume: number = 0.5) => {
  if (!enabled) return;
  
  audioManager.setVolume(volume);
  audioManager.setEnabled(enabled);
  
  if (!audioManager.isReady()) {
    await audioManager.initialize();
  }
  
  await audioManager.playSound(soundType);
};