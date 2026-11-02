// Settings you may need to change.

// Use an environment variable if it has been set to anything, otherwise the
// value written in this file.
function setting(fromEnvironment: string | undefined, written: string): string {
  return fromEnvironment?.trim() || written;
}

// The same, for a setting that is a number.
function numberSetting(
  fromEnvironment: string | undefined,
  written: number,
): number {
  const given = Number(fromEnvironment?.trim());
  return fromEnvironment && Number.isFinite(given) ? given : written;
}

// The shared passcode, stored as a SHA-256 hash.
//
// To change the passcode, generate the hash of the new one and paste it here.
// In a bash terminal:  echo -n "newpasscode" | sha256sum
// On a Mac:            echo -n "newpasscode" | shasum -a 256
// Without a terminal:  open https://gchq.github.io/CyberChef/ , search for the
//                      "SHA2" operation, set Size to 256 and leave Rounds at
//                      64, and type the passcode into Input with no Enter after
//                      it. It runs in the browser, so the passcode is never
//                      sent anywhere. Copy the long string from Output.
//                      To check the settings first: 1234 must give
//                      03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
// Everyone's device is locked automatically when this value changes.
export const PASSCODE_HASH = setting(
  import.meta.env.VITE_PASSCODE_HASH,
  "a169d1caf094697643fe308303487e81aa962a03bb533910c382e7093a9fac8b",
);

// How long the Scan button keeps looking at the camera before giving up.
export const SCAN_TIMEOUT_MS = numberSetting(
  import.meta.env.VITE_SCAN_TIMEOUT_MS,
  5_000,
);

// A student ID is an 8-digit number that does not start with zero.
//
// KEEP IN STEP WITH STUDENT_ID_PATTERN in apps-script/members.gs, which decides
// the same thing on the other side. If the two disagree, the app could start failing unpredictably
export const STUDENT_ID_PATTERN = new RegExp(
  setting(import.meta.env.VITE_STUDENT_ID_PATTERN, String.raw`^[1-9]\d{7}$`),
);

// Who to contact for the passcode or for technical trouble. It is shown in the
// middle of sentences ("Ask the IT manager."), so write it to read that way.
// A role rather than a person's name, so it doesn't go out of date when the
// committee changes; put a name or contact in here if that's more useful.
export const ADMIN_NAME = setting(
  import.meta.env.VITE_ADMIN_NAME,
  "the IT manager",
);

// Where the member list comes from: the .../exec address of the Apps Script.
//
// Unlike everything else here, the real value is NOT written in this file.
// Anything in this file is public and turns up in GitHub's code search, and
// this address leads straight to the member list. The published app gets it
// from the repository's Actions variable MEMBER_LIST_URL instead (Settings >
// Secrets and variables > Actions > Variables). On your own machine, set
// VITE_MEMBER_LIST_URL in .env.local.
//
// The value below is a placeholder that marks a build made without the
// address: the app reports it rather than trying to fetch it. The publish
// workflow checks the variable before building, so a published build should
// never contain it.
export const MEMBER_LIST_URL = setting(
  import.meta.env.VITE_MEMBER_LIST_URL,
  "MEMBER-LIST-URL-NOT-SET",
);

// How old the copy of the member list on this device can get before the app
// asks for a fresh one.
const DAYS = 24 * 60 * 60 * 1_000; // milliseconds in a day
export const MEMBER_LIST_MAX_AGE_MS = numberSetting(
  import.meta.env.VITE_MEMBER_LIST_MAX_AGE_MS,
  7 * DAYS,
);
