// The member list: where it comes from, how a copy is kept on the device, and
// how a scanned student ID is looked up in it.

import { MEMBER_LIST_MAX_AGE_MS, MEMBER_LIST_URL } from "../config";
import { AppError } from "./errors";

// One person from the member sheet.
export type Member = {
  studentId: string;
  name: string;
  membership: string;
  paid: boolean | null; // null means "unclear" rather than "no"
  // What the Paid column actually said, shown when `paid` is null.
  paidRaw: string;
};

// One thing worth mentioning about the sheet, worked out by the script.
//
// `message` is what happened, and is always shown. `hint` is what to do or
// think about it — advice, not a demand. `examples` are a sample of the 
// actual problematic values from the sheet
export type Concern = {
  message: string;
  hint?: string;
  examples?: string[];
};

// What gets written to the device: the people, when they were downloaded, which
// sheet they came out of, and anything about that sheet worth mentioning.
type StoredList = {
  version: typeof STORED_VERSION;
  members: Member[];
  fetchedAt: number;
  sheetName: string;
  concerns: Concern[];
};

const STORED_VERSION = 3;

// The same list once it is in use, with a lookup table built from it and a note
// of whether this copy came off the network or out of the device's memory.
export type MemberList = StoredList & {
  source: "network" | "device";
  byStudentId: Map<string, Member>;
  // Things the app noticed about this device while getting the list — not
  // things the member sheet said.
  deviceNotes: Concern[];
};

// Build the lookup table. Every list goes through here, whether it came off the
// network or off the device, so neither path can forget to.
function asMemberList(
  stored: StoredList,
  source: "network" | "device",
  deviceNotes: Concern[] = [],
): MemberList {
  return {
    ...stored,
    source,
    deviceNotes,
    byStudentId: new Map(
      stored.members.map((member) => [member.studentId, member]),
    ),
  };
}

// ---------------------------------------------------------------------------
// The copy on the device
// ---------------------------------------------------------------------------

// The browser keeps the last downloaded list under this name, so the app still
// works at an event with no signal.
const STORAGE_KEY = "mblds-scanner.member-list";

// Keep a copy for next time.
function saveToDevice(stored: StoredList): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    return true;
  } catch (error_) {
    console.warn("Could not keep a copy of the member list", error_);
    return false;
  }
}

function readFromDevice(): StoredList | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const stored = JSON.parse(saved) as StoredList;
    // A copy saved by an older build may not be compatible with the current build
    if (stored.version !== STORED_VERSION) {
      console.warn(
        `Ignoring a member list saved by an older version of the app ` +
          `(found ${String(stored.version)}, expected ${STORED_VERSION}). ` +
          `It will need downloading again.`,
      );
      return null;
    }
    if (!Array.isArray(stored.members)) return null;
    return stored;
  } catch (error_) {
    console.warn("The saved member list could not be read", error_);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

// What the service sends back, before any of it has been looked at.
type Reply = {
  sheetName?: unknown;
  members?: unknown;
  concerns?: unknown;
  error?: unknown;
};

// Everything that can go wrong fetching the list is thrown as an AppError
// naming the member-list help page
function listerror_(message: string): AppError {
  return new AppError(message, { help: "google-sheets/troubleshooting" });
}

// Is this one entry a person, in full?
function isMember(entry: unknown): entry is Member {
  if (typeof entry !== "object" || entry === null) return false;
  const person = entry as Partial<Member>;
  return (
    typeof person.studentId === "string" &&
    person.studentId !== "" &&
    typeof person.name === "string" &&
    typeof person.membership === "string" &&
    typeof person.paidRaw === "string" &&
    (typeof person.paid === "boolean" || person.paid === null)
  );
}

// Is this one note about the sheet the shape the contract describes?
function isConcern(entry: unknown): entry is Concern {
  if (typeof entry !== "object" || entry === null) return false;
  const note = entry as Partial<Concern>;
  return (
    typeof note.message === "string" &&
    (note.hint === undefined || typeof note.hint === "string") &&
    (note.examples === undefined ||
      (Array.isArray(note.examples) &&
        note.examples.every((example) => typeof example === "string")))
  );
}

// The same complaint however the reply is wrong, because the cause is always
// the same one and there is only one thing to do about it.
function outOfStep(part: string): AppError {
  return listerror_(
    `The member list service sent ${part} in a form this app doesn't ` +
      "recognise, so none of it has been used. The service and the app are " +
      "most likely out of step — check that the script has not been " +
      "redeployed without the app being rebuilt, and that the MEMBER_LIST_URL " +
      "variable the app was built with points at the current version.",
  );
}

async function download(): Promise<StoredList> {
  // Catches the placeholder in config.ts, which means the app was built
  // without the address, as well as anything else that isn't an address.
  if (!MEMBER_LIST_URL.startsWith("https://")) {
    throw listerror_(
      "This copy of the app was built without the member list's address. Set " +
        "the MEMBER_LIST_URL Actions variable and publish again, or for " +
        "development set VITE_MEMBER_LIST_URL in .env.local. See config.ts.",
    );
  }

  let reply: Reply;
  try {
    // The script's address redirects once before answering, which fetch
    // follows on its own.
    const response = await fetch(MEMBER_LIST_URL, { redirect: "follow" });
    if (!response.ok) {
      throw listerror_(
        `The member list service answered with an error (${response.status}).`,
      );
    }
    reply = (await response.json()) as Reply;
  } catch (error_) {
    if (error_ instanceof AppError) throw error_;
    // No connection and unreadable contents look the same from here, and mean
    // much the same thing to somebody standing at a door.
    throw listerror_(
      "Could not reach the member list. Check the connection, and that the " +
        "MEMBER_LIST_URL variable the app was built with is still right.",
    );
  }

  // The script's own complaints arrive here: no sheet set, a missing column,
  // the wrong file. They are written to be read by whoever is holding the
  // phone, so they are passed along unchanged.
  if (typeof reply.error === "string" && reply.error !== "") {
    throw listerror_(reply.error);
  }

  // The gate. Either the reply is what the contract describes and it is used
  // exactly as it arrived, or it is refused.
  const { members, sheetName } = reply;

  if (!Array.isArray(members) || !members.every(isMember)) {
    throw outOfStep("the list of people");
  }
  if (typeof sheetName !== "string" || sheetName === "") {
    throw outOfStep("the sheet's name");
  }

  return {
    version: STORED_VERSION,
    members,
    fetchedAt: Date.now(),
    sheetName,
    concerns: notesAbout(reply.concerns),
  };
}

function notesAbout(concerns: unknown): Concern[] {
  if (Array.isArray(concerns) && concerns.every(isConcern)) return concerns;
  console.warn("The member list service sent notes in an unexpected shape");
  return [];
}

// ---------------------------------------------------------------------------
// What the rest of the app uses
// ---------------------------------------------------------------------------

// The copy on the device, if there is one.
export function loadSavedMembers(): MemberList | null {
  const stored = readFromDevice();
  return stored ? asMemberList(stored, "device") : null;
}

// Download the list again.
export async function refreshMembers(): Promise<MemberList> {
  const stored = await download();

  const deviceNotes: Concern[] = [];
  if (!saveToDevice(stored)) {
    deviceNotes.push({
      message:
        "The member list could not be saved on this device, so it will be " +
        "gone when the app is closed.",
      hint:
        "Usually the device is out of room. Scanning works normally until " +
        "then. Freeing some space and refreshing again will keep it.",
    });
  }

  return asMemberList(stored, "network", deviceNotes);
}

// Where a download of the member list is up to.
export type Refresh =
  | { status: "idle" }
  | { status: "working" }
  | { status: "failed"; error: AppError };

// Whether the copy on the device is old enough to be worth asking about.
export function isStale(list: MemberList): boolean {
  return Date.now() - list.fetchedAt > MEMBER_LIST_MAX_AGE_MS;
}

// What the member list had to say about one scan.
export type Lookup =
  | { on: "no-list" }
  | { on: "not-listed" }
  | { on: "listed"; member: Member };

// Look a scanned ID up.
export function lookUp(list: MemberList | null, studentId: string): Lookup {
  if (list === null) return { on: "no-list" };
  const member = list.byStudentId.get(studentId);
  return member ? { on: "listed", member } : { on: "not-listed" };
}
