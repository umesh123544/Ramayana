import { Platform } from '../types';

export const INITIAL_PLATFORMS: Platform[] = [
  // 1. Starting Ground (Ashram & Forest edge)
  { id: 'g1', x: 0, y: 672, width: 2250, height: 200, type: 'ground' },

  // 2. Ancient Wooden Bridge over the Sacred River (x: 2250 to 2800)
  { id: 'wb1', x: 2250, y: 660, width: 550, height: 18, type: 'wood_bridge' },

  // 3. Across River Ground (leads toward mountain cave)
  { id: 'g2', x: 2800, y: 672, width: 1400, height: 200, type: 'ground' },

  // 4. Floating & Elevated Stone Platforms
  // First elevated stone tier
  { id: 'sp1', x: 420, y: 540, width: 160, height: 22, type: 'stone' },
  { id: 'sp2', x: 680, y: 440, width: 180, height: 22, type: 'stone' },

  // Archer Demon roost ledge
  { id: 'sp3', x: 1020, y: 530, width: 220, height: 24, type: 'stone' },

  // Temple Approach Stone Steps & Platform
  { id: 'sp4', x: 1450, y: 550, width: 380, height: 26, type: 'stone' },
  { id: 'sp5', x: 1560, y: 430, width: 160, height: 22, type: 'floating_ledge' },

  // River Crossing Higher Floating Ledge (alternative high route)
  { id: 'sp6', x: 2380, y: 510, width: 140, height: 20, type: 'floating_ledge' },
  { id: 'sp7', x: 2620, y: 430, width: 140, height: 20, type: 'floating_ledge' },

  // Eastern Mountain Outpost Platforms
  { id: 'sp8', x: 3100, y: 530, width: 240, height: 24, type: 'stone' },
  { id: 'sp9', x: 3500, y: 460, width: 200, height: 22, type: 'stone' },
];
