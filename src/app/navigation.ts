// Which screens there are, how they relate, and how a screen asks to open
// another one.

import { createContext, useContext } from "react";

// Help is not one of these. It can be opened from almost anywhere, so it has no
// one place for Back to go — see openHelp below.
export type Screen = "scan" | "settings" | "log" | "info" | "members";

// Where Back goes from each screen.
export const PARENT: Record<Screen, Screen> = {
  scan: "scan",
  settings: "scan",
  log: "scan",
  info: "settings",
  members: "settings",
};

export type Navigation = {
  // Open a screen.
  go: (screen: Screen) => void;
  // Go back up, to whichever screen this one hangs off in PARENT above. A
  // screen does not need to know where that is.
  back: () => void;
  // Open the help page in place of whatever is showing, and come back to it on
  // Close. `topic` is the page to open at, written the way links in the help
  // pages are — "scanner/troubleshooting". Leave it out for the list of topics.
  openHelp: (topic?: string) => void;
};

// The default does nothing, which is what a screen drawn outside the app's
// shell gets — the passcode screen, and the error screen. Neither has anywhere
// to navigate to.
const NavigationContext = createContext<Navigation>({
  go: () => {},
  back: () => {},
  openHelp: () => {},
});

export default NavigationContext;

export function useNavigation(): Navigation {
  return useContext(NavigationContext);
}
