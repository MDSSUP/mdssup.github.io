// How much room the app is taking up on the device, and whether the browser
// has promised to keep it.

import { useEffect, useState } from "react";

import { bytes } from "../../lib/format";

type StorageReport = {
  used: string;
  persistence: string;
};

const UNKNOWN: StorageReport = {
  used: "Unavailable",
  persistence: "Unsupported",
};

const CHECKING: StorageReport = {
  used: "Checking…",
  persistence: "Checking…",
};

export function useStorageReport(): StorageReport {
  const [report, setReport] = useState(CHECKING);

  useEffect(() => {
    let cancelled = false;
    void readStorageReport().then((result) => {
      if (!cancelled) setReport(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return report;
}

async function readStorageReport(): Promise<StorageReport> {
  if (!navigator.storage?.estimate) return UNKNOWN;

  try {
    const [{ usage, quota }, persisted] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted(),
    ]);

    return {
      used:
        usage === undefined
          ? "Unavailable"
          : quota === undefined
            ? bytes(usage)
            : `${bytes(usage)} of ${bytes(quota)}`,
      persistence: persisted ? "Enabled" : "Disabled",
    };
  } catch {
    return UNKNOWN;
  }
}
