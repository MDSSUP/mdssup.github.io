// The help pages about where the member list comes from.
//
// The writing is ordinary JSX — see writing.tsx for the few pieces that
// aren't, and types.ts for what a category and a topic are made of.

import { AppButton, HelpLink, HelpRow, HelpTable } from "./writing";
import type { HelpCategory } from "./types";

const GoogleSheets: HelpCategory = {
  id: "google-sheets",
  title: "Member list",
  body: (
    <>
      <p>
        The member list is not part of the app. It is downloaded from the
        society's Google Sheet, through a script hosted by Google, and a copy
        is kept on the device.
      </p>
      <p>
        There is nothing to sign in to and nothing to choose: tap{" "}
        <AppButton label={"Refresh"} /> and the list is downloaded. Which sheet
        is read, and who can read it, is set up outside the app by the
        committee.
      </p>
      <p>
        Every scan is checked against the copy on the device, so nothing is
        looked up over the internet at the door. This is also why an old copy
        can go unnoticed — see{" "}
        <HelpLink to="google-sheets/refreshing">Refreshing</HelpLink>.
      </p>
    </>
  ),
  entries: [
    {
      id: "refreshing",
      title: "Refreshing",
      body: (
        <>
          <p>
            <AppButton label={"Refresh"} /> in{" "}
            <strong>Settings &gt; Member list</strong> downloads the list again.
            It needs a connection and takes a few seconds.
          </p>
          <h3>When the app asks</h3>
          <p>
            The app prompts for a refresh when it has no member list, or when
            the copy on the device is more than a week old. The prompt can
            always be dismissed to keep using the saved list. Scanning works
            either way, and without signal a refresh would fail anyway.
          </p>
          <p>
            Refresh before an event, while there is a connection.
          </p>
          <h3>Somebody added recently</h3>
          <p>
            The app shows what is on <em>this device</em>, which may differ from
            the sheet. Somebody added to the sheet an hour ago does not appear
            until the list is refreshed. If they were added after the device
            lost signal, they cannot appear until it has signal again.
          </p>
        </>
      ),
    },
    {
      id: "checking-the-list",
      title: "Checking the list",
      body: (
        <>
          <p>
            <AppButton label={"View list"} /> in{" "}
            <strong>Settings &gt; Member list</strong> shows everybody the app
            currently has, with a search box for student number or name.
          </p>
          <p>
            Use it when somebody shows as not on the member list unexpectedly.
            Search for their number. If it is not there, the app does not have
            them, and the likely causes are an old copy of the list, somebody
            added to the sheet since, or a row that could not be read. Rows that
            could not be read are counted on the settings screen, on a line
            reading{" "}
            <strong>"N issues"</strong>.
          </p>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      body: (
        <>
          <p>Common problems and their fixes.</p>
          <HelpTable columns={["Issue", "Resolution"]}>
            <HelpRow
              cells={[
                "Member data is wrong/outdated",
                "Refresh the member list",
              ]}
            >
              Refresh the list from the app's settings, and check the sheet name
              shown there. If it is last year's sheet, the committee needs to
              point the member list at the current one, which is done outside
              the app. To see what the app has for one person, see{" "}
              <HelpLink to="google-sheets/checking-the-list">
                Checking the list
              </HelpLink>
              .
            </HelpRow>
            <HelpRow
              cells={[
                "Could not reach the member list",
                "Check the connection, then ask the administrator",
              ]}
            >
              Usually there is no connection. The saved copy keeps working, and
              nothing more can be done until there is signal. If it keeps
              failing with a good connection, the service that reads the sheet
              may have moved or stopped; tell the{" "}
              <HelpLink to="general/contact">administrator</HelpLink>.
            </HelpRow>
            <HelpRow
              cells={[
                "A message about a missing column, or the wrong sheet",
                "Pass the message on as written",
              ]}
            >
              These come from the service that reads the sheet, not from the
              app, and name the heading or sheet that caused the problem. They
              usually follow a change to the sheet. Pass the wording on exactly
              as it appears.
            </HelpRow>
            <HelpRow
              cells={[
                '"N issues" in settings',
                "Advisory only — read and judge",
              ]}
            >
              Anything noticed while reading the sheet is counted on the
              settings screen, under the member list: a sheet name that does
              not mention this year, fewer people than expected, rows that could
              not be read, tabs that were skipped. Tap the line to see each one,
              with a note on what it usually means and examples from the sheet.
              None of them stops the app working. They let somebody who knows
              the sheet spot a wrong one quickly.
            </HelpRow>
          </HelpTable>
        </>
      ),
    },
  ],
};

export default GoogleSheets;
