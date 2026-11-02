/**
 * Serves the society's member list to the Membership Scanner app.
 *
 * This is the copy of record. The code that actually runs lives in a Google
 * Apps Script project in the society's Drive — this file is here so that it is
 * reviewable, kept in version control, and survives the sheet, the Drive file
 * and whoever wrote it. The two are not synced automatically: change this, then
 * paste it in and redeploy. The HANDOVER doc explains how.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS EXISTS
 * ---------------------------------------------------------------------------
 *
 * The app is a static site with no server. It needs to read the member sheet,
 * and every way of doing that directly from a phone turned out to be a dead
 * end:
 *
 *   - An API key can only read a sheet shared with the whole world, which would
 *     expose the phone numbers, emails, birthdays, gender and residences the
 *     member sheet also holds.
 *   - Google sign-in with the narrow "drive.file" permission needs Google's
 *     file-picking window, which runs inside the app's own page and so needs
 *     third-party cookies. Phone browsers have stopped allowing those. It fails
 *     outright on an installed app.
 *   - Google sign-in with a wider permission avoids the picker, but is capped at
 *     100 people for the lifetime of the app unless Google formally reviews it —
 *     a cap a society with yearly turnover would eventually hit, and a review
 *     nobody would be left to maintain.
 *
 * So the sheet is read here instead, by a script running as the sheet's owner,
 * and the app is handed only the four columns it actually uses. Nobody signs in
 * to anything.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS AND ISN'T PRIVATE
 * ---------------------------------------------------------------------------
 *
 * This is deployed so that anyone can reach it without signing in, because the
 * app cannot sign in. The address is long and random, but it sits in the app's
 * own code, which is public — so treat what comes out of here as public, and
 * put nothing in the reply that isn't.
 *
 * Public: the student number, name, membership and paid status of every member.
 * The committee agreed to this; it is the price of the scanner working at all.
 *
 * Not public: the sheet itself, this code, and every other column. The reply is
 * built below, field by field, and nothing else is included.
 *
 * The app's passcode does NOT protect this address. Do not let anyone conclude
 * that it does.
 */

// The sheet to read is set in Project Settings > Script Properties, under this
// name, rather than written into the code. A new sheet each year is then one
// field for a committee member to paste an ID into, with no code change, no
// redeployment and no developer.
//
// It is deliberately NOT taken from the request. Anyone at all can call this
// address, and a sheet ID in the request would let them read any sheet this
// script's owner can open. Never add that, however convenient it looks.
const SHEET_ID_PROPERTY = "MEMBER_SHEET_ID";

// A door with ten phones on it should be one read of the sheet, not ten.
const CACHE_KEY = "member-list";
const CACHE_SECONDS = 300;
// Google refuses to cache anything larger than 100KB, so an unusually long list
// simply isn't cached rather than failing.
const CACHE_LIMIT_BYTES = 90 * 1024;

// Which column is which. Matched against the headings in each tab's first row,
// so columns can be in any order and it doesn't matter how many unrelated ones
// sit between them. Patterns rather than exact names, so a sheet saying
// "Student ID" where another says "Student/Adult Number" still works.
const STUDENT_ID_COLUMN = /student.*(num(ber)?|id)/i;
const FIRST_NAME_COLUMN = /first.*name/i;
const SURNAME_COLUMN = /surname|last.*name/i;
const FULL_NAME_COLUMN = /^(full.*)?name/i;
// "Membership" is whether somebody is at the university or joined privately.
// It is not about money, despite the name.
const MEMBERSHIP_COLUMN = /^(membership|affiliation)/i;
// "Paid" is the column that decides anything. Written so it matches "Paid"
// without also catching "Payment Date" or "Payment Method".
const PAID_COLUMN = /^paid/i;

// An 8-digit number that does not start with zero.
//
// KEEP IN STEP WITH STUDENT_ID_PATTERN in src/config.ts, which decides the same
// thing on the app's side. If the two disagree, this script silently drops
// people the app would have accepted, or the app refuses barcodes this script
// published — and neither failure says anything about the cause.
const STUDENT_ID_PATTERN = /^[1-9]\d{7}$/;

// What the Paid column can come out as. It is a formula over hand-typed dates,
// so this is really a list of what that formula produces. Anything in neither
// list is reported as unclear rather than as unpaid: a value nobody anticipated
// is a question for a human, not grounds for turning somebody away.
const PAID_VALUES = /^\s*(y|yes|true|paid|1|✓)\s*$/i;
const UNPAID_VALUES = /^\s*(n|no|false|unpaid|0|✗)\s*$/i;

/**
 * The one address this script serves.
 *
 * Always replies with HTTP 200, because Apps Script gives no usable way to send
 * anything else — so a failure comes back as an { error } field, and the app
 * checks for it. Don't "fix" this by throwing: an Apps Script error page is
 * HTML, and the app would report it as unreadable rubbish instead of as the
 * problem it is.
 */
function doGet() {
  try {
    return reply(readMembers());
  } catch (trouble) {
    return reply({ error: String((trouble && trouble.message) || trouble) });
  }
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/** The member list, from the cache if it is there and the sheet if it isn't. */
function readMembers() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const built = buildMembers();

  const asText = JSON.stringify(built);
  if (asText.length < CACHE_LIMIT_BYTES) {
    cache.put(CACHE_KEY, asText, CACHE_SECONDS);
  }
  return built;
}

function buildMembers() {
  const sheetId =
    PropertiesService.getScriptProperties().getProperty(SHEET_ID_PROPERTY);
  if (!sheetId) {
    throw new Error(
      'This script has not been told which sheet to read. Set "' +
        SHEET_ID_PROPERTY +
        "\" in Project Settings > Script Properties to the sheet's ID.",
    );
  }

  // A sheet ID is only ever letters, digits, "-" and "_". Anything else —
  // usually the whole address pasted in — would otherwise come back as an
  // error from Google that says nothing about the cause.
  if (!/^[A-Za-z0-9_-]+$/.test(sheetId.trim())) {
    throw new Error(
      '"' +
        SHEET_ID_PROPERTY +
        "\" in Script Properties doesn't look like a sheet ID. It should be " +
        "only the long code between /d/ and /edit in the sheet's address, " +
        "not the whole address.",
    );
  }

  const book = SpreadsheetApp.openById(sheetId.trim());

  // Every tab, rather than one named in a setting, because the sheet keeps
  // beginning-of-year and mid-year signups apart and a third could appear at
  // any time. Tabs that aren't member lists are left alone below.
  const members = [];
  const seen = {};
  const ignoredTabs = [];
  const duplicates = [];
  let skipped = 0;

  book.getSheets().forEach(function (tab) {
    const rows = tab.getDataRange().getDisplayValues();
    const found = readTab(rows);
    if (!found) {
      ignoredTabs.push(tab.getName());
      return;
    }
    skipped += found.skipped;
    found.members.forEach(function (member) {
      if (seen[member.studentId]) {
        duplicates.push(member.studentId);
        return;
      }
      seen[member.studentId] = true;
      members.push(member);
    });
  });

  if (ignoredTabs.length === book.getSheets().length) {
    throw new Error(
      'No tab in "' +
        book.getName() +
        '" has a student number column, so this may not be the member sheet. ' +
        'A heading like "Student number" is what the script looks for in the ' +
        "first row of each tab.",
    );
  }

  return {
    sheetName: book.getName(),
    members: members,
    concerns: describeConcerns({
      sheetName: book.getName(),
      members: members,
      ignoredTabs: ignoredTabs,
      duplicates: duplicates,
      skipped: skipped,
    }),
  };
}

/**
 * Turn one tab into people.
 *
 * Returns null when the tab has no student number column at all, which is how a
 * tab that isn't a member list — notes, takings, a rota — gets left alone
 * without anybody having to list the tabs that count.
 *
 * Note what this does NOT keep. The sheet also holds phone numbers, email
 * addresses, birthdays, gender and residences. Only the five fields below are
 * put in the reply, and the reply is public. Please don't "simplify" this by
 * returning whole rows.
 */
function readTab(rows) {
  if (!rows || rows.length === 0) return null;
  const headings = rows[0];

  const idAt = findColumn(headings, STUDENT_ID_COLUMN);
  if (idAt === -1) return null;

  // Once a tab is known to be a member list, a missing Paid column is a real
  // problem rather than something to shrug at: every single person would come
  // out as unpaid.
  const paidAt = findColumn(headings, PAID_COLUMN);
  if (paidAt === -1) {
    throw new Error(
      'A tab has a student number column but no "Paid" column, so the app ' +
        "cannot tell who has paid. Check the headings in the first row of " +
        "each tab.",
    );
  }

  const firstNameAt = findColumn(headings, FIRST_NAME_COLUMN);
  const surnameAt = findColumn(headings, SURNAME_COLUMN);
  // Only looked for when the name isn't already split in two.
  const fullNameAt =
    firstNameAt === -1 && surnameAt === -1
      ? findColumn(headings, FULL_NAME_COLUMN)
      : -1;
  const membershipAt = findColumn(headings, MEMBERSHIP_COLUMN);

  const members = [];
  let skipped = 0;

  for (let at = 1; at < rows.length; at += 1) {
    const row = rows[at];
    const studentId = cell(row, idAt);

    if (!STUDENT_ID_PATTERN.test(studentId)) {
      // Blank rows at the bottom of a sheet are normal and not worth counting.
      // Anything else was somebody the app can't identify — see the note about
      // older-style numbers in describeConcerns.
      if (
        row.some(function (value) {
          return String(value).trim() !== "";
        })
      ) {
        skipped += 1;
      }
      continue;
    }

    const paidRaw = cell(row, paidAt);
    members.push({
      studentId: studentId,
      name:
        fullNameAt !== -1
          ? cell(row, fullNameAt)
          : [cell(row, firstNameAt), cell(row, surnameAt)]
              .filter(function (part) {
                return part !== "";
              })
              .join(" "),
      membership: cell(row, membershipAt),
      paid: readPaid(paidRaw),
      paidRaw: paidRaw,
    });
  }

  return { members: members, skipped: skipped };
}

function findColumn(headings, pattern) {
  for (let at = 0; at < headings.length; at += 1) {
    if (pattern.test(String(headings[at]).trim())) return at;
  }
  return -1;
}

function cell(row, at) {
  return at === -1 ? "" : String(row[at] === undefined ? "" : row[at]).trim();
}

/**
 * What one Paid cell means: true, false, or null for "the app has no opinion".
 *
 * An empty cell is a plain no — nobody has recorded a payment. A value in
 * neither list, or somehow in both, is null, because that column is a formula
 * and a value nobody anticipated should look like a question rather than an
 * accusation.
 */
function readPaid(paidRaw) {
  if (paidRaw === "") return false;
  const yes = PAID_VALUES.test(paidRaw);
  const no = UNPAID_VALUES.test(paidRaw);
  if (yes === no) return null;
  return yes;
}

/**
 * Things worth mentioning about the sheet, shown on the app's settings screen.
 *
 * These are advisory and phrased that way on purpose: none of them stops the
 * app working, and somebody who knows the sheet can glance at them and tell at
 * once whether they matter. Resist turning any of them into an error.
 *
 * `message` is what happened. `hint` is what to do or think about it. `examples`
 * are the actual offending values, which is usually what turns "something is
 * wrong" into "ah, that row".
 */
function describeConcerns(found) {
  const concerns = [];

  if (!mentionsThisYear(found.sheetName)) {
    concerns.push({
      message:
        'The sheet is called "' +
        found.sheetName +
        "\", which doesn't mention this year.",
      hint: "Ensure this is the correct sheet for the current date.",
    });
  }

  if (found.members.length === 0) {
    concerns.push({
      message: "No people were found in this sheet.",
      hint: "The sheet is either empty, or has no tab with a student number column.",
    });
  } else if (found.members.length < 20) {
    concerns.push({
      message: "Only " + found.members.length + " people were found",
      hint: "The sheet is unusually small. Check that it is the correct one.",
    });
  }

  if (found.ignoredTabs.length > 0) {
    concerns.push({
      message:
        (found.ignoredTabs.length === 1
          ? "One tab was"
          : found.ignoredTabs.length + " tabs were") +
        " left alone for having no student number column.",
      examples: found.ignoredTabs,
    });
  }

  if (found.duplicates.length > 0) {
    concerns.push({
      message:
        found.duplicates.length +
        (found.duplicates.length === 1 ? " row" : " rows") +
        " duplicated student numbers",
      hint: "Only the first of each duplicate is kept. Check the sheet for errors.",
      examples: found.duplicates,
    });
  }

  if (found.skipped > 0) {
    concerns.push({
      message:
        found.skipped +
        (found.skipped === 1 ? " row was" : " rows were") +
        " skipped.",
      hint:
        "The skipped rows had no student number, or one that the app cannot read." +
        " This is expected for adults and non-students, but check that the student" +
        " numbers are correct for students.",
    });
  }

  // The distinct values, not the count of people, because the useful question
  // is "what is in there?" — one unexpected word repeated forty times is a
  // one-line fix to PAID_VALUES above.
  const unrecognised = [];
  found.members.forEach(function (member) {
    if (member.paid === null && unrecognised.indexOf(member.paidRaw) === -1) {
      unrecognised.push(`"${member.paidRaw}"`);
    }
  });
  if (unrecognised.length > 0) {
    const people = found.members.filter(function (member) {
      return member.paid === null;
    }).length;
    concerns.push({
      message:
        people +
        (people === 1 ? " person has" : " people have") +
        " something in the payment status column that the script doesn't recognise.",
      hint:
        "Check the PAID_VALUES and UNPAID_VALUES patterns in the script, or fix the sheet to use one of the recognised values.",
      examples: unrecognised,
    });
  }

  return concerns;
}

/**
 * The sheet is usually named after the year it covers. The society's year runs
 * across two calendar years, so either counts, in full or shortened: "2026/27",
 * "26-27" and "Members 2027" all pass. Deliberately generous — a quiet check
 * that occasionally misses something is worth more than one that cries wolf
 * every autumn and gets ignored.
 */
function mentionsThisYear(name) {
  const year = new Date().getFullYear();
  return [year - 1, year, year + 1].some(function (candidate) {
    return (
      name.indexOf(String(candidate)) !== -1 ||
      name.indexOf(String(candidate % 100)) !== -1
    );
  });
}
