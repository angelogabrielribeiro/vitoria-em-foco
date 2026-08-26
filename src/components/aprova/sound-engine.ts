export type SoundCue = "tap" | "open" | "correct" | "wrong" | "reward" | "level";

class SoundEngine {
  private context: AudioContext | null = null;
  private ambient: { gain: GainNode; nodes: AudioNode[] } | null = null;
  private enabled = false;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.context) this.context = new AudioContext();
    if (this.context.state === "suspended") void this.context.resume();
    return this.context;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled) {
      this.getContext();
      this.startAmbient();
      this.play("open");
    } else {
      this.stopAmbient();
    }
  }

  play(cue: SoundCue) {
    if (!this.enabled) return;
    const context = this.getContext();
    if (!context) return;
    const now = context.currentTime;
    const notes: Record<SoundCue, number[]> = {
      tap: [420],
      open: [260, 390],
      correct: [440, 660, 880],
      wrong: [190, 150],
      reward: [392, 523, 659, 784],
      level: [330, 440, 554, 659, 880],
    };
    const duration = cue === "tap" ? 0.055 : 0.16;
    notes[cue].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = cue === "wrong" ? "sawtooth" : index % 2 === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.055);
      gain.gain.setValueAtTime(0, now + index * 0.055);
      gain.gain.linearRampToValueAtTime(cue === "tap" ? 0.018 : 0.045, now + index * 0.055 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.055 + duration);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + index * 0.055);
      oscillator.stop(now + index * 0.055 + duration + 0.02);
    });
  }

  private startAmbient() {
    if (this.ambient) return;
    const context = this.getContext();
    if (!context) return;
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    const low = context.createOscillator();
    const high = context.createOscillator();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();

    gain.gain.value = 0.009;
    filter.type = "lowpass";
    filter.frequency.value = 320;
    low.type = "sine";
    low.frequency.value = 55;
    high.type = "triangle";
    high.frequency.value = 82.5;
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.004;
    lfo.connect(lfoGain).connect(gain.gain);
    low.connect(filter);
    high.connect(filter);
    filter.connect(gain).connect(context.destination);
    low.start();
    high.start();
    lfo.start();
    this.ambient = { gain, nodes: [low, high, lfo, lfoGain, filter] };
  }

  private stopAmbient() {
    if (!this.ambient) return;
    const context = this.context;
    if (context) {
      const now = context.currentTime;
      this.ambient.gain.gain.cancelScheduledValues(now);
      this.ambient.gain.gain.setValueAtTime(this.ambient.gain.gain.value, now);
      this.ambient.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    }
    this.ambient.nodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        try {
          node.stop((context?.currentTime ?? 0) + 0.2);
        } catch {
          /* oscillator já encerrado */
        }
      }
    });
    this.ambient = null;
  }
}

export const soundEngine = new SoundEngine();
