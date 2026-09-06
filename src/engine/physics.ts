import { BoundingBox, Platform } from '../types';

export const GRAVITY = 1400; // px/s^2
export const TERMINAL_VELOCITY = 850;

/**
 * Checks axis-aligned bounding box collision
 */
export function checkAABB(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Point in box check
 */
export function isPointInBox(px: number, py: number, box: BoundingBox): boolean {
  return px >= box.x && px <= box.x + box.width && py >= box.y && py <= box.y + box.height;
}

/**
 * Line of sight check between two points, ensuring no solid platforms intersect
 */
export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  platforms: Platform[]
): boolean {
  for (const plat of platforms) {
    if (plat.isOneWay) continue; // One-way platforms don't block sight
    if (lineIntersectsBox(x1, y1, x2, y2, plat)) {
      return false;
    }
  }
  return true;
}

function lineIntersectsBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  box: BoundingBox
): boolean {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  // Fast bounding check
  if (maxX < box.x || minX > box.x + box.width || maxY < box.y || minY > box.y + box.height) {
    return false;
  }

  // Check 4 segments of the box
  const bL = box.x;
  const bR = box.x + box.width;
  const bT = box.y;
  const bB = box.y + box.height;

  return (
    lineIntersectsLine(x1, y1, x2, y2, bL, bT, bR, bT) ||
    lineIntersectsLine(x1, y1, x2, y2, bR, bT, bR, bB) ||
    lineIntersectsLine(x1, y1, x2, y2, bR, bB, bL, bB) ||
    lineIntersectsLine(x1, y1, x2, y2, bL, bB, bL, bT)
  );
}

function lineIntersectsLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): boolean {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom === 0) return false;

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * Resolves vertical platform collisions with landing check
 */
export function resolvePlatformCollision(
  entity: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    isGrounded: boolean;
  },
  prevY: number,
  platforms: Platform[]
): { landed: boolean } {
  let landed = false;
  entity.isGrounded = false;

  const footX = entity.x + entity.width * 0.5;
  const footY = entity.y + entity.height;
  const prevFootY = prevY + entity.height;

  for (const plat of platforms) {
    // Check horizontal overlap with a slight margin
    const horizontalOverlap =
      entity.x + entity.width * 0.8 > plat.x &&
      entity.x + entity.width * 0.2 < plat.x + plat.width;

    if (!horizontalOverlap) continue;

    // Moving downwards and crossing platform top
    if (entity.vy >= 0 && prevFootY <= plat.y + 10 && footY >= plat.y) {
      entity.y = plat.y - entity.height;
      entity.vy = 0;
      entity.isGrounded = true;
      landed = true;
      break;
    }

    // Solid platform horizontal or head bonk
    if (!plat.isOneWay) {
      // Head bonk
      if (
        entity.vy < 0 &&
        entity.y <= plat.y + plat.height &&
        prevY >= plat.y + plat.height - 10
      ) {
        entity.y = plat.y + plat.height;
        entity.vy = 0;
      }
    }
  }

  return { landed };
}
