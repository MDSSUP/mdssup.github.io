// The scanning itself: where the screen is up to, and the looking-at-the-camera
// that gets it there.

import { useEffect, useRef, useState } from "react";

import { SCAN_TIMEOUT_MS } from "../../config";
import { lookUp, type Lookup, type MemberList } from "../../lib/members";
import type { ScanLogEntry } from "../../lib/scans";
import { detectStudentId, waitForReader } from "./camera";

// How long a result stays on screen before the display goes back to waiting.
const RESULT_SHOWN_MS = 4_000;

// Where the screen is up to.
export type ScanState =
  | { status: "idle" }
  | { status: "scanning" }
  // A card that was read, and what the member list said about it at the time.
  | { status: "found"; studentId: string; lookup: Lookup }
  // `rejected` is a barcode that was read clearly but wasn't a student ID
  | { status: "timeout"; rejected?: string }
  | { status: "failed"; reason: "reader" | "camera" };

export function useScanSession({
  video,
  memberList,
  onScanned,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
  memberList: MemberList | null;
  // Writes the scan down in the log.
  onScanned: (entry: ScanLogEntry) => void;
}) {
  const [scan, setScan] = useState<ScanState>({ status: "idle" });
  // Holds the scan currently running, so it can be stopped when the screen
  // closes. Also acts as the "a scan is already going" check.
  const runningScan = useRef<{ cancelled: boolean } | null>(null);
  const clearResultTimeout = useRef<number | null>(null);

  // Stop a scan that is still running if the screen closes under it, and drop
  // the timer that would have cleared the result. Both would otherwise outlive
  // the screen.
  useEffect(
    () => () => {
      if (runningScan.current) {
        runningScan.current.cancelled = true;
        runningScan.current = null;
      }
      if (clearResultTimeout.current) {
        clearTimeout(clearResultTimeout.current);
        clearResultTimeout.current = null;
      }
    },
    [],
  );

  const showResult = (next: ScanState) => {
    if (clearResultTimeout.current) {
      clearTimeout(clearResultTimeout.current);
    }
    setScan(next);
    clearResultTimeout.current = setTimeout(() => {
      setScan({ status: "idle" });
    }, RESULT_SHOWN_MS);
  };

  // Look an ID up, write it in the log, and say what to show for it. A scan
  // still running uses the list as it was when the Scan button was pressed.
  const found = (studentId: string): ScanState => {
    const lookup = lookUp(memberList, studentId);
    onScanned({ studentId, lookup, at: Date.now() });
    return { status: "found", studentId, lookup };
  };

  // For an ID typed in by hand.
  const showFound = (studentId: string) => showResult(found(studentId));

  // Look at the camera over and over until a student ID turns up or the time
  // runs out.
  const startScan = () => {
    if (runningScan.current) return;

    // Throw away whatever the last scan left on screen, including the timer
    // that was going to clear it.
    if (clearResultTimeout.current) {
      clearTimeout(clearResultTimeout.current);
      clearResultTimeout.current = null;
    }

    const session = { cancelled: false };
    runningScan.current = session;
    setScan({ status: "scanning" });

    const finish = (next: ScanState) => {
      runningScan.current = null;
      showResult(next);
    };

    // The clock only starts once the barcode reader has finished loading.
    waitForReader()
      .then(() => {
        if (session.cancelled) return;

        const deadline = Date.now() + SCAN_TIMEOUT_MS;
        let rejected: string | undefined;
        // Whether the camera ever gave us a picture at all during this scan.
        let sawFrame = false;

        const tick = () => {
          // Waiting for each look to finish keeps frames from piling up behind
          // a slow read.
          detectStudentId(video.current)
            .then((detection) => {
              if (session.cancelled) return;

              if (detection.studentId) {
                finish(found(detection.studentId));
                return;
              }
              if (!detection.noFrame) {
                sawFrame = true;
              }
              if (detection.otherBarcode) {
                rejected = detection.otherBarcode;
              }
              if (Date.now() >= deadline) {
                // Never a single frame in all that time - the camera is the
                // problem
                finish(
                  sawFrame
                    ? { status: "timeout", rejected }
                    : { status: "failed", reason: "camera" },
                );
                return;
              }
              requestAnimationFrame(tick);
            })
            .catch((reason: unknown) => {
              console.warn("The barcode reader failed", reason);
              if (!session.cancelled) {
                finish({ status: "failed", reason: "reader" });
              }
            });
        };

        requestAnimationFrame(tick);
      })
      // Reaching here means the reader never became usable, or something in the
      // block above threw before the loop started.
      .catch((reason: unknown) => {
        console.warn("The barcode reader failed to start", reason);
        if (!session.cancelled) {
          finish({ status: "failed", reason: "reader" });
        }
      });
  };

  return { scan, startScan, showFound };
}
