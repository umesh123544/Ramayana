import { PurneemaState, PurneemaAnimationState, HeroState } from '../types';
import { soundManager } from '../audio/soundManager';
import { adminConfig } from './adminConfig';

export class SupportingCharacterSystem {
  public purneema: PurneemaState;
  public isNearHero: boolean = false;
  public activeDialogue: string | null = null;
  public chapterId: number;

  // Raone Abduction State (Chapters 1 to 9)
  public isAbducted: boolean = false;
  public abductionTriggered: boolean = false;
  public abductionTimer: number = 0;
  public raoneY: number = 100;
  public raoneAlpha: number = 0;
  public abductionDialogueStep: number = 0;

  private get dialogues(): string[] {
    const list = adminConfig.get().companion.dialogues;
    return list && list.length > 0
      ? list
      : [
          'Umesh! Hold the divine bow steady, and let righteousness guide your aim.',
          'Receive this sacred lotus blessing to restore your vitality and divine power!',
        ];
  }

  constructor(chapterId: number = 1, x: number = 1650, y: number = 580) {
    this.chapterId = chapterId;

    // In Chapter 10, Purneema is imprisoned near the arena (x: 3980)
    const initialX = chapterId === 10 ? 3980 : x;
    const initialY = chapterId === 10 ? 570 : y;

    this.purneema = {
      x: initialX,
      y: initialY,
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
    onConferBlessing: () => void,
    onShowDialogue: (text: string) => void
  ) {
    const p = this.purneema;
    p.animTimer += dt;
    p.currentFrame = Math.floor(p.animTimer * 8);

    const dist = Math.hypot(hero.x - p.x, hero.y - p.y);
    this.isNearHero = dist < 90 && !this.isAbducted;

    // Face toward hero if not abducted
    if (!this.isAbducted) {
      p.facing = hero.x < p.x ? 'left' : 'right';
    }

    // Auto-trigger dialogue / abduction when approaching Purneema in Chapters 1-9
    if (
      this.chapterId < 10 &&
      dist < 85 &&
      !this.abductionTriggered &&
      !p.hasGivenBlessing
    ) {
      this.triggerAbduction(onConferBlessing, onShowDialogue);
    }

    // Animate abduction cutscene in Chapters 1-9
    if (this.abductionTriggered && !this.isAbducted) {
      this.abductionTimer += dt;

      // Raone descending from sky
      if (this.abductionTimer < 1.5) {
        this.raoneAlpha = Math.min(1, this.abductionTimer / 0.8);
        this.raoneY = Math.min(p.y - 120, 100 + this.abductionTimer * 260);
      } else if (this.abductionTimer < 3.5) {
        // Purneema ascending into the sky with Raone
        p.y -= dt * 160;
        this.raoneY -= dt * 160;
        p.animState = 'Purneema_Talk';
      } else {
        // Vanished into clouds
        this.isAbducted = true;
        this.raoneAlpha = 0;
        this.closeDialogue();
      }
    }

    if (p.isInteracting && !this.abductionTriggered) {
      p.animState = 'Purneema_Talk';
    } else if (p.animState === 'Purneema_Divine' && p.animTimer > 3.0) {
      p.animState = 'Purneema_Idle';
    } else if (!p.isInteracting && p.animState !== 'Purneema_Divine' && !this.abductionTriggered) {
      p.animState = 'Purneema_Idle';
    }
  }

  public triggerAbduction(
    onConferBlessing: () => void,
    onShowDialogue: (text: string) => void
  ) {
    const p = this.purneema;
    this.abductionTriggered = true;
    p.hasGivenBlessing = true;
    p.animTimer = 0;

    // Confer blessing first
    soundManager.play('divinePower');
    onConferBlessing();

    // Sinister thunder sound - stands in for Raone's taunt instead of a text popup
    setTimeout(() => {
      soundManager.play('enemyAttack');
    }, 400);
    setTimeout(() => {
      soundManager.play('templeBell');
    }, 900);

    if (this.chapterId < 10) {
      // No dialogue popup for the abduction taunt - the sound cues above carry the moment
      return;
    }

    // Chapter 10: Purneema's own strategic advice still shows as a dialogue
    const abductionText = `Purneema: 'Umesh! Demon King Raone is immensely formidable! Strike at his heart with the sacred Brahmastra!'`;

    this.activeDialogue = abductionText;
    onShowDialogue(abductionText);
  }

  public interact(
    onConferBlessing: () => void,
    onShowDialogue: (text: string) => void
  ) {
    if (this.isAbducted) return;

    if (this.chapterId < 10) {
      this.triggerAbduction(onConferBlessing, onShowDialogue);
    } else {
      const p = this.purneema;
      p.isInteracting = true;
      p.animState = 'Purneema_Divine';
      p.animTimer = 0;
      soundManager.play('divinePower');
      onConferBlessing();
      const dialogue =
        "Purneema: 'O Umesh! Raone is vastly powerful! The nectar of his immortality resides within his heart, not his ten heads—aim your celestial arrow there!'";
      this.activeDialogue = dialogue;
      onShowDialogue(dialogue);
    }
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
