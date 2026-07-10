/**
 * TranceAudioEngine — Pure Web Audio API synthesis engine.
 * True binaural tones (separate L/R channels), pink noise, isochronic pulses,
 * sub-bass heartbeat, and bilateral ping tones for EMDR/ART modes.
 * No audio files. No fetch calls. All generative.
 */

export type AudioMode = "trance" | "emdr" | "art";

/** Cancel in-flight automation without a value jump.
 *  Firefox has never implemented cancelAndHoldAtTime (bugzil.la/1308431),
 *  so fall back to pinning the current interpolated value before ramping. */
function smoothCancel(param: AudioParam, now: number): void {
  if (typeof param.cancelAndHoldAtTime === "function") {
    param.cancelAndHoldAtTime(now);
  } else {
    const current = param.value;
    param.cancelScheduledValues(now);
    param.setValueAtTime(current, now);
  }
}

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

  // Second binaural layer (higher harmonic)
  private drone2OscL: OscillatorNode | null = null;
  private drone2OscR: OscillatorNode | null = null;
  private drone2PanL: StereoPannerNode | null = null;
  private drone2PanR: StereoPannerNode | null = null;
  private drone2Gain: GainNode | null = null;
  private drone2Filter: BiquadFilterNode | null = null;
  private drone2BaseFreq = 200;

  // Sub-bass heartbeat
  private heartbeatOsc: OscillatorNode | null = null;
  private heartbeatGain: GainNode | null = null;
  private heartbeatLfo: OscillatorNode | null = null;
  private heartbeatLfoGain: GainNode | null = null;

  // Ping gain — separate from master so ping volume slider is independent
  private pingGain: GainNode | null = null;
  private pingVolume = 0.25;

  // Pre-allocated reusable ping chain
  private pingOsc: OscillatorNode | null = null;
  private pingEnv: GainNode | null = null;
  private pingPan: StereoPannerNode | null = null;
  private pingFilter: BiquadFilterNode | null = null;

  private isRunning = false;
  private baseFreq = 100;
  private binauralBeat = 4;
  private mode: AudioMode = "trance";
  private resumeHandler: (() => void) | null = null;
  private visibilityHandler: (() => void) | null = null;

  getContext(): AudioContext | null {
    return this.ctx;
  }

  init(mode: AudioMode = "trance"): void {
    if (this.ctx) return;

    this.mode = mode;
    try {
      // Older Safari (<= 14) only exposes the webkit-prefixed constructor —
      // matches the capability check on the entry screen
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) {
        console.warn("Web Audio not supported in this browser");
        return;
      }
      this.ctx = new AC();
    } catch (e) {
      console.warn("AudioContext initialization failed:", e);
      return;
    }
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    // Separate gain for ping sounds so volume is independently controllable
    this.pingGain = this.ctx.createGain();
    this.pingGain.gain.value = this.pingVolume;
    this.pingGain.connect(this.ctx.destination);

    // Set mode-specific binaural frequency
    if (mode === "emdr") {
      this.baseFreq = 90;
      this.binauralBeat = 5; // Theta (calming)
    } else if (mode === "art") {
      this.baseFreq = 110;
      this.binauralBeat = 10; // Alpha (alert processing)
    }

    // iOS Safari: AudioContext may start suspended. Register a one-time
    // interaction listener to resume it on the first user gesture.
    if (this.ctx.state === "suspended" && typeof document !== "undefined") {
      this.resumeHandler = () => {
        this.ctx?.resume();
        if (this.resumeHandler) {
          document.removeEventListener("touchstart", this.resumeHandler);
          document.removeEventListener("click", this.resumeHandler);
          this.resumeHandler = null;
        }
      };
      document.addEventListener("touchstart", this.resumeHandler, { once: true });
      document.addEventListener("click", this.resumeHandler, { once: true });
    }

    // Mobile browsers (especially iOS Safari) suspend the context when the
    // tab is hidden or the screen locks, and don't reliably resume it.
    // Resume whenever the tab becomes visible again.
    if (typeof document !== "undefined") {
      this.visibilityHandler = () => {
        if (document.visibilityState === "visible" && this.ctx?.state === "suspended") {
          this.ctx.resume().catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", this.visibilityHandler);
    }

    this.setupBinauralDrone();
    this.setupPingChain();

    if (mode === "trance") {
      this.setupSecondBinauralLayer();
      this.setupPinkNoise();
      this.setupIsochronicPulse();
      this.setupHeartbeat();
    } else {
      // EMDR/ART: lighter ambient — just pink noise at lower level
      this.setupPinkNoise();
      if (this.pinkGain) {
        this.pinkGain.gain.value = mode === "emdr" ? 0.04 : 0.03;
      }
    }

    this.isRunning = true;
  }

  private setupPingChain(): void {
    if (!this.ctx || !this.pingGain) return;

    this.pingFilter = this.ctx.createBiquadFilter();
    this.pingFilter.type = "bandpass";
    this.pingFilter.frequency.value = this.mode === "art" ? 900 : 700;
    this.pingFilter.Q.value = 2;

    this.pingEnv = this.ctx.createGain();
    this.pingEnv.gain.value = 0;

    this.pingPan = this.ctx.createStereoPanner();

    // Persistent oscillator runs silently; envelope shapes each ping
    this.pingOsc = this.ctx.createOscillator();
    this.pingOsc.type = "sine";
    this.pingOsc.frequency.value = this.mode === "art" ? 880 : 660;

    this.pingOsc.connect(this.pingFilter);
    this.pingFilter.connect(this.pingEnv);
    this.pingEnv.connect(this.pingPan);
    this.pingPan.connect(this.pingGain);

    this.pingOsc.start();
  }

  /** Play a bilateral ping/tap sound panned to one side. */
  playPing(side: "left" | "right"): void {
    if (!this.ctx || !this.pingEnv || !this.pingPan) return;

    const now = this.ctx.currentTime;

    // Pan to the correct side
    this.pingPan.pan.value = side === "left" ? -0.85 : 0.85;

    // Shape the envelope — fast attack, quick decay
    this.pingEnv.gain.cancelScheduledValues(now);
    this.pingEnv.gain.setValueAtTime(0, now);
    this.pingEnv.gain.linearRampToValueAtTime(0.25, now + 0.005);
    this.pingEnv.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  }

  setPingVolume(volume: number): void {
    if (!this.ctx || !this.pingGain) return;
    this.pingVolume = volume;
    const now = this.ctx.currentTime;
    smoothCancel(this.pingGain.gain, now);
    this.pingGain.gain.linearRampToValueAtTime(volume, now + 0.1);
  }

  setPinkNoiseVolume(volume: number): void {
    if (!this.ctx || !this.pinkGain) return;
    const now = this.ctx.currentTime;
    smoothCancel(this.pinkGain.gain, now);
    this.pinkGain.gain.linearRampToValueAtTime(volume, now + 0.1);
  }

  /** Play a breath cue: tonal chime panned L/R + spoken word.
   *  Inhale: rising tone right ear. Hold: steady tone center. Exhale: falling tone left ear. */
  playBreathCue(phase: "inhale" | "hold" | "exhale"): void {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Tonal cue — panned based on phase
    const osc = this.ctx.createOscillator();
    osc.type = "sine";

    const env = this.ctx.createGain();
    const pan = this.ctx.createStereoPanner();

    if (phase === "inhale") {
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(400, now + 1.0);
      pan.pan.value = 0.7;
    } else if (phase === "exhale") {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(240, now + 1.0);
      pan.pan.value = -0.7;
    } else {
      // Hold — gentle steady tone, centered
      osc.frequency.value = 340;
      pan.pan.value = 0;
    }

    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.18, now + 0.15);
    env.gain.linearRampToValueAtTime(0.14, now + 0.7);
    env.gain.linearRampToValueAtTime(0, now + 1.2);

    osc.connect(env);
    env.connect(pan);
    pan.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  /** Mute binaural drone (set gain to 0) */
  muteBinaural(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.droneGain) {
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(0, now + 2);
    }
    if (this.drone2Gain) {
      this.drone2Gain.gain.setValueAtTime(this.drone2Gain.gain.value, now);
      this.drone2Gain.gain.linearRampToValueAtTime(0, now + 2);
    }
  }

  /** Modulate binaural drone volume to follow the breathing cycle.
   *  scale: 0 = quieter (exhale/hold), 1 = louder (inhale peak) */
  setBreathDroneModulation(scale: number, duration: number = 2): void {
    if (!this.ctx || !this.droneGain) return;
    const now = this.ctx.currentTime;
    // Base drone level + modulation range
    const base = this.mode === "trance" ? 0.35 : 0.3;
    const range = 0.15;
    const target = base + scale * range;
    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(target, now + duration);
  }

  /** Set heartbeat rate in BPM. 60 = normal resting, 45 = deep relaxation. */
  setHeartbeatRate(bpm: number, duration: number = 30): void {
    if (!this.ctx || !this.heartbeatLfo) return;
    const hz = bpm / 60;
    const now = this.ctx.currentTime;
    this.heartbeatLfo.frequency.setValueAtTime(this.heartbeatLfo.frequency.value, now);
    this.heartbeatLfo.frequency.linearRampToValueAtTime(hz, now + duration);
  }

  private setupBinauralDrone(): void {
    if (!this.ctx || !this.masterGain) return;

    this.droneFilter = this.ctx.createBiquadFilter();
    this.droneFilter.type = "lowpass";
    this.droneFilter.frequency.value = this.mode === "art" ? 400 : 300;
    this.droneFilter.Q.value = 1;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = this.mode === "trance" ? 0.55 : 0.2;

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

  private setupSecondBinauralLayer(): void {
    if (!this.ctx || !this.masterGain) return;

    this.drone2Filter = this.ctx.createBiquadFilter();
    this.drone2Filter.type = "lowpass";
    this.drone2Filter.frequency.value = 500;
    this.drone2Filter.Q.value = 0.7;

    this.drone2Gain = this.ctx.createGain();
    this.drone2Gain.gain.value = 0.08; // Quieter than primary layer

    this.drone2BaseFreq = 200;

    this.drone2OscL = this.ctx.createOscillator();
    this.drone2OscL.type = "sine";
    this.drone2OscL.frequency.value = this.drone2BaseFreq;
    this.drone2PanL = this.ctx.createStereoPanner();
    this.drone2PanL.pan.value = -1;

    this.drone2OscR = this.ctx.createOscillator();
    this.drone2OscR.type = "sine";
    this.drone2OscR.frequency.value = this.drone2BaseFreq + this.binauralBeat;
    this.drone2PanR = this.ctx.createStereoPanner();
    this.drone2PanR.pan.value = 1;

    this.drone2OscL.connect(this.drone2PanL);
    this.drone2PanL.connect(this.drone2Filter);
    this.drone2OscR.connect(this.drone2PanR);
    this.drone2PanR.connect(this.drone2Filter);
    this.drone2Filter.connect(this.drone2Gain);
    this.drone2Gain.connect(this.masterGain);

    this.drone2OscL.start();
    this.drone2OscR.start();
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
    // iOS Safari: context starts suspended when created outside a user gesture.
    // Resume it here — fadeIn is always called early in the session lifecycle.
    this.resume();
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
    const now = this.ctx.currentTime;
    smoothCancel(this.masterGain.gain, now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + duration);
  }

  shiftPitch(targetHz: number, duration: number = 2): void {
    if (!this.ctx || !this.droneOscL || !this.droneOscR) return;
    const now = this.ctx.currentTime;
    this.droneOscL.frequency.setValueAtTime(this.droneOscL.frequency.value, now);
    this.droneOscL.frequency.linearRampToValueAtTime(targetHz, now + duration);
    this.droneOscR.frequency.setValueAtTime(this.droneOscR.frequency.value, now);
    this.droneOscR.frequency.linearRampToValueAtTime(targetHz + this.binauralBeat, now + duration);
    // Second layer shifts proportionally (2:1 ratio)
    const target2 = targetHz * 2;
    if (this.drone2OscL) {
      this.drone2OscL.frequency.setValueAtTime(this.drone2OscL.frequency.value, now);
      this.drone2OscL.frequency.linearRampToValueAtTime(target2, now + duration);
      this.drone2BaseFreq = target2;
    }
    if (this.drone2OscR) {
      this.drone2OscR.frequency.setValueAtTime(this.drone2OscR.frequency.value, now);
      this.drone2OscR.frequency.linearRampToValueAtTime(target2 + this.binauralBeat, now + duration);
    }
    this.baseFreq = targetHz;
  }

  setBinauralBeat(beatHz: number, duration: number = 4): void {
    if (!this.ctx || !this.droneOscR) return;
    this.binauralBeat = beatHz;
    const now = this.ctx.currentTime;

    // cancelAndHoldAtTime inserts a SetValue event at `now` holding the current
    // interpolated frequency, so a subsequent ramp starts from the right place.
    // This prevents clicks when called rapidly (e.g. slider drag mid-ramp).
    // Falls back to cancelScheduledValues for older browsers.
    const ramp = (param: AudioParam, target: number) => {
      smoothCancel(param, now);
      param.linearRampToValueAtTime(target, now + duration);
    };

    ramp(this.droneOscR.frequency, this.baseFreq + beatHz);
    if (this.drone2OscR) {
      ramp(this.drone2OscR.frequency, this.drone2BaseFreq + beatHz);
    }
  }

  setDepth(depth: number): void {
    if (!this.ctx || !this.droneGain || !this.pinkGain || !this.lfoGain) return;
    const now = this.ctx.currentTime;

    this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
    this.droneGain.gain.linearRampToValueAtTime(0.35 + depth * 0.4, now + 2);

    this.pinkGain.gain.setValueAtTime(this.pinkGain.gain.value, now);
    this.pinkGain.gain.linearRampToValueAtTime(0.06 + depth * 0.04, now + 2);

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
    this.isRunning = false;
    // Clean up iOS resume listener
    if (this.resumeHandler) {
      document.removeEventListener("touchstart", this.resumeHandler);
      document.removeEventListener("click", this.resumeHandler);
      this.resumeHandler = null;
    }
    if (this.visibilityHandler) {
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      this.visibilityHandler = null;
    }
    this.fadeOut(3);
    setTimeout(() => {
      try {
        this.droneOscL?.stop();
        this.droneOscR?.stop();
        this.pinkNoiseSource?.stop();
        this.padOsc?.stop();
        this.lfo?.stop();
        this.drone2OscL?.stop();
        this.drone2OscR?.stop();
        this.heartbeatOsc?.stop();
        this.heartbeatLfo?.stop();
        this.pingOsc?.stop();
        this.ctx?.close();
      } catch {
        // Nodes may already be stopped
      }
      this.ctx = null;
    }, 3500);
  }

  resume(): void {
    if (this.ctx?.state === "suspended") {
      this.ctx.resume();
    }
  }
}
