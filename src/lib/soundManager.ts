export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;
  private volume: number = 0.5;
  private initialized: boolean = false;

  constructor() {
    // Initialize sounds when first used, not in constructor
  }

  private async initializeSounds() {
    if (this.initialized) return;
    
    try {
      // Create audio elements for different sound effects using simpler approach
      const soundFiles = {
        move: this.createSimpleBeep(440, 0.1),
        correct: this.createSimpleBeep(523, 0.2),
        wrong: this.createSimpleBeep(220, 0.3),
        win: this.createSimpleBeep(659, 0.3),
        lose: this.createSimpleBeep(220, 0.4),
        defense: this.createSimpleBeep(330, 0.15),
        surprise: this.createSimpleBeep(784, 0.15),
        aiMove: this.createSimpleBeep(370, 0.1),
        tick: this.createSimpleBeep(800, 0.05),
        gameStart: this.createSimpleBeep(523, 0.2),
      };

      this.sounds = soundFiles;
      
      // Set initial volume for all sounds
      this.updateAllVolumes();
      
      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize sounds:', error);
    }
  }

  private createSimpleBeep(frequency: number, duration: number): HTMLAudioElement {
    const audio = new Audio();
    
    try {
      // Create a simple sine wave using Web Audio API
      const sampleRate = 22050; // Lower sample rate for smaller files
      const samples = Math.floor(sampleRate * duration);
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      // RIFF header
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      
      // Format chunk
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true); // PCM format
      view.setUint16(20, 1, true);  // Audio format
      view.setUint16(22, 1, true);  // Channels
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);  // Block align
      view.setUint16(34, 16, true); // Bits per sample
      
      // Data chunk
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);
      
      // Generate sine wave with envelope
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        const fadeIn = Math.min(1, t * 50); // Quick fade in
        const fadeOut = Math.max(0, 1 - (t - duration + 0.1) * 10); // Fade out at end
        const envelope = fadeIn * fadeOut;
        
        const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3 * envelope;
        const intSample = Math.round(sample * 32767);
        view.setInt16(44 + i * 2, intSample, true);
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
      audio.preload = 'auto';
      
    } catch (error) {
      console.warn('Failed to create beep sound:', error);
    }
    
    return audio;
  }

  private updateAllVolumes() {
    Object.values(this.sounds).forEach(audio => {
      try {
        audio.volume = this.volume;
      } catch (error) {
        // Ignore volume setting errors
      }
    });
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    console.log('Sound enabled:', enabled);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    console.log('Sound volume set to:', this.volume);
    
    // Update volume for all existing sounds
    this.updateAllVolumes();
  }

  async play(soundName: string) {
    if (!this.enabled) {
      console.log('Sound disabled, not playing:', soundName);
      return;
    }
    
    // Initialize sounds if not already done
    if (!this.initialized) {
      await this.initializeSounds();
    }
    
    if (!this.sounds[soundName]) {
      console.warn('Sound not found:', soundName);
      return;
    }
    
    try {
      const audio = this.sounds[soundName];
      audio.volume = this.volume;
      audio.currentTime = 0;
      
      // Play the sound
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log('Sound play failed (this is normal before user interaction):', e.message);
        });
      }
    } catch (error) {
      console.log('Sound error:', error);
    }
  }

  // Method to test if sounds are working
  test() {
    console.log('Testing sound manager...');
    console.log('Enabled:', this.enabled);
    console.log('Volume:', this.volume);
    console.log('Initialized:', this.initialized);
    this.play('tick');
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();
//ghhfghfghfghfgh