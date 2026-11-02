// What a scan came to, and how to say so on screen. The member list itself —
// fetching it, keeping it, looking an ID up in it — is in members.ts; this is
// the wording put on top of that.

import type { Lookup, Member } from "./members";

// One scan, as the log remembers it: the number that was read, what the member
// list said about it, and when.
export type ScanLogEntry = {
  studentId: string;
  lookup: Lookup;
  at: number;
};

// What to tell somebody about a scan
export type Verdict = {
  tone: "paid" | "caution" | "refused";
  words: string;
  detail?: string;
};

// What the list says about somebody it does have.
export function paidVerdict(member: Member): Verdict {
  if (member.paid === null) {
    return {
      tone: "caution",
      words: `Paid: "${member.paidRaw}"`,
      detail: "Not a value the app recognises.",
    };
  }
  return member.paid
    ? { tone: "paid", words: "Paid" }
    : { tone: "caution", words: "Not paid" };
}

// The same, for a scan
export function verdictOf(lookup: Lookup): Verdict {
  switch (lookup.on) {
    case "no-list":
      return {
        tone: "caution",
        words: "No member list on this device",
        detail: "Nothing was checked. See the settings screen.",
      };
    case "not-listed":
      return { tone: "refused", words: "Not on the member list" };
    case "listed":
      return paidVerdict(lookup.member);
  }
}

// A member's name, or a note that the sheet didn't give one, so an empty row
// doesn't look like the app forgot to draw it.
export function displayName(member: Member): string {
  return member.name || "(no name on the list)";
}
