// Tab-local cache survives client navigation, never reload.
const memory = new Map<string, string>();
const pending = new Set<string>();
const unavailable = new Set<string>();
let storageProblem = '';
let unconfirmedReset = false;
export function activityStorageNotice() {
  return storageProblem;
}
export function subscribeActivityStorage(listener: () => void) {
  window.addEventListener('firstday-storage-status', listener);
  return () => window.removeEventListener('firstday-storage-status', listener);
}
function warn(reason = 'Browser storage is unavailable.') {
  storageProblem =
    reason +
    ' Activity is temporary in this tab, may be lost on reload, and is not synchronized with other tabs.';
  window.dispatchEvent(new Event('firstday-storage-status'));
}
function recovered() {
  if (!pending.size && !unavailable.size && !unconfirmedReset) {
    storageProblem = '';
    window.dispatchEvent(new Event('firstday-storage-status'));
  }
}
export function readActivity(key: string): string | null {
  if (pending.has(key)) return memory.get(key) ?? null;
  try {
    const value = localStorage.getItem(key);
    unavailable.delete('read');
    if (value === null) memory.delete(key);
    else memory.set(key, value);
    return value;
  } catch {
    unavailable.add('read');
    warn();
    return memory.get(key) ?? null;
  }
}
export function writeActivity(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
    pending.delete(key);
    recovered();
  } catch {
    pending.add(key);
    warn();
  }
}
export function activityKeys() {
  try {
    const keys = Object.keys(localStorage);
    unavailable.delete('enumerate');
    return [...new Set([...keys, ...memory.keys()])];
  } catch {
    unavailable.add('enumerate');
    warn();
    return [...memory.keys()];
  }
}
export function invalidActivity(key: string) {
  memory.delete(key);
  pending.add(key);
  warn('Some saved activity is invalid and was ignored.');
}
// Browser-only reset boundary. Old generations remain unreadable even if cleanup races.
const MARKER = 'firstday.demo.reset-generation.v1';
export const LEGACY_GENERATION = 'legacy';
let temporaryGeneration: string | null = null;
let knownGeneration = LEGACY_GENERATION;
export function activityGeneration() {
  if (temporaryGeneration) return temporaryGeneration;
  try {
    const stored = localStorage.getItem(MARKER);
    unavailable.delete('generation');
    if (
      stored !== null &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        stored,
      )
    ) {
      pending.add(MARKER);
      warn('The saved reset marker is invalid and was ignored.');
      temporaryGeneration = crypto.randomUUID();
      return temporaryGeneration;
    }
    knownGeneration = stored || LEGACY_GENERATION;
  } catch {
    unavailable.add('generation');
    warn();
  }
  return knownGeneration;
}
export function generationIsCurrent(generation: string) {
  return activityGeneration() === generation;
}
export function activityKey(key: string, generation = activityGeneration()) {
  return generation === LEGACY_GENERATION
    ? key
    : 'firstday.demo.g.' +
        generation +
        '.' +
        key.slice('firstday.demo.'.length);
}
function clearHandoffs() {
  for (const key of Object.keys(sessionStorage)) {
    if (!key.startsWith('firstday.demo.')) continue;
    let generation: unknown;
    try {
      generation = JSON.parse(
        sessionStorage.getItem(key) || 'null',
      )?.generation;
    } catch {
      /* Invalid old handoffs can be discarded. */
    }
    // A delayed reset event must not erase an intentional new handoff.
    if (generation !== activityGeneration()) sessionStorage.removeItem(key);
  }
}
export function resetDemoActivity(): boolean {
  let previous = LEGACY_GENERATION;
  let confirmed = true;
  const next = crypto.randomUUID();
  try {
    previous = activityGeneration();
    // Publish the fence before any removal. Never remove the durable marker.
    localStorage.setItem(MARKER, next);
    temporaryGeneration = null;
    knownGeneration = next;
  } catch {
    temporaryGeneration = next;
    confirmed = false;
  }
  try {
    const prefix =
      previous === LEGACY_GENERATION
        ? 'firstday.demo.'
        : 'firstday.demo.g.' + previous + '.';
    for (const key of Object.keys(localStorage)) {
      if (key === MARKER || !key.startsWith(prefix)) continue;
      if (previous === LEGACY_GENERATION && key.startsWith('firstday.demo.g.'))
        continue;
      localStorage.removeItem(key);
    }
  } catch {
    confirmed = false;
  }
  try {
    clearHandoffs();
  } catch {
    confirmed = false;
  }
  memory.clear();
  pending.clear();
  if (confirmed) unavailable.clear();
  unconfirmedReset = !confirmed;
  if (confirmed) recovered();
  else
    warn(
      'Some browser data could not be removed; old activity may return on reload.',
    );
  window.dispatchEvent(new Event('firstday-demo-reset'));
  return confirmed;
}
export function subscribeDemoReset(listener: () => void) {
  function receive() {
    try {
      clearHandoffs();
    } catch {
      /* The generation also fences unreadable handoffs. */
    }
    listener();
  }
  function storage(event: StorageEvent) {
    if (event.key === MARKER) receive();
  }
  window.addEventListener('storage', storage);
  window.addEventListener('firstday-demo-reset', receive);
  return () => {
    window.removeEventListener('storage', storage);
    window.removeEventListener('firstday-demo-reset', receive);
  };
}
