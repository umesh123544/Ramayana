import { PurneemaState, PurneemaAnimationState, HeroState } from '../types';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export class SupportingCharacterSystem {
  public purneema: PurneemaState;
  public isNearHero: boolean = false;
  public activeDialogue: string | null = null;

  private get dialogues(): string[] {
    const list = adminConfig.get().companion.dialogues;
    return list && list.length > 0 ? list : [
      "Umesh! Hold the divine bow steady, and let righteousness guide your aim.",
      "Receive this sacred lotus blessing to restore your vitality and divine power!"
    ];
  }

  constructor(x: number = 1650, y: number = 580) {
    this.purneema = {
      x,
      y,
      facing: 'left',
      animState: 'Purneema_Idle',
      animTimer: 0,
      currentFrame: 0,
      isInteracting: false,
      hasGivenBlessing: false,
      dialogueIndex: 0,
    };
  }

  public update(
    dt: number,
    hero: HeroState,
    onConferBlessing: () => void
  ) {
    const p = this.purneema;
    p.animTimer += dt;
    p.currentFrame = Math.floor(p.animTimer * 8);

    const dist = Math.hypot(hero.x - p.x, hero.y - p.y);
    this.isNearHero = dist < 90;

    // Face toward hero
    p.facing = hero.x < p.x ? 'left' : 'right';

    if (p.isInteracting) {
      p.animState = 'Purneema_Talk';
    } else if (p.animState === 'Purneema_Divine' && p.animTimer > 3.0) {
      p.animState = 'Purneema_Idle';
    } else if (!p.isInteracting && p.animState !== 'Purneema_Divine') {
      p.animState = 'Purneema_Idle';
    }
  }

  public interact(onConferBlessing: () => void) {
    const p = this.purneema;
    p.isInteracting = true;
    p.animState = 'Purneema_Talk';
    p.animTimer = 0;

    this.activeDialogue = this.dialogues[p.dialogueIndex];
    p.dialogueIndex = (p.dialogueIndex + 1) % this.dialogues.length;

    // Confer lotus healing blessing
    p.animState = 'Purneema_Divine';
    soundManager.play('divinePower');
    onConferBlessing();
  }

  public closeDialogue() {
    this.purneema.isInteracting = false;
    this.activeDialogue = null;
    this.purneema.animState = 'Purneema_Idle';
  }

  public setAnimationState(state: PurneemaAnimationState) {
    this.purneema.animState = state;
    this.purneema.animTimer = 0;
  }
}
