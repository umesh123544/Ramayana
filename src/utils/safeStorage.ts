/**
 * Safe local storage utility with in-memory fallback.
 * Prevents fatal SecurityError / DOMException crashes in mobile incognito modes,
 * restricted WebViews, or environments where localStorage access is blocked.
 */

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__ramayan_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fall back to memoryStore
      }
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): boolean {
    if (hasLocalStorage) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        // Fall back to memoryStore
      }
    }
    memoryStore[key] = value;
    return true;
  },

  removeItem(key: string): boolean {
    if (hasLocalStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fall back to memoryStore
      }
    }
    delete memoryStore[key];
    return true;
  },

  hasKey(key: string): boolean {
    if (hasLocalStorage) {
      try {
        return window.localStorage.getItem(key) !== null;
      } catch {
        // Fall back to memoryStore
      }
    }
    return key in memoryStore;
  },
};
