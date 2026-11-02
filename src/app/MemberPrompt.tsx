// The pop-up that asks for a fresh member list, shown when this device has
// none or when the one it has is stale.

import { ModalAction } from "../components/Button";
import ErrorNote from "../components/ErrorNote";
import Modal from "../components/Modal";
import { describeAge } from "../lib/format";
import type { MemberList, Refresh } from "../lib/members";
import { useNavigation } from "./navigation";

export default function MemberPrompt({
  memberList,
  refresh,
  onRefresh,
  onDismiss,
}: {
  memberList: MemberList | null;
  refresh: Refresh;
  onRefresh: () => void;
  onDismiss: () => void;
}) {
  const { openHelp } = useNavigation();

  return (
    <Modal
      title={
        memberList === null ? "No member list yet" : "The member list is old"
      }
      actions={
        <>
          <ModalAction
            label={memberList === null ? "Not now" : "Use the saved list"}
            onClick={onDismiss}
            disabled={refresh.status === "working"}
          />
          <ModalAction
            label={label(memberList, refresh)}
            onClick={onRefresh}
            disabled={refresh.status === "working"}
          />
        </>
      }
    >
      {memberList === null ? (
        <p>
          This device has nothing to check cards against. Downloading the member
          list takes a moment and needs a connection.
        </p>
      ) : (
        <p>
          It was downloaded {describeAge(memberList.fetchedAt)}, from "
          {memberList.sheetName}". Refresh it while you have a connection.
        </p>
      )}

      {refresh.status === "failed" && (
        <ErrorNote
          error={refresh.error}
          onOpenHelp={openHelp}
        />
      )}

      {memberList !== null && (
        <p>
          Scanning works either way — the saved list is still there, it is just
          old.
        </p>
      )}
    </Modal>
  );
}

// The button that gets on with it. After a failure it says so, because pressing
// the same word again and watching nothing happen is how someone decides the
// app is broken.
function label(memberList: MemberList | null, refresh: Refresh): string {
  if (refresh.status === "working") return "Working…";
  if (refresh.status === "failed") return "Try again";
  return memberList === null ? "Download" : "Refresh";
}
