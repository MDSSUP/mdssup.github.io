// The camera: switching it on, and reading a student ID out of the picture.

import { BarcodeDetector, prepareZXingModule } from "barcode-detector/pure";
import { useEffect } from "react";
import wasmUrl from "zxing-wasm/reader/zxing_reader.wasm?url";
import { useErrorBoundary } from "react-error-boundary";

import { STUDENT_ID_PATTERN } from "../../config";
import { AppError } from "../../lib/errors";

// Turns the browser's reason for refusing the camera into something a person
// at a door desk can act on.
function explainCameraFailure(reason: unknown): AppError {
  const name = reason instanceof Error ? reason.name : "";

  switch (name) {
    // SecurityError is deliberately not here. Browsers raise it for an
    // insecure page, not for a refused permission, and reporting it as a
    // refusal would send people into their browser settings to change something that
    // was never the problem. insecurePageError in lib/errors.ts catches that
    // case before this screen is ever drawn.
    case "NotAllowedError":
      return new AppError("Camera permission was refused", {
        hint: "Allow camera access for this site in your browser settings, then reload.",
        help: "scanner/troubleshooting",
        about: "camera",
      });
    case "NotFoundError":
    case "OverconstrainedError":
      return new AppError("No back camera on this device", {
        hint: "Try a phone or tablet with a rear-facing camera.",
        help: "scanner/troubleshooting",
        about: "camera",
      });
    case "NotReadableError":
    case "AbortError":
      return new AppError("The camera is already in use", {
        hint: "Close any other app or tab using the camera, then reload.",
        help: "scanner/troubleshooting",
        about: "camera",
      });
    default:
      return new AppError("The camera could not be started", {
        hint: "Reload the page. If it keeps happening, try a different browser.",
        help: "scanner/troubleshooting",
        about: "camera",
      });
  }
}

// Set VITE_ALLOW_MISSING_CAMERA=true in .env.local to work on the rest of the
// app on a machine with no camera. Ignored in a real build.
const ALLOW_MISSING_CAMERA =
  import.meta.env.DEV && import.meta.env.VITE_ALLOW_MISSING_CAMERA === "true";

// The barcode reader is a 1 MB WebAssembly file. Left to itself the library
// downloads it from someone else's website the first time a scan runs, which
// caused two problems: the first scan spent its whole time limit waiting for
// the download and always reported a timeout, and a device that had been
// offline since it was opened could not scan at all.
//
// So we ship our own copy instead. Vite gives the file a web address at build
// time, and because it is then part of the app the service worker saves it for
// offline use. Loading starts as soon as the app opens rather than on the
// first scan.
const readerLoading = prepareZXingModule({
  overrides: { locateFile: () => wasmUrl },
  fireImmediately: true,
});

// Stops a failed download being reported as an unhandled error; detect() will
// raise it properly if a scan is actually attempted.
readerLoading.catch(() => {});

// Waits until the barcode reader has finished loading.
export async function waitForReader(): Promise<void> {
  try {
    await readerLoading;
  } catch {
    // Let the scan itself fail instead, where it can be shown to the user.
  }
}

// The reader, made once and reused.
let detector: BarcodeDetector | null = null;

function getDetector(): BarcodeDetector {
  detector ??= new BarcodeDetector({ formats: ["code_128"] });
  return detector;
}

// What one look at the camera found.
type Detection = {
  // An 8-digit student ID, if one was in the picture.
  studentId?: string;
  // A barcode that was read clearly but wasn't a student ID.
  otherBarcode?: string;
  // There was no picture to look at.
  noFrame?: boolean;
};

// Look at the current video frame once.
export async function detectStudentId(
  video: HTMLVideoElement | null,
): Promise<Detection> {
  // readyState 0 means the camera hasn't produced a frame yet.
  if (!video || video.readyState < 1) return { noFrame: true };

  const barcodes = await getDetector().detect(video);
  for (const barcode of barcodes) {
    const value = barcode.rawValue.trim();
    if (STUDENT_ID_PATTERN.test(value)) return { studentId: value };
  }
  return { otherBarcode: barcodes[0]?.rawValue };
}

// Point the back camera at the given <video> element for as long as the screen
// is open, and turn it off again afterwards.
export function useCamera(video: React.RefObject<HTMLVideoElement | null>) {
  const { showBoundary } = useErrorBoundary();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    const report = (error: AppError) => {
      if (ALLOW_MISSING_CAMERA) {
        console.warn(`${error.message} (ignored: ALLOW_MISSING_CAMERA)`);
        return;
      }
      showBoundary(error);
    };

    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      report(
        new AppError("This browser can't use the camera", {
          hint: "Try Safari on iPhone, or Chrome on Android.",
          help: "scanner/troubleshooting",
          about: "camera",
        }),
      );
      return;
    }

    mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
        }
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        report(explainCameraFailure(reason));
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [showBoundary, video]);
}
