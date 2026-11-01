import { Player, Obstacle, Collectible } from './types';

export interface CollisionResult {
  hit: boolean;
  nearMiss: boolean;
}

export const collision = {
  // Check collision between player and obstacle with fairness padding
  checkObstacle(player: Player, obstacle: Obstacle): CollisionResult {
    // Forgiving player hitbox: shrink bounding box by 4px on each side
    const pMargin = 4;
    const px = player.x + pMargin;
    const py = player.y + pMargin;
    const pw = player.width - pMargin * 2;
    const ph = player.height - pMargin * 2;

    // Near miss detection boundary: 22px buffer around obstacle
    const nearMargin = 22;

    let hit = false;
    let nearMiss = false;

    if (obstacle.type === 'GROUND_SPIKE' || obstacle.type === 'DOUBLE_SPIKE') {
      // Base bounding box check
      const inX = px < obstacle.x + obstacle.width && px + pw > obstacle.x;
      const inY = py + ph > obstacle.y;

      if (inX && inY) {
        // Triangle slope calculation: apex at (obstacle.x + obstacle.width/2, obstacle.y)
        // bottom at obstacle.y + obstacle.height
        const playerCenterX = px + pw / 2;
        const playerBottom = py + ph;

        // If player is well inside the horizontal span
        const relX = Math.abs(playerCenterX - (obstacle.x + obstacle.width / 2));
        const halfWidth = obstacle.width / 2;
        const normalizedX = Math.min(1, relX / halfWidth);

        // Slope height at player position
        const spikeTopAtX = obstacle.y + normalizedX * obstacle.height;

        if (playerBottom > spikeTopAtX + 4) {
          hit = true;
        }
      }

      // Check near miss if not hit and not previously awarded
      if (!hit && !obstacle.nearMissAwarded) {
        const nearX = px < obstacle.x + obstacle.width + nearMargin && px + pw > obstacle.x - nearMargin;
        const nearY = py + ph > obstacle.y - nearMargin && py < obstacle.y + obstacle.height + nearMargin;
        if (nearX && nearY) {
          nearMiss = true;
        }
      }
    } else if (obstacle.type === 'CEILING_HAZARD') {
      // Hanging pylon / laser from top
      const inX = px < obstacle.x + obstacle.width && px + pw > obstacle.x;
      const inY = py < obstacle.y + obstacle.height;

      if (inX && inY) {
        hit = true;
      }

      if (!hit && !obstacle.nearMissAwarded) {
        const nearX = px < obstacle.x + obstacle.width + nearMargin && px + pw > obstacle.x - nearMargin;
        const nearY = py < obstacle.y + obstacle.height + nearMargin && py + ph > obstacle.y - nearMargin;
        if (nearX && nearY) {
          nearMiss = true;
        }
      }
    } else if (obstacle.type === 'FLOATING_PULSE') {
      // Diamond / mid-air obstacle
      const ox = obstacle.x + obstacle.width / 2;
      const oy = obstacle.y + obstacle.height / 2;
      const radius = obstacle.width * 0.45;

      const pxCenter = px + pw / 2;
      const pyCenter = py + ph / 2;

      const dx = pxCenter - ox;
      const dy = pyCenter - oy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius + pw * 0.4) {
        hit = true;
      } else if (!obstacle.nearMissAwarded && dist < radius + pw * 0.4 + nearMargin) {
        nearMiss = true;
      }
    } else if (obstacle.type === 'GATE_PORTAL') {
      // Gap portal: safe zone is gapY to gapY + gapHeight
      const gapY = obstacle.gapY ?? obstacle.y + 120;
      const gapHeight = obstacle.gapHeight ?? 130;

      const inX = px < obstacle.x + obstacle.width && px + pw > obstacle.x;
      if (inX) {
        // Collides if player top is above gap or player bottom is below gap
        if (py < gapY || py + ph > gapY + gapHeight) {
          hit = true;
        }
      }

      if (!hit && !obstacle.nearMissAwarded) {
        const nearX = px < obstacle.x + obstacle.width + nearMargin && px + pw > obstacle.x - nearMargin;
        if (nearX) {
          // Near miss if narrowly clearing the top edge or bottom edge of the gap
          const nearTop = Math.abs(py - gapY) < nearMargin;
          const nearBottom = Math.abs((py + ph) - (gapY + gapHeight)) < nearMargin;
          if (nearTop || nearBottom) {
            nearMiss = true;
          }
        }
      }
    }

    return { hit, nearMiss };
  },

  // Check collectible pickup with slight magnetic attract zone
  checkCollectible(player: Player, collectible: Collectible): { collected: boolean; attract: boolean; angle: number } {
    const pcx = player.x + player.width / 2;
    const pcy = player.y + player.height / 2;

    const dx = pcx - collectible.x;
    const dy = pcy - collectible.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const hitRadius = collectible.radius + player.width * 0.45;
    const attractRadius = hitRadius + 45; // Subtle magnetic suction toward player

    return {
      collected: dist < hitRadius,
      attract: dist < attractRadius,
      angle: Math.atan2(dy, dx),
    };
  },
};
