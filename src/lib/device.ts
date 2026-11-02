// What this app asks of the device it is running on

// Whether the app was opened from its home-screen icon rather than in a
// browser tab. Older iPhones only answer the second question.
export function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

// Whether "Continue in the browser" has been pressed on the install screen.
// Kept for this tab only, so a reload doesn't ask again but the next visit
// does. sessionStorage throws in some private-browsing modes, as localStorage
// does; the cost is only being asked again.
const BROWSER_CHOSEN_KEY = "mblds-scanner.continue-in-browser";

export function choseBrowser(): boolean {
  try {
    return sessionStorage.getItem(BROWSER_CHOSEN_KEY) === "yes";
  } catch {
    return false;
  }
}

export function chooseBrowser(): void {
  try {
    sessionStorage.setItem(BROWSER_CHOSEN_KEY, "yes");
  } catch {
    // ignore - see above
  }
}

export async function requestPersistence(): Promise<void> {
  try {
    // Asking again when it has already been granted achieves nothing, and browsers dislike repeated requests, so check first.
    if (await navigator.storage?.persisted()) return;
    await navigator.storage?.persist();
  } catch (error) {
    // Older browsers have none of this, and it is not worth stopping over —
    // the app works either way, it is just more easily evicted.
    console.warn("Could not ask for the saved data to be kept", error);
  }
}

// Clear everything the app has saved on this device: the passcode unlock, the
// copy of the member list, and the offline copy of the app itself.
//
// Essentially turning it off and on again
export async function resetApp(): Promise<void> {
  try {
    const workers = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(workers.map((worker) => worker.unregister()));
  } catch (error) {
    console.error("Could not remove the offline copy of the app", error);
  }
  try {
    const saved = await caches.keys();
    await Promise.all(saved.map((name) => caches.delete(name)));
  } catch (error) {
    console.error("Could not clear the saved files", error);
  }
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Could not clear the saved settings", error);
  }
  window.location.reload();
}
