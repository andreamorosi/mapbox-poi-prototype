const STORAGE_KEY = 'milan-pois';

export function loadPOIs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function savePOIs(pois) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pois));
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
