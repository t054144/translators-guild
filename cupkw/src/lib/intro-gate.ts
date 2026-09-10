"use client";

import { useSyncExternalStore } from "react";

/**
 * While the opening sequence is on screen it owns the only WebGL context.
 *
 * The home page mounts a Stage in five separate sections. Running all of
 * them plus the intro's means six live contexts fighting for one GPU and
 * one main thread, which starves the sequence's own clock on a modest
 * device. Everything behind the overlay is hidden anyway, so it renders
 * the placeholder until the sequence hands over.
 */

let playing = false;
const listeners = new Set<() => void>();

export function setIntroPlaying(next: boolean) {
  if (playing === next) return;
  playing = next;
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useIntroPlaying() {
  return useSyncExternalStore(
    subscribe,
    () => playing,
    () => false // the server never has a sequence in flight
  );
}
