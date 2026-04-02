/**
 * TranceAudioEngine — Pure Web Audio API synthesis engine.
 * Generates binaural-style drones, pink noise, and isochronic pulses.
 * No audio files. No fetch calls. All generative.
 */

export class TranceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Base drone
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;

  // Pink noise
  private pinkNoiseSource: AudioBufferSourceNode | null = null;
  private pinkGain: GainNode | null = null;

  // Isochronic pulse
  private padOsc: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private isRunning = false;
  private baseFreq = 100;

  init(): void {
    if (this.ctx) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    this.setupDrone();
    this.setupPinkNoise();
    this.setupIsochronicPulse();
    this.isRunning = true;
  }

  private setupDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.value = 300;
    this.droneFilter.Q.value = 1;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.35;

    // Oscillator 1 — base frequency
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = "sine";
    this.droneOsc1.frequency.value = this.baseFreq;

    // Oscillator 2 — slightly detuned for binaural beating (~4Hz)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = "sine";
    this.droneOsc2.frequency.value = this.baseFreq + 4;

    this.droneOsc1.connect(this.droneFilter);
    this.droneOsc2.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
  }

  private setupPinkNoise(): void {
    if (!this.ctx || !this.masterGain) return;

    // Generate pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise generation using Paul Kellet's method
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    this.pinkNoiseSource = this.ctx.createBufferSource();
    this.pinkNoiseSource.buffer = buffer;
    this.pinkNoiseSource.loop = true;

    this.pinkGain = this.ctx.createGain();
    this.pinkGain.gain.value = 0.08;

    const pinkFilter = this.ctx.createBiquadFilter();
    pinkFilter.type = "lowpass";
    pinkFilter.frequency.value = 800;

    this.pinkNoiseSource.connect(pinkFilter);
    pinkFilter.connect(this.pinkGain);
    this.pinkGain.connect(this.masterGain);

    this.pinkNoiseSource.start();
  }

  private setupIsochronicPulse(): void {
    if (!this.ctx || !this.masterGain) return;

    // Soft pad oscillator
    this.padOsc = this.ctx.createOscillator();
    this.padOsc.type = "sine";
    this.padOsc.frequency.value = 200;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0;

    // LFO for amplitude modulation at theta frequency (~6Hz)
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 6;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0.12;

    // Connect LFO to pad gain for AM
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.padGain.gain);

    this.padOsc.connect(this.padGain);
    this.padGain.connect(this.masterGain);

    this.padOsc.start();
    this.lfo.start();
  }

  fadeIn(duration: number = 20): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(
      this.masterGain.gain.value,
      this.ctx.currentTime
    );
    this.masterGain.gain.linearRampToValueAtTime(
      0.7,
      this.ctx.currentTime + duration
    );
  }

  fadeOut(duration: number = 10): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(
      this.masterGain.gain.value,
      this.ctx.currentTime
    );
    this.masterGain.gain.linearRampToValueAtTime(
      0,
      this.ctx.currentTime + duration
    );
  }

  shiftPitch(targetHz: number, duration: number = 2): void {
    if (!this.ctx || !this.droneOsc1 || !this.droneOsc2) return;
    const now = this.ctx.currentTime;
    this.droneOsc1.frequency.setValueAtTime(
      this.droneOsc1.frequency.value,
      now
    );
    this.droneOsc1.frequency.linearRampToValueAtTime(targetHz, now + duration);
    this.droneOsc2.frequency.setValueAtTime(
      this.droneOsc2.frequency.value,
      now
    );
    this.droneOsc2.frequency.linearRampToValueAtTime(
      targetHz + 4,
      now + duration
    );
    this.baseFreq = targetHz;
  }

  /** Crossfade between lighter (0) and deeper (1) audio states */
  setDepth(depth: number): void {
    if (!this.ctx || !this.droneGain || !this.pinkGain || !this.lfoGain) return;
    const now = this.ctx.currentTime;
    // Deeper = more drone, more pink noise, slower LFO
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(
      0.25 + depth * 0.25,
      now + 2
    );
    this.pinkGain.gain.setValueAtTime(this.pinkGain.gain.value, now);
    this.pinkGain.gain.linearRampToValueAtTime(
      0.06 + depth * 0.08,
      now + 2
    );
    if (this.lfo) {
      this.lfo.frequency.setValueAtTime(this.lfo.frequency.value, now);
      this.lfo.frequency.linearRampToValueAtTime(6 - depth * 2, now + 2);
    }
    if (this.droneFilter) {
      this.droneFilter.frequency.setValueAtTime(
        this.droneFilter.frequency.value,
        now
      );
      this.droneFilter.frequency.linearRampToValueAtTime(
        300 - depth * 100,
        now + 2
      );
    }
  }

  /** Raise pitch and brighten for emergence */
  emerge(duration: number = 10): void {
    if (!this.ctx) return;
    this.shiftPitch(this.baseFreq + 20, duration);
    if (this.droneFilter) {
      const now = this.ctx.currentTime;
      this.droneFilter.frequency.setValueAtTime(
        this.droneFilter.frequency.value,
        now
      );
      this.droneFilter.frequency.linearRampToValueAtTime(600, now + duration);
    }
  }

  stop(): void {
    if (!this.isRunning) return;
    this.fadeOut(3);
    setTimeout(() => {
      try {
        this.droneOsc1?.stop();
        this.droneOsc2?.stop();
        this.pinkNoiseSource?.stop();
        this.padOsc?.stop();
        this.lfo?.stop();
        this.ctx?.close();
      } catch {
        // Nodes may already be stopped
      }
      this.isRunning = false;
      this.ctx = null;
    }, 3500);
  }

  resume(): void {
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  }
}
