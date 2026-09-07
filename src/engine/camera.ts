/**
 * Smooth 2D Follow Camera with Damping, Screen Boundaries, and Screen Shake
 */
export class Camera2D {
  public x: number = 0;
  public y: number = 0;
  public rawX: number = 0;
  public rawY: number = 0;
  public targetX: number = 0;
  public targetY: number = 0;
  public viewportWidth: number = 1280;
  public viewportHeight: number = 720;
  public worldWidth: number = 4200;
  public worldHeight: number = 1000;
  private lerpFactor: number = 0.08;

  // Screen shake / trauma system (0.0 to 1.0)
  public trauma: number = 0;
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;
  private readonly maxShakeOffset: number = 22; // max pixel shake offset

  constructor(viewportWidth: number = 1280, viewportHeight: number = 720) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public resize(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Adds trauma (screen shake intensity) between 0 and 1.
   * e.g., 0.25 for landing, 0.4 for heavy boss strike or charged shot
   */
  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + Math.max(0, amount));
  }

  /**
   * Quick shake helper with intensity 0 to 1
   */
  public shake(intensity: number = 0.3) {
    this.addTrauma(intensity);
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
    this.rawX += (this.targetX - this.rawX) * factor;
    this.rawY += (this.targetY - this.rawY) * factor;

    // Update Screen Shake Trauma (trauma^2 produces natural decay)
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 1.5);
      const shakePower = this.trauma * this.trauma;
      this.shakeOffsetX = (Math.random() * 2 - 1) * this.maxShakeOffset * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * (this.maxShakeOffset * 0.75) * shakePower;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Camera actual viewport position includes shake
    this.x = this.rawX + this.shakeOffsetX;
    this.y = this.rawY + this.shakeOffsetY;
  }

  public snapTo(targetX: number, targetY: number) {
    this.rawX = targetX - this.viewportWidth * 0.5;
    this.rawY = targetY - this.viewportHeight * 0.58;
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewportHeight);
    this.rawX = Math.max(0, Math.min(this.rawX, maxX));
    this.rawY = Math.max(-150, Math.min(this.rawY, maxY));
    this.trauma = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
    this.x = this.rawX;
    this.y = this.rawY;
  }
}
