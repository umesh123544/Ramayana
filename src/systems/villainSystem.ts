import { RaoneState, RaoneAnimationState } from '../types';
import { adminConfig } from './adminConfig';

export class VillainSystem {
  public raone: RaoneState;

  constructor(x: number = 3800, y: number = 540) {
    const vMaxHp = adminConfig.get().villain.maxHp || 500;
    this.raone = {
      x,
      y,
      facing: 'left',
      animState: 'Raone_Idle',
      animTimer: 0,
      currentFrame: 0,
      hp: vMaxHp,
      maxHp: vMaxHp,
      isRaging: false,
      actionTimer: 0,
    };
  }

  public update(dt: number) {
    const r = this.raone;
    r.animTimer += dt;
    r.currentFrame = Math.floor(r.animTimer * 8);

    // Subtle breathing / posture shift in idle
    if (r.animState === 'Raone_Idle') {
      r.isRaging = false;
    } else if (r.animState === 'Raone_Rage') {
      r.isRaging = true;
    }
  }

  public setAnimationState(state: RaoneAnimationState) {
    this.raone.animState = state;
    this.raone.animTimer = 0;
    this.raone.isRaging = state === 'Raone_Rage';
  }
}
