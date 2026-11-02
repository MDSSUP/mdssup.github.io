// The panel in the middle of the scan screen: whatever the last scan came to,
// or an invitation to start one.

import { displayName, verdictOf } from "../../lib/scans";
import { Spinner } from "./Spinner";
import type { ScanState } from "./useScanSession";
import "./ScanResult.css";

export default function ScanResult({ scan }: { scan: ScanState }) {
  switch (scan.status) {
    case "idle":
      return (
        <div className="scan-status">
          <p>Tap "Scan" to start</p>
        </div>
      );

    case "scanning":
      return (
        <div className="scan-status">
          <Spinner />
        </div>
      );

    case "found":
      return <Found scan={scan} />;

    case "timeout":
      return (
        <div className="scan-status">
          <p>
            {scan.rejected === undefined
              ? "No barcode found — try again"
              : "That barcode isn't a student ID — try again"}
          </p>
        </div>
      );

    case "failed":
      return (
        <div className="scan-status">
          <p className="scan-trouble tone-caution">
            {scan.reason === "camera"
              ? "The camera isn't sending a picture, so there is nothing to read. Type the ID in instead."
              : "The barcode reader wouldn't start. Type the ID in instead, or reload with a connection."}
          </p>
        </div>
      );
  }
}

// A card that was read, and what the member list said about the person.
function Found({ scan }: { scan: Extract<ScanState, { status: "found" }> }) {
  const { lookup } = scan;
  const verdict = verdictOf(lookup);

  return (
    <div className={`scan-status tone-${verdict.tone}`}>
      <code className="scan-student-id">{scan.studentId}</code>

      {lookup.on === "listed" && (
        <p className="scan-name">{displayName(lookup.member)}</p>
      )}

      <p className="scan-verdict">{verdict.words}</p>
      {verdict.detail !== undefined && (
        <p className="scan-detail">{verdict.detail}</p>
      )}

      {lookup.on === "listed" && lookup.member.membership !== "" && (
        <p className="scan-detail">{lookup.member.membership}</p>
      )}
    </div>
  );
}
