/**
 * Enhanced Audio Manager for handling MP3 sound effects with proper timing
 * Provides a centralized system for loading and playing audio files without overlapping
 */

export type SoundType = 'move' | 'correct' | 'wrong' | 'win' | 'surprise' | 'defense' | 'test';

class AudioManager {
  private audioCache: Map<SoundType, HTMLAudioElement[]> = new Map();
  private isInitialized = false;
  private volume = 0.5;
  private enabled = true;
  private currentlyPlaying: Set<SoundType> = new Set();
  private soundQueue: Array<{ type: SoundType; delay: number }> = [];
  private isProcessingQueue = false;

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

  // Sound priorities (higher number = higher priority)
  private soundPriorities: Record<SoundType, number> = {
    win: 10,
    correct: 8,
    wrong: 8,
    surprise: 6,
    defense: 5,
    move: 3,
    test: 1,
  };

  // Sound durations in milliseconds (estimated)
  private soundDurations: Record<SoundType, number> = {
    move: 300,
    correct: 800,
    wrong: 1000,
    win: 2000,
    surprise: 600,
    defense: 500,
    test: 400,
  };

  constructor() {
    this.preloadSounds();
  }

  /**
   * Preload all sound files into memory with multiple instances for overlapping
   */
  private async preloadSounds() {
    console.log('[AUDIO] Preloading sound files...');
    
    for (const [soundType, filePath] of Object.entries(this.soundFiles)) {
      try {
        // Create multiple instances of each sound for potential overlapping
        const audioInstances: HTMLAudioElement[] = [];
        
        for (let i = 0; i < 3; i++) {
          const audio = new Audio(filePath);
          audio.preload = 'auto';
          audio.volume = this.volume;
          
          // Handle loading events
          audio.addEventListener('canplaythrough', () => {
            if (i === 0) console.log(`[AUDIO] Loaded: ${soundType}`);
          });
          
          audio.addEventListener('error', (e) => {
            if (i === 0) {
              console.warn(`[AUDIO] Failed to load ${soundType}:`, e);
              this.createFallbackAudio(soundType as SoundType);
            }
          });
          
          audioInstances.push(audio);
        }
        
        this.audioCache.set(soundType as SoundType, audioInstances);
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
    
    const dummyAudio = new Audio();
    dummyAudio.volume = this.volume;
    
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
    
    this.audioCache.set(soundType, [dummyAudio]);
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
   * Get available audio instance for a sound type
   */
  private getAvailableAudioInstance(soundType: SoundType): HTMLAudioElement | null {
    const instances = this.audioCache.get(soundType);
    if (!instances) return null;

    // Find an instance that's not currently playing
    for (const audio of instances) {
      if (audio.paused || audio.ended) {
        return audio;
      }
    }

    // If all instances are playing, return the first one (will be reset)
    return instances[0];
  }

  /**
   * Process the sound queue to prevent overlapping
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.soundQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.soundQueue.length > 0) {
      const { type, delay } = this.soundQueue.shift()!;
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      await this.playImmediately(type);
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Play a sound immediately without queueing
   */
  private async playImmediately(soundType: SoundType): Promise<void> {
    if (!this.enabled || this.volume === 0) {
      console.log(`[AUDIO] Sound disabled or muted, skipping ${soundType}`);
      return;
    }

    console.log(`[AUDIO] Playing ${soundType} immediately at volume ${this.volume}`);

    const audio = this.getAvailableAudioInstance(soundType);
    if (!audio) {
      console.warn(`[AUDIO] No audio instance available for: ${soundType}`);
      return;
    }

    try {
      // Stop current playback if any
      if (!audio.paused) {
        audio.pause();
      }
      
      // Reset audio to beginning
      audio.currentTime = 0;
      audio.volume = this.volume;
      
      // Mark as currently playing
      this.currentlyPlaying.add(soundType);
      
      // Set up cleanup when sound ends
      const cleanup = () => {
        this.currentlyPlaying.delete(soundType);
        audio.removeEventListener('ended', cleanup);
        audio.removeEventListener('pause', cleanup);
      };
      
      audio.addEventListener('ended', cleanup);
      audio.addEventListener('pause', cleanup);
      
      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log(`[AUDIO] Successfully played ${soundType}`);
      }
      
      // Auto cleanup after expected duration
      setTimeout(cleanup, this.soundDurations[soundType] + 100);
      
    } catch (error) {
      console.warn(`[AUDIO] Failed to play ${soundType}:`, error);
      this.currentlyPlaying.delete(soundType);
      
      // Try fallback if MP3 fails
      if (error.name === 'NotSupportedError' || error.name === 'NotAllowedError') {
        console.log(`[AUDIO] Attempting fallback for ${soundType}`);
        this.playFallbackSound(soundType);
      }
    }
  }

  /**
   * Play a sound effect with smart timing
   */
  public async playSound(soundType: SoundType, delay: number = 0): Promise<void> {
    if (!this.enabled || this.volume === 0) {
      console.log(`[AUDIO] Sound disabled or muted, skipping ${soundType}`);
      return;
    }

    // Check if a higher priority sound is currently playing
    const currentPriority = this.soundPriorities[soundType];
    let shouldInterrupt = true;
    
    for (const playingType of this.currentlyPlaying) {
      if (this.soundPriorities[playingType] > currentPriority) {
        shouldInterrupt = false;
        break;
      }
    }

    if (shouldInterrupt) {
      // Stop lower priority sounds
      for (const playingType of this.currentlyPlaying) {
        if (this.soundPriorities[playingType] < currentPriority) {
          const instances = this.audioCache.get(playingType);
          if (instances) {
            instances.forEach(audio => {
              if (!audio.paused) {
                audio.pause();
              }
            });
          }
          this.currentlyPlaying.delete(playingType);
        }
      }
      
      // Play immediately or with delay
      if (delay > 0) {
        setTimeout(() => this.playImmediately(soundType), delay);
      } else {
        await this.playImmediately(soundType);
      }
    } else {
      // Queue the sound for later
      console.log(`[AUDIO] Queueing ${soundType} due to higher priority sound playing`);
      this.soundQueue.push({ type: soundType, delay });
      this.processQueue();
    }
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAllSounds(): void {
    console.log('[AUDIO] Stopping all sounds');
    
    for (const instances of this.audioCache.values()) {
      instances.forEach(audio => {
        if (!audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
    
    this.currentlyPlaying.clear();
    this.soundQueue.length = 0;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log(`[AUDIO] Volume set to ${this.volume}`);
    
    // Update volume for all cached audio elements
    for (const instances of this.audioCache.values()) {
      instances.forEach(audio => {
        audio.volume = this.volume;
      });
    }
  }

  /**
   * Enable or disable sound
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[AUDIO] Sound ${enabled ? 'enabled' : 'disabled'}`);
    
    if (!enabled) {
      this.stopAllSounds();
    }
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

  /**
   * Check if any sounds are currently playing
   */
  public isPlaying(): boolean {
    return this.currentlyPlaying.size > 0;
  }

  /**
   * Get currently playing sounds
   */
  public getCurrentlyPlaying(): SoundType[] {
    return Array.from(this.currentlyPlaying);
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Enhanced convenience function for playing sounds with perfect timing
export const playSound = async (soundType: SoundType, enabled: boolean = true, volume: number = 0.5, delay: number = 0) => {
  if (!enabled) return;
  
  audioManager.setVolume(volume);
  audioManager.setEnabled(enabled);
  
  if (!audioManager.isReady()) {
    await audioManager.initialize();
  }
  
  await audioManager.playSound(soundType, delay);
};

// Enhanced convenience function for playing sounds in sequence
export const playSoundSequence = async (sounds: Array<{ type: SoundType; delay: number }>, enabled: boolean = true, volume: number = 0.5) => {
  if (!enabled) return;
  
  audioManager.setVolume(volume);
  audioManager.setEnabled(enabled);
  
  if (!audioManager.isReady()) {
    await audioManager.initialize();
  }
  
  for (const { type, delay } of sounds) {
    await audioManager.playSound(type, delay);
  }
};