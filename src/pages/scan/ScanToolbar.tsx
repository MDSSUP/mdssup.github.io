// The row of buttons along the top of the scan screen.

import {
  Cog6ToothIcon,
  CreditCardIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";

import { useNavigation } from "../../app/navigation";
import { ToolbarButton } from "../../components/Button";
import { OnlineIndicator } from "./OnlineIndicator";
import "./ScanToolbar.css";

export default function ScanToolbar({
  guideShowing,
  onToggleGuide,
  onManualEntry,
}: {
  guideShowing: boolean;
  onToggleGuide: () => void;
  onManualEntry: () => void;
}) {
  const { go, openHelp } = useNavigation();

  return (
    <div className="scanner-toolbar">
      <ToolbarButton
        label="Settings"
        icon={<Cog6ToothIcon />}
        onClick={() => go("settings")}
      />
      <ToolbarButton
        label={guideShowing ? "Hide the card outline" : "Show the card outline"}
        icon={<ViewfinderCircleIcon />}
        on={guideShowing}
        onClick={onToggleGuide}
      />
      <ToolbarButton
        label="Manual Entry"
        icon={<PencilSquareIcon />}
        onClick={onManualEntry}
      />
      <ToolbarButton
        label="Scanned today"
        icon={<CreditCardIcon />}
        onClick={() => go("log")}
      />
      <ToolbarButton
        label="Help"
        icon={<QuestionMarkCircleIcon />}
        onClick={() => openHelp()}
      />
      <OnlineIndicator />
    </div>
  );
}
