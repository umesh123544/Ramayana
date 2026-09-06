/**
 * Web Audio API procedural sound synthesizer for mythological 2D platformer.
 * Provides all 11 required audio slots with authentic mythological resonance,
 * and allows slot overrides for external audio assets.
 */

type SoundSlot =
  | 'heroFootsteps'
  | 'jump'
  | 'landing'
  | 'bowAttack'
  | 'arrowHit'
  | 'enemyAttack'
  | 'enemyDeath'
  | 'heroHurt'
  | 'divinePower'
  | 'uiClick'
  | 'gameOver';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private customAudioClips: Partial<Record<SoundSlot, string>> = {};
  private lastFootstepTime: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public registerCustomSlot(slot: SoundSlot, audioUrl: string) {
    this.customAudioClips[slot] = audioUrl;
  }

  public play(slot: SoundSlot) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // If custom audio clip URL provided, try playing it
    if (this.customAudioClips[slot]) {
      try {
        const audio = new Audio(this.customAudioClips[slot]);
        audio.volume = 0.7;
        audio.play().catch(() => {});
        return;
      } catch {
        // Fallback to procedural synth below
      }
    }

    const t = this.ctx.currentTime;

    switch (slot) {
      case 'heroFootsteps': {
        if (t - this.lastFootstepTime < 0.22) return;
        this.lastFootstepTime = t;
        // Soft earth/stone crunch
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }

      case 'jump': {
        // Light mythological whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.16);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }

      case 'landing': {
        // Solid thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      case 'bowAttack': {
        // Crisp bowstring snap and release
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(680, t + 0.04);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'arrowHit': {
        // Sharp wood/metal arrow impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'enemyAttack': {
        // Demonic roar/slash
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(75, t + 0.2);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }

      case 'enemyDeath': {
        // Deep demon dissolution dissipation
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }

      case 'heroHurt': {
        // Hero damage impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      case 'divinePower': {
        // Sacred Tanpura / Golden Temple Bell resonance
        [528, 660, 792, 1056].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.18 / (idx + 1), t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + idx * 0.08);
          osc.stop(t + 1.25);
        });
        break;
      }

      case 'uiClick': {
        // Clean temple click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.05);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }

      case 'gameOver': {
        // Somber ancient drone
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 1.5);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 1.5);
        break;
      }
    }
  }
}

export const soundManager = new SoundManager();
