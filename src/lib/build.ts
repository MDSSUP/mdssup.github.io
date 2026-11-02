// What this copy of the app is: its version, the commit it was built from, when
// it was built, and the versions of the two tools that built it.
//
// The values come from the "define" setting in vite.config.ts

import { version as reactVersion } from "react";

export const build = {
  /** The "version" field from package.json. */
  version: __APP_VERSION__,
  /** Short commit hash, or "unknown" if the build had no .git folder. */
  commit: __BUILD_COMMIT__,
  /** When the build ran, as an ISO date string. */
  time: __BUILD_TIME__,
  /** The version of React inside the app, not the range package.json asks for. */
  react: reactVersion,
  vite: __VITE_VERSION__,
  /** The barcode reader — the part that actually reads the card. */
  zxing: __ZXING_VERSION__,
};
