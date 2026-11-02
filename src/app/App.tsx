import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { isUnlocked, lock } from "../lib/auth";
import { chooseBrowser, choseBrowser, isInstalled } from "../lib/device";
import { asAppError, insecurePageError } from "../lib/errors";
import {
  isStale,
  loadSavedMembers,
  refreshMembers,
  type MemberList,
  type Refresh,
} from "../lib/members";
import type { ScanLogEntry } from "../lib/scans";
import HelpPage from "../pages/help/HelpPage";
import InfoPage from "../pages/info/InfoPage";
import InstallPage from "../pages/install/InstallPage";
import ScanLog from "../pages/log/ScanLog";
import MemberListPage from "../pages/members/MemberListPage";
import PasscodePage from "../pages/passcode/PasscodePage";
import ScanPage from "../pages/scan/ScanPage";
import SettingsPage from "../pages/settings/SettingsPage";
import ErrorScreen from "./ErrorScreen";
import MemberPrompt from "./MemberPrompt";
import NavigationContext, { PARENT, type Screen } from "./navigation";

export default function App() {
  // Past the "add this to your home screen" screen: opened from the icon, or
  // "Continue in the browser" was pressed in this tab.
  const [pastInstall, setPastInstall] = useState(
    () => isInstalled() || choseBrowser(),
  );
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [screen, setScreen] = useState<Screen>("scan");
  // Whether the help page is open, and at which topic. It is drawn in place of
  // the screen underneath, which is left as it was so Close can go back to it.
  const [help, setHelp] = useState<{ topic?: string } | null>(null);
  // The copy saved on this device, read straight away rather than awaited, so
  // the list is on screen from the very first frame.
  const [memberList, setMemberList] = useState<MemberList | null>(
    loadSavedMembers,
  );
  // A failed refresh stays "failed" until the next attempt, wherever it is seen
  // from — it is still true until then.
  const [refresh, setRefresh] = useState<Refresh>({ status: "idle" });
  const [scanLog, setScanLog] = useState<ScanLogEntry[]>([]);
  // Whether the "your list is missing or old" pop-up may still show. Dismissing
  // it lasts for as long as the app stays open.
  const [prompting, setPrompting] = useState(true);

  // Behind the "Refresh" button, on the settings screen and in the pop-up.
  const startRefresh = async () => {
    setRefresh({ status: "working" });
    try {
      setMemberList(await refreshMembers());
      setRefresh({ status: "idle" });
      setPrompting(false);
    } catch (error) {
      console.warn("Could not download the member list", error);
      setRefresh({ status: "failed", error: asAppError(error) });
    }
  };

  const navigation = {
    go: (next: Screen) => setScreen(next),
    back: () => setScreen(PARENT[screen]),
    openHelp: (topic?: string) => setHelp({ topic }),
  };

  // The pop-up shows when there is nothing to scan against, or when what there
  // is has got old enough to be worth asking about.
  const askAboutList =
    prompting && (memberList === null || isStale(memberList));

  // Before anything else, make sure we are in a secure context (to gain access to the camera and crypto.subtle)
  const insecure = insecurePageError();
  if (insecure !== null) {
    return (
      <ErrorScreen
        error={insecure}
        resetErrorBoundary={() => globalThis.location.reload()}
      />
    );
  }

  if (!pastInstall) {
    return (
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <InstallPage
          onContinue={() => {
            chooseBrowser();
            setPastInstall(true);
          }}
        />
      </ErrorBoundary>
    );
  }

  if (!unlocked) {
    return (
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <PasscodePage onUnlock={() => setUnlocked(true)} />
      </ErrorBoundary>
    );
  }

  const currentScreen = () => {
    switch (screen) {
      case "settings":
        return (
          <SettingsPage
            memberList={memberList}
            refresh={refresh}
            onRefresh={() => void startRefresh()}
            onLock={() => {
              lock();
              setUnlocked(false);
              setScreen("scan");
            }}
          />
        );
      case "log":
        return <ScanLog entries={scanLog} onClear={() => setScanLog([])} />;
      case "members":
        return <MemberListPage memberList={memberList} />;
      case "info":
        return <InfoPage />;
      case "scan":
        return (
          <ScanPage
            memberList={memberList}
            onScanned={(entry) => setScanLog((log) => [entry, ...log])}
          />
        );
    }
  };

  // Help replaces the screen rather than sitting over it, so the camera turns
  // off while it is open, and it covers the pop-up too — a Help button inside
  // the pop-up would otherwise open the page underneath it.
  if (help !== null) {
    return (
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <HelpPage initialOpen={help.topic} onClose={() => setHelp(null)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorScreen}>
      <NavigationContext value={navigation}>
        {currentScreen()}

        {askAboutList && (
          <MemberPrompt
            memberList={memberList}
            refresh={refresh}
            onRefresh={() => void startRefresh()}
            onDismiss={() => setPrompting(false)}
          />
        )}
      </NavigationContext>
    </ErrorBoundary>
  );
}
