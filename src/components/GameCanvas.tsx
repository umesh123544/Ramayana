import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera2D } from '../engine/camera';
import { EnvironmentRenderer } from '../render/environmentRenderer';
import { CharacterController, PlayerInput } from '../systems/characterController';
import { EnemySystem } from '../systems/enemySystem';
import { CombatSystem } from '../systems/combatSystem';
import { SupportingCharacterSystem } from '../systems/supportingCharacters';
import { VillainSystem } from '../systems/villainSystem';
import { INITIAL_PLATFORMS } from '../data/platforms';
import {
  renderUmesh,
  renderPurneema,
  renderRaone,
  renderEnemy,
} from '../render/sprites';
import { HeroState } from '../types';

interface GameCanvasProps {
  onHeroStateChange: (hero: HeroState) => void;
  onShowDivineBlessing: (message?: string) => void;
  onGameOver: () => void;
  canInteractPurneema: (can: boolean) => void;
  onOpenDialogue: (text: string) => void;
  externalInputRef: React.MutableRefObject<Partial<PlayerInput>>;
  gameKey: number; // Trigger re-init on restart
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onHeroStateChange,
  onShowDivineBlessing,
  onGameOver,
  canInteractPurneema,
  onOpenDialogue,
  externalInputRef,
  gameKey,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard input state
  const keysRef = useRef<{ [code: string]: boolean }>({});
  const isMouseDownRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize Subsystems
    const camera = new Camera2D(canvas.width, canvas.height);
    const envRenderer = new EnvironmentRenderer();
    const characterController = new CharacterController(250, 600);
    const enemySystem = new EnemySystem();
    const combatSystem = new CombatSystem();
    const supportSystem = new SupportingCharacterSystem(1650, 580);
    const villainSystem = new VillainSystem(3800, 540);
    const platforms = INITIAL_PLATFORMS;

    let animFrameId: number;
    let lastTime = performance.now();

    // Resize observer
    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      camera.resize(rect.width, rect.height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Snap camera initially to hero
    camera.snapTo(characterController.hero.x, characterController.hero.y);

    // Keyboard Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Talk to Purneema with 'KeyE'
      if (e.code === 'KeyE' && supportSystem.isNearHero) {
        supportSystem.interact(() => {
          characterController.collectDivineEnergy(35);
          combatSystem.spawnDivineBlessingBurst(supportSystem.purneema.x, supportSystem.purneema.y - 40);
          onShowDivineBlessing('SACRED LOTUS BLESSING');
        });
        if (supportSystem.activeDialogue) {
          onOpenDialogue(supportSystem.activeDialogue);
        }
      }

      // Space / Arrows shouldn't scroll browser window
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        // Left Click -> Attack charge
        isMouseDownRef.current = true;
      } else if (e.button === 2) {
        // Right Click -> Divine Power
        e.preventDefault();
        keysRef.current['MouseRight'] = true;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDownRef.current = false;
      } else if (e.button === 2) {
        keysRef.current['MouseRight'] = false;
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default browser context menu on right click
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('contextmenu', onContextMenu);

    // ==========================================
    // MAIN 60FPS GAME LOOP
    // ==========================================
    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta time
      lastTime = currentTime;

      const keys = keysRef.current;
      const ext = externalInputRef.current;

      // Merge keyboard & virtual inputs
      const isLeft = !!(keys['KeyA'] || keys['ArrowLeft'] || ext.left);
      const isRight = !!(keys['KeyD'] || keys['ArrowRight'] || ext.right);
      const isRun = !!(keys['ShiftLeft'] || keys['ShiftRight'] || ext.run);
      const isJump = !!(keys['Space'] || keys['KeyW'] || keys['ArrowUp'] || ext.jump);
      const isDivine = !!(keys['KeyK'] || keys['KeyX'] || keys['KeyC'] || keys['MouseRight'] || ext.divinePower);

      // Attack: trigger charge on hold, release on unpress
      const attackDown = isMouseDownRef.current || !!keys['KeyJ'] || !!keys['KeyZ'] || !!ext.attackDown;
      const attackRelease = !attackDown && (keys['prevAttack'] || ext.attackRelease);
      keys['prevAttack'] = attackDown;

      // Consume one-shot divine / attackRelease from external touch inputs
      if (ext.divinePower) ext.divinePower = false;
      if (ext.attackRelease) ext.attackRelease = false;

      const playerInput: PlayerInput = {
        left: isLeft,
        right: isRight,
        run: isRun,
        jump: isJump,
        attackDown,
        attackRelease,
        divinePower: isDivine,
        interact: !!keys['KeyE'],
      };

      // 1. Update Environment & Parallax
      envRenderer.update(dt);

      // 2. Update Umesh Character Controller
      characterController.update(
        dt,
        playerInput,
        platforms,
        (isCharged) => {
          // Shoot Arrow
          combatSystem.shootHeroArrow(characterController.hero, isCharged);
        },
        () => {
          // Trigger Divine Blessing Banner & FX
          combatSystem.spawnDivineBlessingBurst(
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y + characterController.hero.height * 0.5
          );
          onShowDivineBlessing('DIVINE BLESSING');
        },
        () => {
          // All 3 lives lost -> Game Over
          onGameOver();
        }
      );

      // 3. Update Camera
      camera.follow(
        characterController.hero.x + characterController.hero.width * 0.5,
        characterController.hero.y + characterController.hero.height * 0.5,
        characterController.hero.facing,
        dt
      );

      // 4. Update Supporting Character (Purneema)
      supportSystem.update(dt, characterController.hero, () => {
        characterController.collectDivineEnergy(35);
        combatSystem.spawnDivineBlessingBurst(supportSystem.purneema.x, supportSystem.purneema.y - 40);
        onShowDivineBlessing('SACRED LOTUS BLESSING');
      });
      canInteractPurneema(supportSystem.isNearHero);

      // 5. Update Main Villain (Raone)
      villainSystem.update(dt);

      // 6. Update Enemy System (AI, Movement, Attacks)
      enemySystem.update(
        dt,
        characterController.hero,
        platforms,
        (enemyProj) => {
          combatSystem.addEnemyProjectile(enemyProj);
        },
        (meleeDmg, knockbackDir) => {
          characterController.takeDamage(meleeDmg, knockbackDir);
          combatSystem.addFloatingText(
            `-${meleeDmg}`,
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y - 10,
            '#ef4444'
          );
          combatSystem.spawnImpactSparks(
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y + characterController.hero.height * 0.5,
            '#ef4444',
            8
          );
        }
      );

      // 7. Update Combat System (Projectiles, Particles, Collectibles)
      combatSystem.update(
        dt,
        characterController.hero,
        enemySystem.enemies,
        platforms,
        (heroDmg, knockDir) => {
          characterController.takeDamage(heroDmg, knockDir);
        },
        (enemyId, enemyDmg, knockDir) => {
          const res = enemySystem.applyDamage(enemyId, enemyDmg, knockDir);
          if (res.died) {
            // Reward small divine energy on enemy defeat
            characterController.collectDivineEnergy(12);
            combatSystem.addFloatingText('+12 DIVINE', res.enemy!.x, res.enemy!.y - 20, '#fbbf24');
          }
        },
        (energyValue) => {
          characterController.collectDivineEnergy(energyValue);
        }
      );

      // Notify React state of hero updates
      onHeroStateChange({ ...characterController.hero });

      // ==========================================
      // RENDERING PHASE
      // ==========================================
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        const dpr = window.devicePixelRatio || 1;
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, camera.viewportWidth, camera.viewportHeight);

        // 1. Render Environment & 5 Parallax Layers
        envRenderer.render(ctx, camera, platforms, combatSystem.collectibles);

        // 2. Render Purneema (Heroine)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        renderPurneema(
          ctx,
          supportSystem.purneema.x - 22,
          supportSystem.purneema.y - 68,
          44,
          68,
          supportSystem.purneema.facing,
          supportSystem.purneema.animState,
          supportSystem.purneema.currentFrame
        );

        // Purneema overhead interaction prompt if nearby
        if (supportSystem.isNearHero) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(supportSystem.purneema.x - 45, supportSystem.purneema.y - 95, 90, 20);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1;
          ctx.strokeRect(supportSystem.purneema.x - 45, supportSystem.purneema.y - 95, 90, 20);
          ctx.fillStyle = '#fbcfe8';
          ctx.font = 'bold 10px "Cinzel", sans-serif';
          ctx.fillText('Press E to Talk', supportSystem.purneema.x - 38, supportSystem.purneema.y - 81);
        }
        ctx.restore();

        // 3. Render Raone (Main Villain at Eastern Mountain Cave outpost)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        renderRaone(
          ctx,
          villainSystem.raone.x - 35,
          villainSystem.raone.y - 95,
          70,
          95,
          villainSystem.raone.facing,
          villainSystem.raone.animState,
          villainSystem.raone.currentFrame
        );
        ctx.restore();

        // 4. Render All Enemies
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        for (const enemy of enemySystem.enemies) {
          renderEnemy(
            ctx,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height,
            enemy.facing,
            enemy.type,
            enemy.animState,
            enemy.currentFrame,
            enemy.hp / enemy.maxHp,
            enemy.hurtTimer > 0
          );
        }
        ctx.restore();

        // 5. Render Umesh (Playable Hero)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);
        renderUmesh(
          ctx,
          characterController.hero.x,
          characterController.hero.y,
          characterController.hero.width,
          characterController.hero.height,
          characterController.hero.facing,
          characterController.hero.animState,
          characterController.hero.currentFrame,
          characterController.hero.isHurt,
          characterController.hero.isDivineActive,
          characterController.hero.chargeTime / 0.8
        );
        ctx.restore();

        // 6. Render Combat Projectiles, Particles & Floating Texts
        combatSystem.render(ctx, camera.x, camera.y);

        ctx.restore();
      }

      animFrameId = requestAnimationFrame(gameLoop);
    };

    animFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gameKey]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center cursor-crosshair select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};
