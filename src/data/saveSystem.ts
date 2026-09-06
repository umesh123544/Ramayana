import {
  GameSaveData,
  INITIAL_CHAPTERS,
  INITIAL_LEVELS,
  INITIAL_ACHIEVEMENTS,
  DEFAULT_SETTINGS,
  DEFAULT_PROGRESSION,
  Difficulty,
  Chapter,
  Level,
  Achievement,
  SettingsData,
  PlayerProgression,
} from './gameData';

const SAVE_KEY_PREFIX = 'ramayan_epic_save_';
const ACTIVE_SAVE_KEY = 'ramayan_active_save_slot';
const MAX_UNLOCKED_CHAPTER_KEY = 'ramayan_max_unlocked_chapter';

class SaveSystem {
  public activeSlot: string = 'autosave';

  public getMaxUnlockedChapter(): number {
    try {
      const raw = localStorage.getItem(MAX_UNLOCKED_CHAPTER_KEY);
      if (raw) {
        const val = parseInt(raw, 10);
        if (!isNaN(val) && val >= 1 && val <= 10) {
          return val;
        }
      }
    } catch {
      // ignore
    }
    return 1; // Default: Only Chapter 1 is unlocked initially!
  }

  public setMaxUnlockedChapter(maxChapter: number): void {
    try {
      const current = this.getMaxUnlockedChapter();
      const clamped = Math.min(10, Math.max(current, maxChapter));
      localStorage.setItem(MAX_UNLOCKED_CHAPTER_KEY, String(clamped));
    } catch {
      // ignore
    }
  }

  public isChapterUnlocked(chapterId: number): boolean {
    if (chapterId <= 1) return true;
    return chapterId <= this.getMaxUnlockedChapter();
  }

  public createNewGame(difficulty: Difficulty = 'NORMAL', slotId: string = 'slot_1'): GameSaveData {
    const newSave: GameSaveData = {
      version: '1.0.0',
      slotId,
      savedAt: new Date().toISOString(),
      currentChapterId: 1,
      currentLevelId: 'c1-l1',
      difficulty,
      progression: { ...DEFAULT_PROGRESSION },
      lives: 3,
      heroHp: 100,
      chapters: JSON.parse(JSON.stringify(INITIAL_CHAPTERS)),
      levels: JSON.parse(JSON.stringify(INITIAL_LEVELS)),
      achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
      settings: { ...DEFAULT_SETTINGS, gameplay: { ...DEFAULT_SETTINGS.gameplay, difficulty } },
    };

    this.saveGame(newSave, slotId);
    this.saveGame(newSave, 'autosave');
    this.setActiveSlot(slotId);
    return newSave;
  }

  public saveGame(data: GameSaveData, slotId: string = data.slotId): boolean {
    try {
      data.savedAt = new Date().toISOString();
      data.slotId = slotId;
      localStorage.setItem(`${SAVE_KEY_PREFIX}${slotId}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game data:', e);
      return false;
    }
  }

  public loadGame(slotId: string = 'autosave'): GameSaveData | null {
    try {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
      if (!raw) return null;
      const data = JSON.parse(raw) as GameSaveData;
      return data;
    } catch (e) {
      console.error('Failed to load game data:', e);
      return null;
    }
  }

  public hasSavedGame(): boolean {
    const slots = ['autosave', 'slot_1', 'slot_2', 'slot_3'];
    return slots.some((s) => !!localStorage.getItem(`${SAVE_KEY_PREFIX}${s}`));
  }

  public getSavedSlots(): { id: string; name: string; data: GameSaveData | null }[] {
    const slots = [
      { id: 'autosave', name: 'Auto-Save' },
      { id: 'slot_1', name: 'Save Slot 1' },
      { id: 'slot_2', name: 'Save Slot 2' },
      { id: 'slot_3', name: 'Save Slot 3' },
    ];
    return slots.map((s) => ({
      ...s,
      data: this.loadGame(s.id),
    }));
  }

  public deleteSlot(slotId: string): boolean {
    try {
      localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
      return true;
    } catch {
      return false;
    }
  }

  public setActiveSlot(slotId: string) {
    this.activeSlot = slotId;
    localStorage.setItem(ACTIVE_SAVE_KEY, slotId);
  }

  public getActiveSlot(): string {
    return localStorage.getItem(ACTIVE_SAVE_KEY) || 'autosave';
  }

  public getLatestSave(): GameSaveData | null {
    const active = this.getActiveSlot();
    const activeData = this.loadGame(active);
    if (activeData) return activeData;

    // Check fallback slots
    const slots = ['autosave', 'slot_1', 'slot_2', 'slot_3'];
    for (const s of slots) {
      const d = this.loadGame(s);
      if (d) return d;
    }
    return null;
  }

  // Helper to mark level complete and unlock next
  public completeLevel(
    save: GameSaveData,
    chapterId: number,
    levelId: string,
    score: number,
    stars: number,
    collectiblesCollected: number
  ): GameSaveData {
    const chapterLevels = save.levels[chapterId];
    if (chapterLevels) {
      const currentLvlIndex = chapterLevels.findIndex((l) => l.id === levelId);
      if (currentLvlIndex !== -1) {
        const lvl = chapterLevels[currentLvlIndex];
        lvl.isCompleted = true;
        lvl.bestScore = Math.max(lvl.bestScore, score);
        lvl.stars = Math.max(lvl.stars, stars);
        lvl.collectiblesFound = Math.max(lvl.collectiblesFound, collectiblesCollected);
        lvl.completionPercent = 100;

        // Unlock next level in chapter if available
        if (currentLvlIndex + 1 < chapterLevels.length) {
          chapterLevels[currentLvlIndex + 1].isUnlocked = true;
        } else {
          // Chapter complete! Unlock next chapter
          const ch = save.chapters.find((c) => c.id === chapterId);
          if (ch) {
            ch.completedLevels = chapterLevels.filter((l) => l.isCompleted).length;
          }
          const nextCh = save.chapters.find((c) => c.id === chapterId + 1);
          if (nextCh) {
            nextCh.isUnlocked = true;
            if (save.levels[nextCh.id] && save.levels[nextCh.id].length > 0) {
              save.levels[nextCh.id][0].isUnlocked = true;
            }
          }
        }
      }
    }

    this.saveGame(save);
    return save;
  }

  // Unlock next chapter directly upon boss defeat
  public unlockNextChapter(completedChapterId: number): GameSaveData {
    this.setMaxUnlockedChapter(completedChapterId + 1);
    let save = this.getLatestSave();
    if (!save) {
      save = this.createNewGame('NORMAL', 'autosave');
    }
    this.setMaxUnlockedChapter(completedChapterId + 1);
    const currentCh = save.chapters.find((c) => c.id === completedChapterId);
    if (currentCh) {
      currentCh.completedLevels = currentCh.totalLevels;
    }
    const nextCh = save.chapters.find((c) => c.id === completedChapterId + 1);
    if (nextCh) {
      nextCh.isUnlocked = true;
      if (save.levels[nextCh.id] && save.levels[nextCh.id].length > 0) {
        save.levels[nextCh.id][0].isUnlocked = true;
      }
    }
    this.saveGame(save);
    return save;
  }

  // Unlock achievement
  public unlockAchievement(save: GameSaveData, achId: string): boolean {
    const ach = save.achievements.find((a) => a.id === achId);
    if (ach && !ach.isUnlocked) {
      ach.isUnlocked = true;
      ach.unlockedAt = new Date().toISOString();
      this.saveGame(save);
      return true;
    }
    return false;
  }
}

export const saveSystem = new SaveSystem();
