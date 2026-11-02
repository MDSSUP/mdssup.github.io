// The help pages about scanning cards.
//
// The writing is ordinary JSX — see writing.tsx for the few pieces that
// aren't, and types.ts for what a category and a topic are made of.

import {
  CreditCardIcon,
  PencilSquareIcon,
  TrashIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import { SCAN_TIMEOUT_MS } from "../../config";
import { AppButton, HelpLink, HelpRow, HelpTable } from "./writing";
import type { HelpCategory } from "./types";

const Scanner: HelpCategory = {
  id: "scanner",
  title: "Scanner",
  body: (
    <>
      <p>
        Point the camera at a student card and press{" "}
        <AppButton label="Scan" />.
      </p>
      <p>
        The app looks for a barcode until it finds one or{" "}
        {(SCAN_TIMEOUT_MS / 1000).toFixed(0)} seconds have passed. A valid
        student ID is checked against the member list and the result is shown.
        See <HelpLink to="scanner/results">Reading a result</HelpLink> for what
        each result means.
      </p>
      <p>
        If the camera is unavailable, type the ID in with{" "}
        <AppButton of={PencilSquareIcon} label="Manual Entry" /> instead. The
        number to type is the 8-digit one printed under the photo.
      </p>
      <p>
        Cards scanned so far are listed in the{" "}
        <HelpLink to="scanner/log">log</HelpLink>, opened from the main screen.
      </p>
    </>
  ),
  entries: [
    {
      id: "results",
      title: "Reading a result",
      body: (
        <>
          <p>
            Once a card has been read, the app shows the ID it found and what
            the member list says about it.
          </p>
          <h3>When a card was read</h3>
          <ul>
            <li>
              <strong>A name and "Paid", in green</strong> — the person is on
              the member list and the list records them as paid. The name and
              the line under it confirm that the intended card was the one
              read.
            </li>
            <li>
              <strong>A name and "Not paid", in amber</strong> — the person is
              on the member list, but no payment is recorded. This is not the
              same as not being a member, and it is not a refusal: the payment
              may not have been recorded yet. Ask the person.
            </li>
            <li>
              <strong>A name and "Paid: &quot;something&quot;", in amber</strong>{" "}
              — the person is on the list, but the payment column holds a value
              the app does not recognise, shown in quotes as written. The
              payment column is calculated from hand-typed dates, so this can
              happen. Check the sheet, or ask.
            </li>
            <li>
              <strong>Not on the member list, in red</strong> — the card was
              read, and that ID is not on the list. Before turning anyone away,
              compare the number on screen with the one printed on the card, in
              case the wrong card was scanned. To see what the app has for that
              number, see{" "}
              <HelpLink to="google-sheets/checking-the-list">
                Checking the list
              </HelpLink>

              . A small number of long-standing members joined before student
              numbers were recorded and have no scannable number, so they also
              show as not on the list. They are generally the people least in
              need of checking; the app is aimed at the couple of hundred new
              members nobody recognises yet.
            </li>
            <li>
              <strong>No member list on this device</strong> — there is nothing
              to check against, so the app gives no answer either way. This is
              not a refusal. See{" "}
              <HelpLink to="google-sheets/troubleshooting">
                Member list troubleshooting
              </HelpLink>
              .
            </li>
          </ul>
          <h3>When no card was read</h3>
          <ul>
            <li>
              <strong>No barcode found</strong> — the app looked for{" "}
              {(SCAN_TIMEOUT_MS / 1000).toFixed(0)} seconds and found nothing
              to read. Try again, or see{" "}
              <HelpLink to="scanner/troubleshooting">
                Scanner troubleshooting
              </HelpLink>
              .
            </li>
            <li>
              <strong>That barcode isn't a student ID</strong> — a barcode was
              read, but it was not a student number. Usually the wrong card, or
              the wrong side of the right one.
            </li>
            <li>
              <strong>The barcode reader wouldn't start</strong> — the barcode
              reader failed to load. Type the ID in with{" "}
              <AppButton of={PencilSquareIcon} label="Manual Entry" />, and
              reload the app while you have a connection.
            </li>
            <li>
              <strong>The camera isn't sending a picture</strong> — the app
              received no frames from the camera during the scan, so the problem
              is the camera, not how the card was held. Type the ID
              in with{" "}
              <AppButton of={PencilSquareIcon} label="Manual Entry" />, and see{" "}
              <HelpLink to="scanner/troubleshooting">
                Scanner troubleshooting
              </HelpLink>{" "}
              for the camera itself.
            </li>
          </ul>
          <h3>The card outline</h3>
          <p>
            <AppButton of={ViewfinderCircleIcon} label="Show the card outline" />{" "}
            draws the shape of a card over the camera picture, as a guide to
            distance and angle.
          </p>
          <p>
            It is a visual aid only. The app reads the whole picture either
            way, so a card outside the outline still scans.
          </p>
        </>
      ),
    },
    {
      id: "log",
      title: "Log",
      body: (
        <>
          <p>
            The log lists every student ID scanned since the app was opened.
            Open it with{" "}
            <AppButton of={CreditCardIcon} label="Scanned today" /> at the top
            of the main screen.
          </p>
          <p>
            Each row shows the result as it appeared at the time of the scan,
            in the same colour, and does not change if the member list is
            refreshed or the sheet changes afterwards. A scan made before any
            list was downloaded is marked as such, not as someone missing from
            the list, because nothing was checked.
          </p>
          <p>
            The log is not saved, so it is cleared when the app is closed or
            reloaded.
          </p>
          <p>
            <AppButton of={TrashIcon} label="Clear" /> empties the log
            immediately, without confirmation, and cannot be undone. Use it when
            the entries are no longer needed, for example before a new event on
            a device that has already been used.
          </p>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      body: (
        <>
          <p>
            Common problems and their fixes. If a problem persists, contact
            the{" "}
            <HelpLink to="general/contact">administrator</HelpLink>.
          </p>
          <HelpTable columns={["Issue", "Resolution"]}>
            <HelpRow cells={["No camera", "Check camera permissions"]}>
              If the app cannot access the camera, check that it has been given
              camera permission, in the browser's settings or the device's.
            </HelpRow>
            <HelpRow
              cells={[
                "Card won't scan",
                "Ensure good lighting and placement, or enter manually",
              ]}
            >
              Scanning works best in good light with a clear view of the card.
              Keep the barcode uncovered and the camera steady. If a card is too
              worn or the light too poor, use{" "}
              <AppButton of={PencilSquareIcon} label="Manual Entry" /> instead.
            </HelpRow>
            <HelpRow
              cells={[
                "Scanned the wrong number",
                "Check the number on screen against the card",
              ]}
            >
              The app only accepts 8-digit student numbers. If the number shown
              is not the one printed on the card, another barcode was most
              likely in view, such as a second card or a label on the desk. Move
              it out of the picture and scan again.
            </HelpRow>
          </HelpTable>
        </>
      ),
    },
  ],
};

export default Scanner;
