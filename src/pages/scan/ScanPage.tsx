// The main screen: the camera picture, the card outline drawn over it, the row
// of buttons, the Scan button, and the result of the last scan.

import { useRef, useState } from "react";

import type { MemberList } from "../../lib/members";
import type { ScanLogEntry } from "../../lib/scans";
import CameraView from "./CameraView";
import CardGuide from "./CardGuide";
import ManualEntry from "./ManualEntry";
import ScanResult from "./ScanResult";
import ScanToolbar from "./ScanToolbar";
import { useScanSession } from "./useScanSession";
import "./ScanPage.css";

export default function ScanPage({
  memberList,
  onScanned,
}: {
  memberList: MemberList | null;
  onScanned: (entry: ScanLogEntry) => void;
}) {
  const video = useRef<HTMLVideoElement | null>(null);
  const [guideShowing, setGuideShowing] = useState(false);
  const [usingManualEntry, setUsingManualEntry] = useState(false);

  const { scan, startScan, showFound } = useScanSession({
    video,
    memberList,
    onScanned,
  });

  const scanning = scan.status === "scanning";

  return (
    <div className="scanner">
      <CameraView video={video} />

      <div className="scanner-controls">
        <ScanToolbar
          guideShowing={guideShowing}
          onToggleGuide={() => setGuideShowing((on) => !on)}
          onManualEntry={() => setUsingManualEntry(true)}
        />

        <ScanResult scan={scan} />

        <CardGuide showing={guideShowing} found={scan.status === "found"} />

        <button
          type="button"
          className="scan-button"
          disabled={scanning}
          onClick={startScan}
        >
          {scanning ? "Scanning…" : "Scan"}
        </button>
      </div>

      {usingManualEntry && (
        <ManualEntry
          onEntered={(studentId) => {
            setUsingManualEntry(false);
            showFound(studentId);
          }}
          onCancel={() => setUsingManualEntry(false)}
        />
      )}
    </div>
  );
}
