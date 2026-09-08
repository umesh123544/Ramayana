import { Platform } from '../types';

export const INITIAL_PLATFORMS: Platform[] = [
  // 1. Starting Ground (Ashram & Forest edge)
  { id: 'g1', x: 0, y: 672, width: 2250, height: 200, type: 'ground' },

  // 2. Ancient Wooden Bridge over the Sacred River (x: 2250 to 2800)
  { id: 'wb1', x: 2250, y: 660, width: 550, height: 18, type: 'wood_bridge' },

  // 3. Across River Ground (leads toward mountain cave)
  { id: 'g2', x: 2800, y: 672, width: 900, height: 200, type: 'ground' },

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

  // ==========================================
  // 5. ROCKY TUNNEL - low cave passage carved into the mountainside
  // (x: 3700 to 4450). Ground continues below a jagged rock ceiling,
  // forcing careful jump timing under the stalactites.
  // ==========================================
  { id: 'g3', x: 3700, y: 672, width: 750, height: 200, type: 'ground' },
  { id: 'cc1', x: 3760, y: 470, width: 620, height: 90, type: 'cave_ceiling' },

  // 6. Tunnel Exit Ledges climbing back into daylight
  { id: 'sp10', x: 4470, y: 560, width: 160, height: 22, type: 'stone' },
  { id: 'sp11', x: 4700, y: 470, width: 160, height: 22, type: 'floating_ledge' },

  // ==========================================
  // 7. FAR OUTPOST - a new stretch of ground beyond the tunnel
  // (x: 4470 to 5900) with a two-tier watchtower approach.
  // ==========================================
  { id: 'g4', x: 4470, y: 672, width: 1430, height: 200, type: 'ground' },
  { id: 'sp12', x: 4950, y: 550, width: 220, height: 24, type: 'stone' },
  { id: 'sp13', x: 5250, y: 430, width: 180, height: 22, type: 'floating_ledge' },
  { id: 'sp14', x: 5550, y: 530, width: 260, height: 26, type: 'stone' },
];

