/**
 * How long a quote takes to type out on the display, in milliseconds.
 * Shared by the on-screen typewriter and the typing sound so they stay in sync.
 */
export function typingMs(length: number) {
  return Math.round(Math.min(2600, Math.max(1100, length * 24)));
}
