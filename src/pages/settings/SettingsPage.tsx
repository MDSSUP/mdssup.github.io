// The settings screen: how fresh the member list is, a way to refresh it, a way
// to pass the app on, a way to lock the device, and a way to reset the whole
// app.

import { ArrowLeftIcon, QrCodeIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { useNavigation } from "../../app/navigation";
import { Button, PageAction } from "../../components/Button";
import ErrorNote from "../../components/ErrorNote";
import Page, { PageSection } from "../../components/Page";
import { build } from "../../lib/build";
import { resetApp } from "../../lib/device";
import { dateTime, describeAge, plural } from "../../lib/format";
import { isStale, type MemberList, type Refresh } from "../../lib/members";
import ShareModal from "./ShareModal";
import "./SettingsPage.css";

// How many of a concern's examples to show before collapsing the rest.
const EXAMPLES_SHOWN = 3;

export default function SettingsPage({
  memberList,
  refresh,
  onRefresh,
  onLock,
}: {
  memberList: MemberList | null;
  refresh: Refresh;
  onRefresh: () => void;
  onLock: () => void;
}) {
  const { go, back, openHelp } = useNavigation();
  const [sharing, setSharing] = useState(false);

  // Everything there is to mention about the list, in the order a reader would
  // want it: the sheet first, then this device.
  const notes =
    memberList === null
      ? []
      : [...memberList.concerns, ...memberList.deviceNotes];

  return (
    <Page
      title="Settings"
      actions={
        <PageAction label="Back" icon={<ArrowLeftIcon />} onClick={back} />
      }
    >
      <PageSection title="App Info">
        <p>
          Version {build.version} · {build.commit}
        </p>
        <Button label="Details" onClick={() => go("info")} />
      </PageSection>
      <PageSection title="Member list">
        {memberList === null ? (
          <p>Not downloaded yet. Refreshing fetches it.</p>
        ) : (
          <>
            <p>
              {memberList.members.length}{" "}
              {plural(memberList.members.length, "person", "people")}, from "
              {memberList.sheetName}". Downloaded{" "}
              {dateTime(memberList.fetchedAt)}
              {memberList.source === "device" && " (from this device's copy)"}.
            </p>
            {isStale(memberList) && (
              <p className="settings-stale">
                That was {describeAge(memberList.fetchedAt)} — worth refreshing.
              </p>
            )}
          </>
        )}

        {refresh.status === "failed" && (
          <ErrorNote
            error={refresh.error}
            onOpenHelp={openHelp}
          />
        )}

        <div className="settings-buttons">
          <Button
            label={refresh.status === "working" ? "Refreshing…" : "Refresh"}
            onClick={onRefresh}
            disabled={refresh.status === "working"}
          />
          <Button
            label="View list"
            onClick={() => go("members")}
            disabled={memberList === null}
          />
        </div>

        {notes.length > 0 && (
          <details className="settings-concerns">
            <summary className="settings-concerns-count">
              {notes.length} {plural(notes.length, "issue", "issues")}
            </summary>
            <ul className="settings-concerns-list">
              {notes.map((concern) => (
                <li key={concern.message}>
                  {concern.message}
                  {concern.hint && (
                    <p className="settings-concern-hint">{concern.hint}</p>
                  )}
                  {concern.examples && concern.examples.length > 0 && (
                    <ul className="settings-concern-examples">
                      {concern.examples
                        .slice(0, EXAMPLES_SHOWN)
                        .map((example) => (
                          <li key={example}>{example}</li>
                        ))}
                      {concern.examples.length > EXAMPLES_SHOWN && (
                        <li className="settings-concern-examples">
                          {concern.examples.length - EXAMPLES_SHOWN} more
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </details>
        )}
      </PageSection>

      <PageSection title="Share this app">
        <p>
          Shows a QR code of the app's address, for someone else to scan with
          their phone's camera.
        </p>
        <Button
          label="Show QR code"
          icon={<QrCodeIcon />}
          onClick={() => setSharing(true)}
        />
      </PageSection>

      <PageSection title="This device">
        <h4>Lock Device</h4>
        <p>Locking asks for the passcode again next time.</p>
        <Button label="Lock" onClick={onLock} />

        <h4>Reset App</h4>
        <p>Clear all saved data and reset the app to its default state.</p>
        <Button
          label="Reset"
          onClick={() => {
            if (
              confirm("Are you sure? This is destructive and cannot be undone.")
            ) {
              void resetApp();
            }
          }}
        />
      </PageSection>

      {sharing && <ShareModal onClose={() => setSharing(false)} />}
    </Page>
  );
}
