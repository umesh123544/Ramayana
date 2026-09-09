import React, { useRef, useEffect } from 'react';
import { Camera2D } from '../engine/camera';
import { ParticleSystem } from '../engine/particleSystem';
import { EnvironmentRenderer } from '../render/environmentRenderer';
import { CharacterController, PlayerInput } from '../systems/characterController';
import { EnemySystem } from '../systems/enemySystem';
import { CombatSystem } from '../systems/combatSystem';
import { SupportingCharacterSystem } from '../systems/supportingCharacters';
import { BossSystem } from '../systems/bossSystem';
import { renderBoss } from '../render/bossRenderer';
import { INITIAL_PLATFORMS } from '../data/platforms';
import {
  renderUmesh,
  renderPurneema,
  renderEnemy,
} from '../render/sprites';
import { HeroState } from '../types';

interface GameCanvasProps {
  onHeroStateChange: (hero: HeroState) => void;
  onShowDivineBlessing: (message?: string) => void;
  onGameOver: () => void;
  onChapterVictory: (chapterId: number) => void;
  canInteractPurneema: (can: boolean) => void;
  onOpenDialogue: (text: string) => void;
  externalInputRef: React.MutableRefObject<Partial<PlayerInput>>;
  gameKey: number; // Trigger re-init on restart
  chapterId?: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onHeroStateChange,
  onShowDivineBlessing,
  onGameOver,
  onChapterVictory,
  canInteractPurneema,
  onOpenDialogue,
  externalInputRef,
  gameKey,
  chapterId = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard & Mouse input state
  const keysRef = useRef<{ [code: string]: boolean }>({});
  const isMouseDownRef = useRef<boolean>(false);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Initialize Subsystems with current chapter
    const camera = new Camera2D(canvas.width, canvas.height);
    const envRenderer = new EnvironmentRenderer();
    envRenderer.setChapter(chapterId);

    const characterController = new CharacterController(250, 600);
    const particleSystem = new ParticleSystem();
    const enemySystem = new EnemySystem(chapterId);
    const combatSystem = new CombatSystem();
    const supportSystem = new SupportingCharacterSystem(chapterId, 1650, 580);
    const bossSystem = new BossSystem(chapterId, 5300, 560);
    const platforms = INITIAL_PLATFORMS;

    let animFrameId: number;
    let lastTime = performance.now();
    let divineAuraTickTimer = 0;

    // Resize observer
    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap dpr to 2 for mobile performance
      const width = Math.max(320, rect.width || window.innerWidth || 360);
      const height = Math.max(240, rect.height || window.innerHeight || 640);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      camera.resize(width, height);
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
        supportSystem.interact(
          () => {
            characterController.collectDivineEnergy(35);
            combatSystem.spawnDivineBlessingBurst(supportSystem.purneema.x, supportSystem.purneema.y - 40);
            onShowDivineBlessing('SACRED LOTUS BLESSING');
          },
          (dialogueText) => {
            onOpenDialogue(dialogueText);
          }
        );
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
        mousePosRef.current = { x: e.clientX, y: e.clientY };
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

    const onMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('contextmenu', onContextMenu);

    // ==========================================
    // MAIN 60FPS GAME LOOP
    // ==========================================
    const gameLoop = (currentTime: number) => {
      try {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta time
        lastTime = currentTime;

        const keys = keysRef.current;
        const ext = externalInputRef.current;

      // Merge keyboard & virtual inputs
      const isLeft = !!(keys['KeyA'] || keys['ArrowLeft'] || ext.left);
      const isRight = !!(keys['KeyD'] || keys['ArrowRight'] || ext.right);
      const isUp = !!(keys['KeyW'] || keys['ArrowUp'] || ext.up);
      const isDown = !!(keys['KeyS'] || keys['ArrowDown'] || ext.down);
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
        up: isUp,
        down: isDown,
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
          // Shoot Arrow directly in player facing direction with smart auto-target assist
          combatSystem.shootHeroArrow(
            characterController.hero,
            isCharged,
            enemySystem.enemies,
            bossSystem?.boss || undefined
          );

          // Calculate bow launch muzzle point
          const dirX = characterController.hero.facing === 'right' ? 1 : -1;
          const bowX = characterController.hero.x + characterController.hero.width * 0.5 + dirX * 24;
          const bowY = characterController.hero.y + characterController.hero.height * 0.42;

          // Bow firing impact with ParticleSystem
          particleSystem.createBowFireImpact(bowX, bowY, characterController.hero.facing, isCharged);
          if (isCharged) {
            camera.addTrauma(0.24); // Screen shake impact on heavy charged arrow release
          }
        },
        () => {
          // Trigger Divine Blessing Banner & FX
          combatSystem.spawnDivineBlessingBurst(
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y + characterController.hero.height * 0.5
          );
          camera.addTrauma(0.35);
          onShowDivineBlessing('DIVINE BLESSING');
        },
        () => {
          // All lives lost -> Game Over
          onGameOver();
        },
        (landX, landY, fallSpeed) => {
          // Ground landing impact particles and dust plumes
          const isHighJump = fallSpeed > 450;
          particleSystem.createLandingImpact(
            landX,
            landY,
            fallSpeed,
            characterController.hero.isDivineActive
          );
          if (isHighJump) {
            // Screen shake effect when Umesh lands from a high jump
            const trauma = Math.min(0.48, Math.max(0.2, (fallSpeed - 350) / 550));
            camera.addTrauma(trauma);
          }
        },
        (jumpX, jumpY) => {
          // Dust takeoff puff when leaping into the air
          particleSystem.createJumpTakeoff(jumpX, jumpY);
        }
      );

      // 3. Update Camera
      camera.follow(
        characterController.hero.x + characterController.hero.width * 0.5,
        characterController.hero.y + characterController.hero.height * 0.5,
        characterController.hero.facing,
        dt
      );

      // 4. Update Supporting Character (Purneema) & Story Abduction
      supportSystem.update(
        dt,
        characterController.hero,
        () => {
          characterController.collectDivineEnergy(35);
          combatSystem.spawnDivineBlessingBurst(supportSystem.purneema.x, supportSystem.purneema.y - 40);
          onShowDivineBlessing('SACRED LOTUS BLESSING');
        },
        (dialogueText) => {
          onOpenDialogue(dialogueText);
        }
      );
      canInteractPurneema(supportSystem.isNearHero);

      // 5. Update Chapter Boss System
      bossSystem.update(
        dt,
        characterController.hero,
        platforms,
        (proj) => {
          combatSystem.addEnemyProjectile(proj);
        },
        (bossMeleeDmg, knockDir) => {
          characterController.takeDamage(bossMeleeDmg, knockDir);
        },
        (chId) => {
          onChapterVictory(chId);
        }
      );

      // 6. Update Chapter Enemies
      enemySystem.update(
        dt,
        characterController.hero,
        platforms,
        (proj) => {
          combatSystem.addEnemyProjectile(proj);
        },
        (enemyMeleeDmg, knockDir) => {
          characterController.takeDamage(enemyMeleeDmg, knockDir);
        }
      );

      // 7. Divine Aura Periodic Pulse
      if (characterController.hero.isDivineActive) {
        divineAuraTickTimer += dt;
        if (divineAuraTickTimer >= 0.35) {
          divineAuraTickTimer = 0;
          combatSystem.spawnDivineBlessingBurst(
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y + characterController.hero.height * 0.5
          );
        }
      }

      // 8. Update Combat Projectiles & Enemy/Boss Hits
      combatSystem.update(
        dt,
        characterController.hero,
        enemySystem.enemies,
        platforms,
        (heroDmg, knockDir) => {
          characterController.takeDamage(heroDmg, knockDir);
          camera.addTrauma(0.32); // Screen shake on hero taking damage
          particleSystem.createHitImpact(
            characterController.hero.x + characterController.hero.width * 0.5,
            characterController.hero.y + characterController.hero.height * 0.5,
            false,
            '#ef4444'
          );
        },
        (enemyId, enemyDmg, knockDir) => {
          const res = enemySystem.applyDamage(enemyId, enemyDmg, knockDir);
          if (res.enemy) {
            particleSystem.createHitImpact(
              res.enemy.x + res.enemy.width * 0.5,
              res.enemy.y + res.enemy.height * 0.5,
              false,
              '#f59e0b'
            );
          }
          if (res.died) {
            characterController.collectDivineEnergy(12);
            combatSystem.addFloatingText('+12 DIVINE', res.enemy!.x, res.enemy!.y - 20, '#fbbf24');
          }
        },
        (energyValue) => {
          characterController.collectDivineEnergy(energyValue);
        },
        bossSystem.boss,
        (bossDmg, knockDir, isCharged) => {
          const res = bossSystem.applyDamage(
            bossDmg,
            knockDir,
            (chId) => {
              onChapterVictory(chId);
            },
            isCharged,
            characterController.hero.isDivineActive
          );
          // Cinematic boss impact shockwave and screen shake
          particleSystem.createBossImpact(
            bossSystem.boss.x + bossSystem.boss.width * 0.5,
            bossSystem.boss.y + bossSystem.boss.height * 0.5,
            isCharged ? 1.4 : 1.0
          );
          camera.addTrauma(isCharged ? 0.42 : 0.22);

          if (res.absorbed) {
            combatSystem.addFloatingText('SHIELDED! (-55%)', bossSystem.boss.x, bossSystem.boss.y - 30, '#c084fc');
          }
          if (res.died) {
            camera.addTrauma(0.65); // Epic victory screen shake
            combatSystem.spawnDivineBlessingBurst(
              bossSystem.boss.x + bossSystem.boss.width * 0.5,
              bossSystem.boss.y + bossSystem.boss.height * 0.5
            );
          }
        }
      );

      // 9. Update Engine Particle System
      particleSystem.update(dt);

      // Notify React state of hero updates
      onHeroStateChange({ ...characterController.hero });

      // ==========================================
      // RENDERING PHASE
      // ==========================================
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, camera.viewportWidth, camera.viewportHeight);

        // 1. Render Environment & Parallax Layers for this Chapter
        envRenderer.render(ctx, camera, platforms, combatSystem.collectibles);

        // 2. Render Purneema (Heroine) or Abduction Scene
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        if (!supportSystem.isAbducted) {
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

          // In Chapter 10: Render celestial prison cage
          if (chapterId === 10) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 3;
            ctx.strokeRect(supportSystem.purneema.x - 28, supportSystem.purneema.y - 78, 56, 82);
            // Cage bars
            for (let i = 1; i <= 4; i++) {
              ctx.beginPath();
              ctx.moveTo(supportSystem.purneema.x - 28 + i * 11, supportSystem.purneema.y - 78);
              ctx.lineTo(supportSystem.purneema.x - 28 + i * 11, supportSystem.purneema.y + 4);
              ctx.stroke();
            }
          }

          // Raone Spectral Sky Chariot during abduction cutscene (Chapters 1-9)
          if (supportSystem.raoneAlpha > 0) {
            ctx.save();
            ctx.globalAlpha = supportSystem.raoneAlpha;
            const rx = supportSystem.purneema.x;
            const ry = supportSystem.raoneY;

            // Dark clouds & red lightning
            ctx.fillStyle = 'rgba(15, 5, 25, 0.85)';
            ctx.beginPath();
            ctx.arc(rx, ry, 65, 0, Math.PI * 2);
            ctx.fill();

            // Raone's Golden Flying Chariot & 10-Headed Silhouette
            ctx.fillStyle = '#991b1b';
            ctx.beginPath();
            ctx.roundRect(rx - 35, ry + 15, 70, 20, [8, 8, 4, 4]);
            ctx.fill();

            // Raone silhouette
            ctx.fillStyle = '#171717';
            ctx.beginPath();
            ctx.arc(rx, ry - 10, 18, 0, Math.PI * 2);
            ctx.fill();

            // Glowing red demonic eyes
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(rx - 8, ry - 12, 4, 3);
            ctx.fillRect(rx + 4, ry - 12, 4, 3);

            // Banner title
            ctx.fillStyle = '#f87171';
            ctx.font = 'bold 11px serif';
            ctx.textAlign = 'center';
            ctx.fillText('Raone Pushpaka Chariot', rx, ry - 35);
            ctx.restore();
          }

        }
        ctx.restore();

        // 3. Render Chapter Boss
        renderBoss(ctx, bossSystem.boss, camera, currentTime / 1000);

        // 4. Render All Chapter Enemies
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

        // 6. Bow Charge Guide (When charging bow)
        if (characterController.hero.isCharging) {
          const h = characterController.hero;
          const dirX = h.facing === 'right' ? 1 : -1;
          const startX = h.x + h.width * 0.5;
          const startY = h.y + h.height * 0.42;

          ctx.save();
          ctx.strokeStyle = h.chargeTime >= 0.8 ? '#fbbf24' : 'rgba(254, 240, 138, 0.7)';
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(startX + dirX * 140, startY);
          ctx.stroke();

          // Reticle target tip
          ctx.fillStyle = h.chargeTime >= 0.8 ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(startX + dirX * 140, startY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();

        // 7. Render Combat Projectiles, Particles & Floating Texts
        combatSystem.render(ctx, camera.x, camera.y);

        // 8. Render Engine Particle System (cinematic bow & landing impacts)
        particleSystem.render(ctx, camera.x, camera.y);

        ctx.restore();
      }
    } catch (err) {
      console.warn('GameCanvas gameLoop exception:', err);
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
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gameKey, chapterId]);

  return (
    <div
      id="game-canvas-container"
      ref={containerRef}
      className="relative w-full h-full bg-neutral-950 overflow-hidden select-none cursor-crosshair"
    >
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="block w-full h-full"
      />
    </div>
  );
};
