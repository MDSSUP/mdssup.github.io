// Whether this device has a connection, and when it last had one.

import { useEffect, useState } from "react";

import { timeAgo } from "./format";

// Whether the device has a connection right now, kept up to date as it comes
// and goes.
export function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}

// The last moment this device is known to have had a connection, in words.
// Only reads it — trackLastOnline below does the writing, for the whole app.
export function useLastOnline(): string {
  const online = useOnline();
  if (online) return "now";

  const lastOnlineAt = readLastOnline();
  if (lastOnlineAt === null) return "unknown";
  return timeAgo(lastOnlineAt);
}

// Note the time whenever the connection is about to stop being "now": when it
// drops, and when the app is put away while still connected. Called once, from
// main.tsx, so it is recorded whichever screen is showing — not only while the
// Info screen is open to ask.
export function trackLastOnline(): void {
  const note = () => {
    if (navigator.onLine) writeLastOnline(Date.now());
  };

  note();
  // The "offline" event arrives once the connection has already gone, so
  // navigator.onLine is false by then; the moment itself is close enough.
  window.addEventListener("offline", () => writeLastOnline(Date.now()));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") note();
  });
}

// The browser keeps the moment under this name, so it survives the app being
// closed.
const LAST_ONLINE_KEY = "mblds-scanner.last-online";

// localStorage throws rather than returning nothing in private browsing, so
// both of these swallow errors, the same way members.ts does.
function readLastOnline(): number | null {
  try {
    const saved = localStorage.getItem(LAST_ONLINE_KEY);
    if (!saved) return null;
    const at = Number(saved);
    return Number.isFinite(at) ? at : null;
  } catch {
    return null;
  }
}

function writeLastOnline(at: number) {
  try {
    localStorage.setItem(LAST_ONLINE_KEY, String(at));
  } catch {
    // ignore
  }
}
