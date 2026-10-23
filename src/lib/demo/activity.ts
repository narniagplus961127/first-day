// Browser-only reset boundary. Old generations remain unreadable even if cleanup races.
const MARKER = 'firstday.demo.reset-generation.v1';
export const LEGACY_GENERATION = 'legacy';
let temporaryGeneration: string | null = null;
let knownGeneration = LEGACY_GENERATION;
export function activityGeneration() {
  if (temporaryGeneration) return temporaryGeneration;
  try {
    knownGeneration = localStorage.getItem(MARKER) || LEGACY_GENERATION;
  } catch {
    /* Domain reads/writes report the storage failure; tokens remain usable in this tab. */
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
