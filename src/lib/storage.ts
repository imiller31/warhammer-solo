import type { GameState } from '../types';

const SAVE_KEY = 'wh40k-solo-save';

/**
 * Type guard that validates the shape of data loaded from localStorage
 * matches the GameState interface. Checks critical fields only —
 * a full deep validation would be overkill for a client-only app.
 */
export function isValidGameState(data: unknown): data is GameState {
  if (data === null || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  // Check critical primitive fields
  if (typeof obj['turn'] !== 'number') return false;
  if (typeof obj['battleRound'] !== 'number') return false;
  if (typeof obj['phase'] !== 'string') return false;
  if (typeof obj['turnSide'] !== 'string') return false;
  if (typeof obj['gameOver'] !== 'boolean') return false;
  if (typeof obj['playerVP'] !== 'number') return false;
  if (typeof obj['aiVP'] !== 'number') return false;
  if (typeof obj['playerCP'] !== 'number') return false;
  if (typeof obj['aiCP'] !== 'number') return false;

  // Check arrays exist
  if (!Array.isArray(obj['playerUnits'])) return false;
  if (!Array.isArray(obj['aiUnits'])) return false;
  if (!Array.isArray(obj['turnLog'])) return false;

  // Check faction objects
  if (typeof obj['playerFaction'] !== 'object' || obj['playerFaction'] === null) return false;
  if (typeof obj['aiFaction'] !== 'object' || obj['aiFaction'] === null) return false;

  // Check mission object
  if (typeof obj['mission'] !== 'object' || obj['mission'] === null) return false;

  return true;
}

/** Load a saved game from localStorage, validating its shape. */
export function loadSavedGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isValidGameState(parsed)) {
      return parsed;
    }
    // Invalid shape — clear corrupt save
    localStorage.removeItem(SAVE_KEY);
    return null;
  } catch {
    return null;
  }
}

/** Save game state to localStorage. */
export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch { /* ignore quota errors */ }
}

/** Clear saved game from localStorage. */
export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
