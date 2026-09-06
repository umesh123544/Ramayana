/**
 * Smooth 2D Follow Camera with Damping and Screen Boundaries
 */
export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public viewportWidth: number = 1280;
  public viewportHeight: number = 720;
  public worldWidth: number = 4200;
  public worldHeight: number = 1000;
  private lerpFactor: number = 0.08;

  constructor(viewportWidth: number = 1280, viewportHeight: number = 720) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public resize(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public follow(
    targetX: number,
    targetY: number,
    facing: 'left' | 'right',
    dt: number = 0.016
  ) {
    // Subtle lookahead based on hero facing direction
    const lookAhead = facing === 'right' ? 70 : -70;
    this.targetX = targetX + lookAhead - this.viewportWidth * 0.5;
    this.targetY = targetY - this.viewportHeight * 0.58;

    // Clamp targets within world bounds
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewportHeight);

    this.targetX = Math.max(0, Math.min(this.targetX, maxX));
    this.targetY = Math.max(-150, Math.min(this.targetY, maxY));

    // Smooth exponential decay interpolation (framerate independent)
    const factor = 1 - Math.exp(-this.lerpFactor * 60 * dt);
    this.x += (this.targetX - this.x) * factor;
    this.y += (this.targetY - this.y) * factor;
  }

  public snapTo(targetX: number, targetY: number) {
    this.x = targetX - this.viewportWidth * 0.5;
    this.y = targetY - this.viewportHeight * 0.58;
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewportHeight);
    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(-150, Math.min(this.y, maxY));
  }
}
