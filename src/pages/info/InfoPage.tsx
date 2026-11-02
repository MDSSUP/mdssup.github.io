// The Info screen: everything this copy of the app can say about itself.

import { useEffect, useState } from "react";

import { useNavigation } from "../../app/navigation";
import { build } from "../../lib/build";
import { isInstalled } from "../../lib/device";
import { dateTime } from "../../lib/format";
import { PageAction } from "../../components/Button";
import Page, { PageSection } from "../../components/Page";
import "./InfoPage.css";
import { useLastOnline } from "../../lib/online";
import { useStorageReport } from "./useStorageReport";

export default function InfoPage() {
  const { back } = useNavigation();
  const lastOnline = useLastOnline();
  const device = useDeviceFacts();
  const storage = useStorageReport();

  return (
    <Page title="Info" actions={<PageAction label="Back" onClick={back} />}>
      <PageSection title="This version">
        <dl className="info-list">
          <InfoRow label="Version" value={build.version} />
          <InfoRow label="Commit" value={build.commit} monospace />
          <InfoRow label="Built" value={dateTime(build.time)} />
          <InfoRow
            label="Build type"
            value={import.meta.env.DEV ? "Development" : "Production"}
          />
          <InfoRow label="Served from" value={window.location.href} />
        </dl>
      </PageSection>

      <PageSection title="This device">
        <dl className="info-list">
          <InfoRow label="Last online" value={lastOnline} />
          <InfoRow label="Opened as" value={device.openedAs} />
          <InfoRow
            label="Secure page"
            value={globalThis.isSecureContext ? "Yes" : "No"}
          />
          <InfoRow
            label="Service worker enabled"
            value={device.serviceWorkerEnabled}
          />
          <InfoRow label="Storage used" value={storage.used} />
          <InfoRow label="Persistence" value={storage.persistence} />
        </dl>
      </PageSection>

      <PageSection title="Built with">
        <dl className="info-list">
          <InfoRow label="ZXing" value={build.zxing} monospace />
          <InfoRow label="React" value={build.react} monospace />
          <InfoRow label="Vite" value={build.vite} monospace />
        </dl>
      </PageSection>
    </Page>
  );
}

// One line of the readout: what it is on the left, what it says on the right.
function InfoRow({
  label,
  value,
  // Commit hashes and version numbers get a typeface that tells 1 from l.
  monospace,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  return (
    <div className="info-row">
      <dt>{label}</dt>
      <dd className={monospace ? "info-value-monospace" : undefined}>
        {value}
      </dd>
    </div>
  );
}

function useDeviceFacts() {
  const [facts, setFacts] = useState(readDeviceFacts);

  // The service worker can take charge a moment after the screen appears, so
  // the answer is read again once, shortly after, rather than only on opening.
  useEffect(() => {
    const timer = setTimeout(() => setFacts(readDeviceFacts()), 500);
    return () => clearTimeout(timer);
  }, []);

  return facts;
}

function readDeviceFacts() {
  return {
    openedAs: isInstalled() ? "PWA (standalone)" : "Browser tab",
    serviceWorkerEnabled: (!!navigator.serviceWorker?.controller).toString(),
  };
}
