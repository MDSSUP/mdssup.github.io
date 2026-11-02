// The passcode. Three functions: has this device been unlocked, unlock it, lock
// it again.

import { PASSCODE_HASH } from "../config";

// The localStorage key used to remember that this device has been unlocked
const STORAGE_KEY = "mblds-scanner.unlocked-with";

// localStorage throws instead of returning nothing in private browsing, so both
// of these swallow errors. The secure-page check in App.tsx does not prevent
// that — it is about https, not storage. The cost is only that the device asks
// for the passcode again next time it is opened.
function remember(hash: string) {
  try {
    localStorage.setItem(STORAGE_KEY, hash);
  } catch {
    // ignore - see above
  }
}

function recall(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // ignore - see above
  }
}

// SHA-256 of some text, as the same lowercase hex string that sha256sum prints.
//
// Only works in a secure context (HTTPS or localhost)
async function sha256(text: string): Promise<string> {
  if (!crypto.subtle) {
    throw new Error("This page isn't secure, so the passcode can't be checked.");
  }
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Has this device already had the current passcode entered?
export function isUnlocked(): boolean {
  return recall() === PASSCODE_HASH;
}

// Try a passcode. Returns whether it was right and stores it if it is.
export async function unlock(passcode: string): Promise<boolean> {
  const hash = await sha256(passcode);
  if (hash !== PASSCODE_HASH) return false;
  remember(hash);
  return true;
}

// Forget the unlock, sending this device back to the passcode screen.
export function lock(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore - see the comment above remember()
  }
}
