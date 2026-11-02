// The list of cards scanned since the app was opened.

import { ArrowLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

import { useNavigation } from "../../app/navigation";
import { PageAction } from "../../components/Button";
import Page from "../../components/Page";
import { clockTime } from "../../lib/format";
import { verdictOf, type ScanLogEntry } from "../../lib/scans";
import "./ScanLog.css";

export default function ScanLog({
  entries,
  onClear,
}: {
  entries: ScanLogEntry[];
  onClear: () => void;
}) {
  const { back } = useNavigation();

  return (
    <Page
      title="Scanned today"
      actions={
        <>
          <PageAction label="Back" icon={<ArrowLeftIcon />} onClick={back} />
          <PageAction
            label="Clear"
            icon={<TrashIcon />}
            onClick={onClear}
            disabled={entries.length === 0}
          />
        </>
      }
    >
      {entries.length === 0 ? (
        <p>Nothing scanned yet.</p>
      ) : (
        <ol className="scan-log">
          {entries.map((entry) => (
            <li key={`${entry.studentId}-${entry.at}`}>
              <span className="scan-log-time">
                {clockTime(entry.at)}
              </span>
              <span className="scan-log-who">
                <code>{entry.studentId}</code>
                {entry.lookup.on === "listed" &&
                  entry.lookup.member.name !== "" && (
                    <span>{entry.lookup.member.name}</span>
                  )}
              </span>
              <Outcome entry={entry} />
            </li>
          ))}
        </ol>
      )}

      <p>This list is cleared when the app is closed or reloaded.</p>
    </Page>
  );
}

function Outcome({ entry }: { entry: ScanLogEntry }) {
  const verdict = verdictOf(entry.lookup);

  return (
    <span className={`scan-log-outcome tone-${verdict.tone}`}>
      {verdict.words}
    </span>
  );
}
