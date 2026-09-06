/**
 * Web Audio API procedural sound synthesizer for mythological 2D platformer.
 * Provides authentic mythological resonance: temple bells, divine auras, bow snaps,
 * footsteps, ambient Indian tanpura drones, and battle cues.
 */

export type SoundSlot =
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
  | 'gameOver'
  | 'templeBell'
  | 'templeBellLow'
  | 'dodge'
  | 'block'
  | 'checkpoint'
  | 'levelComplete'
  | 'menuHover';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private customAudioClips: Partial<Record<SoundSlot, string>> = {};
  private lastFootstepTime: number = 0;
  private musicNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
  private isMusicPlaying: boolean = false;
  private masterGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterVolume(vol: number) {
    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopMusic();
    }
  }

  public registerCustomSlot(slot: SoundSlot, audioUrl: string) {
    this.customAudioClips[slot] = audioUrl;
  }

  public startMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 2.5); // Soft fade-in
      gain.connect(this.masterGain);

      // Sacred Vedic Om/Tanpura chord: Sa (136.1Hz - Cosmic frequency), Pa (204.15Hz), Sa octave (272.2Hz), and subtle upper harmonic (408.3Hz)
      const freqs = [136.1, 204.15, 272.2, 408.3];
      const oscs: OscillatorNode[] = [];

      freqs.forEach((f, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(f, t);

        // Subtle slow vibrato / tanpura breath
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.25 + i * 0.1, t);
        lfoGain.gain.setValueAtTime(1.5, t);
        lfo.connect(osc.frequency);
        lfo.start(t);

        osc.connect(gain);
        osc.start(t);
        oscs.push(osc);
      });

      this.musicNodes = { oscs, gain };
      this.isMusicPlaying = true;
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  public stopMusic() {
    if (!this.musicNodes || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.musicNodes.gain.gain.linearRampToValueAtTime(0.001, t + 1.2);
      setTimeout(() => {
        if (this.musicNodes) {
          this.musicNodes.oscs.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          this.musicNodes.gain.disconnect();
          this.musicNodes = null;
        }
      }, 1300);
    } catch {}
    this.isMusicPlaying = false;
  }

  public play(slot: SoundSlot) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    if (this.customAudioClips[slot]) {
      try {
        const audio = new Audio(this.customAudioClips[slot]);
        audio.volume = 0.7;
        audio.play().catch(() => {});
        return;
      } catch {}
    }

    const t = this.ctx.currentTime;
    const dest = this.masterGain;

    switch (slot) {
      case 'heroFootsteps': {
        if (t - this.lastFootstepTime < 0.22) return;
        this.lastFootstepTime = t;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }

      case 'jump': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.16);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }

      case 'landing': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      case 'bowAttack': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(680, t + 0.04);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'arrowHit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      case 'dodge': {
        // Quick aerodynamic whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      case 'block': {
        // Metallic bronze kavach shield impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(650, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }

      case 'enemyAttack': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(75, t + 0.2);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }

      case 'enemyDeath': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.35);
        break;
      }

      case 'heroHurt': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(90, t + 0.18);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }

      case 'divinePower': {
        [528, 660, 792, 1056].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.18 / (idx + 1), t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t + idx * 0.08);
          osc.stop(t + 1.25);
        });
        break;
      }

      case 'templeBell': {
        // Authentic Indian temple bell: fundamental 576Hz, harmonics [576, 1152, 1728, 2304]
        [576, 1152, 1728].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.22 / (i + 1), t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 2.85);
        });
        break;
      }

      case 'templeBellLow': {
        // Deep majestic temple gong
        [288, 576, 864].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.3 / (i + 1), t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t);
          osc.stop(t + 3.85);
        });
        break;
      }

      case 'checkpoint': {
        // Ascending celestial chime
        [432, 540, 648, 864].forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + idx * 0.09);
          gain.gain.setValueAtTime(0.15, t + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.8);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t + idx * 0.09);
          osc.stop(t + idx * 0.09 + 0.85);
        });
        break;
      }

      case 'levelComplete': {
        // Conch (Shankha) fanfare + golden temple bells
        const shankha = this.ctx.createOscillator();
        const shankhaGain = this.ctx.createGain();
        shankha.type = 'sawtooth';
        shankha.frequency.setValueAtTime(260, t);
        shankha.frequency.exponentialRampToValueAtTime(390, t + 0.6);
        shankha.frequency.exponentialRampToValueAtTime(520, t + 1.2);
        shankhaGain.gain.setValueAtTime(0.25, t);
        shankhaGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);
        shankha.connect(shankhaGain);
        shankhaGain.connect(dest);
        shankha.start(t);
        shankha.stop(t + 2.2);

        [520, 650, 780, 1040].forEach((f, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + 0.5 + i * 0.12);
          gain.gain.setValueAtTime(0.2, t + 0.5 + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);
          osc.connect(gain);
          gain.connect(dest);
          osc.start(t + 0.5 + i * 0.12);
          osc.stop(t + 2.85);
        });
        break;
      }

      case 'uiClick': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.05);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }

      case 'menuHover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, t);
        osc.frequency.exponentialRampToValueAtTime(1400, t + 0.04);
        gain.gain.setValueAtTime(0.035, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }

      case 'gameOver': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 1.5);
        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 1.5);
        break;
      }
    }
  }
}

export const soundManager = new SoundManager();
