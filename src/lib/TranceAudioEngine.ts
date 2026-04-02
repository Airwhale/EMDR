/**
 * TranceAudioEngine — Pure Web Audio API synthesis engine.
 * True binaural tones (separate L/R channels), pink noise, isochronic pulses,
 * sub-bass heartbeat, and bilateral ping tones for EMDR/ART modes.
 * No audio files. No fetch calls. All generative.
 */

export type AudioMode = "trance" | "emdr" | "art";

export class TranceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Binaural drone — true stereo separation
  private droneOscL: OscillatorNode | null = null;
  private droneOscR: OscillatorNode | null = null;
  private panL: StereoPannerNode | null = null;
  private panR: StereoPannerNode | null = null;
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

  // Sub-bass heartbeat
  private heartbeatOsc: OscillatorNode | null = null;
  private heartbeatGain: GainNode | null = null;
  private heartbeatLfo: OscillatorNode | null = null;
  private heartbeatLfoGain: GainNode | null = null;

  private isRunning = false;
  private baseFreq = 100;
  private binauralBeat = 4;
  private mode: AudioMode = "trance";

  getContext(): AudioContext | null {
    return this.ctx;
  }

  init(mode: AudioMode = "trance"): void {
    if (this.ctx) return;

    this.mode = mode;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Set mode-specific binaural frequency
    if (mode === "emdr") {
      this.baseFreq = 90;
      this.binauralBeat = 5; // Theta (calming)
    } else if (mode === "art") {
      this.baseFreq = 110;
      this.binauralBeat = 10; // Alpha (alert processing)
    }

    this.setupBinauralDrone();

    if (mode === "trance") {
      this.setupPinkNoise();
      this.setupIsochronicPulse();
      this.setupHeartbeat();
    } else {
      // EMDR/ART: lighter ambient — just pink noise at lower level
      this.setupPinkNoise();
      if (this.pinkGain) {
        this.pinkGain.gain.value = mode === "emdr" ? 0.06 : 0.04;
      }
    }

    this.isRunning = true;
  }

  /** Play a bilateral ping/tap sound panned to one side. */
  playPing(side: "left" | "right"): void {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Short sine burst — soft woodblock-like tap
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = this.mode === "art" ? 880 : 660;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.25, now + 0.005); // Fast attack
    env.gain.exponentialRampToValueAtTime(0.001, now + 0.12); // Quick decay

    const pan = this.ctx.createStereoPanner();
    pan.pan.value = side === "left" ? -0.85 : 0.85;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = this.mode === "art" ? 900 : 700;
    filter.Q.value = 2;

    osc.connect(filter);
    filter.connect(env);
    env.connect(pan);
    pan.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  private setupBinauralDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.value = this.mode === "art" ? 400 : 300;
    this.droneFilter.Q.value = 1;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = this.mode === "trance" ? 0.3 : 0.25;

    this.droneOscL = this.ctx.createOscillator();
    this.droneOscL.type = "sine";
    this.droneOscL.frequency.value = this.baseFreq;
    this.panL = this.ctx.createStereoPanner();
    this.panL.pan.value = -1;

    this.droneOscR = this.ctx.createOscillator();
    this.droneOscR.type = "sine";
    this.droneOscR.frequency.value = this.baseFreq + this.binauralBeat;
    this.panR = this.ctx.createStereoPanner();
    this.panR.pan.value = 1;

    this.droneOscL.connect(this.panL);
    this.panL.connect(this.droneFilter);
    this.droneOscR.connect(this.panR);
    this.panR.connect(this.droneFilter);
    this.droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    this.droneOscL.start();
    this.droneOscR.start();
  }

  private setupPinkNoise(): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

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

    this.padOsc = this.ctx.createOscillator();
    this.padOsc.type = "sine";
    this.padOsc.frequency.value = 200;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0;

    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 6;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0.12;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.padGain.gain);

    this.padOsc.connect(this.padGain);
    this.padGain.connect(this.masterGain);

    this.padOsc.start();
    this.lfo.start();
  }

  private setupHeartbeat(): void {
    if (!this.ctx || !this.masterGain) return;

    this.heartbeatOsc = this.ctx.createOscillator();
    this.heartbeatOsc.type = "sine";
    this.heartbeatOsc.frequency.value = 40;

    this.heartbeatGain = this.ctx.createGain();
    this.heartbeatGain.gain.value = 0;

    this.heartbeatLfo = this.ctx.createOscillator();
    this.heartbeatLfo.type = "sine";
    this.heartbeatLfo.frequency.value = 1;

    this.heartbeatLfoGain = this.ctx.createGain();
    this.heartbeatLfoGain.gain.value = 0.1;

    this.heartbeatLfo.connect(this.heartbeatLfoGain);
    this.heartbeatLfoGain.connect(this.heartbeatGain.gain);

    this.heartbeatOsc.connect(this.heartbeatGain);
    this.heartbeatGain.connect(this.masterGain);

    this.heartbeatOsc.start();
    this.heartbeatLfo.start();
  }

  fadeIn(duration: number = 20, target: number = 0.5): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + duration);
  }

  fadeOut(duration: number = 10): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
  }

  setMasterVolume(target: number, duration: number = 4): void {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + duration);
  }

  shiftPitch(targetHz: number, duration: number = 2): void {
    if (!this.ctx || !this.droneOscL || !this.droneOscR) return;
    const now = this.ctx.currentTime;
    this.droneOscL.frequency.setValueAtTime(this.droneOscL.frequency.value, now);
    this.droneOscL.frequency.linearRampToValueAtTime(targetHz, now + duration);
    this.droneOscR.frequency.setValueAtTime(this.droneOscR.frequency.value, now);
    this.droneOscR.frequency.linearRampToValueAtTime(targetHz + this.binauralBeat, now + duration);
    this.baseFreq = targetHz;
  }

  setBinauralBeat(beatHz: number, duration: number = 4): void {
    if (!this.ctx || !this.droneOscR) return;
    this.binauralBeat = beatHz;
    const now = this.ctx.currentTime;
    this.droneOscR.frequency.setValueAtTime(this.droneOscR.frequency.value, now);
    this.droneOscR.frequency.linearRampToValueAtTime(this.baseFreq + beatHz, now + duration);
  }

  setDepth(depth: number): void {
    if (!this.ctx || !this.droneGain || !this.pinkGain || !this.lfoGain) return;
    const now = this.ctx.currentTime;

    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(0.2 + depth * 0.25, now + 2);

    this.pinkGain.gain.setValueAtTime(this.pinkGain.gain.value, now);
    this.pinkGain.gain.linearRampToValueAtTime(0.06 + depth * 0.08, now + 2);

    if (this.lfo) {
      this.lfo.frequency.setValueAtTime(this.lfo.frequency.value, now);
      this.lfo.frequency.linearRampToValueAtTime(6 - depth * 2, now + 2);
    }

    if (this.droneFilter) {
      this.droneFilter.frequency.setValueAtTime(this.droneFilter.frequency.value, now);
      this.droneFilter.frequency.linearRampToValueAtTime(300 - depth * 100, now + 2);
    }

    if (this.heartbeatLfoGain) {
      this.heartbeatLfoGain.gain.setValueAtTime(this.heartbeatLfoGain.gain.value, now);
      this.heartbeatLfoGain.gain.linearRampToValueAtTime(0.05 + depth * 0.12, now + 2);
    }

    if (this.heartbeatLfo) {
      this.heartbeatLfo.frequency.setValueAtTime(this.heartbeatLfo.frequency.value, now);
      this.heartbeatLfo.frequency.linearRampToValueAtTime(1 - depth * 0.17, now + 4);
    }

    this.setBinauralBeat(4 - depth * 1, 3);
  }

  emerge(duration: number = 10): void {
    if (!this.ctx) return;
    this.shiftPitch(this.baseFreq + 20, duration);
    this.setBinauralBeat(10, duration);
    if (this.droneFilter) {
      const now = this.ctx.currentTime;
      this.droneFilter.frequency.setValueAtTime(this.droneFilter.frequency.value, now);
      this.droneFilter.frequency.linearRampToValueAtTime(600, now + duration);
    }
    if (this.heartbeatLfo) {
      const now = this.ctx.currentTime;
      this.heartbeatLfo.frequency.setValueAtTime(this.heartbeatLfo.frequency.value, now);
      this.heartbeatLfo.frequency.linearRampToValueAtTime(1.2, now + duration);
    }
  }

  stop(): void {
    if (!this.isRunning) return;
    this.fadeOut(3);
    setTimeout(() => {
      try {
        this.droneOscL?.stop();
        this.droneOscR?.stop();
        this.pinkNoiseSource?.stop();
        this.padOsc?.stop();
        this.lfo?.stop();
        this.heartbeatOsc?.stop();
        this.heartbeatLfo?.stop();
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
