// Simulated loading time (ms), so people trying the prototype see that a change is coming.
// The engine is instant; the delay lives only in the UI. Every loading state lasts 3 seconds.
const THREE_SECONDS = 3000;

export const LOADING_MS = {
  login: THREE_SECONDS,
  page: THREE_SECONDS,
  generate: THREE_SECONDS,
  day: THREE_SECONDS,
  replan: THREE_SECONDS,
  blocked: THREE_SECONDS,
  undo: THREE_SECONDS,
  reset: THREE_SECONDS,
  publish: THREE_SECONDS,
  details: THREE_SECONDS,
};
