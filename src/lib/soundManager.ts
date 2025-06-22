export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Create audio elements for different sound effects
    const soundFiles = {
      move: this.createBeepSound(440, 0.1), // Move sound
      correct: this.createBeepSound(523, 0.2), // Correct answer
      wrong: this.createBeepSound(220, 0.3), // Wrong answer
      win: this.createMelody([523, 659, 784], 0.15), // Win melody
      lose: this.createMelody([330, 277, 220], 0.2), // Lose melody
      defense: this.createBeepSound(330, 0.15), // Defense placed
      surprise: this.createMelody([659, 784, 880], 0.1), // Surprise tile
      aiMove: this.createBeepSound(370, 0.1), // AI move
      tick: this.createBeepSound(800, 0.05), // Timer tick
      gameStart: this.createMelody([440, 523, 659], 0.12), // Game start
    };

    this.sounds = soundFiles;
  }

  private createBeepSound(frequency: number, duration: number): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    const audio = new Audio();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    gainNode.connect(mediaStreamDestination);
    
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
    };
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
      audioContext.close();
    }, duration * 1000 + 100);
    
    return audio;
  }

  private createMelody(frequencies: number[], noteDuration: number): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    let currentTime = audioContext.currentTime;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      oscillator.connect(gainNode);
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + noteDuration);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + noteDuration);
      
      currentTime += noteDuration;
    });
    
    const audio = new Audio();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    gainNode.connect(mediaStreamDestination);
    
    const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
    const chunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
      mediaRecorder.stop();
      audioContext.close();
    }, frequencies.length * noteDuration * 1000 + 100);
    
    return audio;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(audio => {
      audio.volume = this.volume;
    });
  }

  play(soundName: string) {
    if (!this.enabled || !this.sounds[soundName]) return;
    
    try {
      const audio = this.sounds[soundName];
      audio.volume = this.volume;
      audio.currentTime = 0;
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (error) {
      console.log('Sound error:', error);
    }
  }

  // Simplified sound creation using Web Audio API
  private createSimpleBeep(frequency: number, duration: number): HTMLAudioElement {
    const audio = new Audio();
    
    // Create a simple data URL for the beep sound
    const sampleRate = 44100;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Generate sine wave
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const envelope = Math.exp(-i / (sampleRate * 0.1)); // Fade out
      view.setInt16(44 + i * 2, sample * envelope * 32767, true);
    }
    
    const blob = new Blob([buffer], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    
    return audio;
  }
}

// Create a singleton instance
export const soundManager = new SoundManager();