// Says whether the device currently has a connection. The app still works
// offline: it uses the copy of the member list saved on the device

import { SignalIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

import { useOnline } from "../../lib/online";
import "./OnlineIndicator.css";

export function OnlineIndicator() {
  const online = useOnline();

  return (
    <span
      className={`online-indicator ${online ? "online" : "offline"}`}
      title={online ? "Online" : "Offline"}
    >
      {online ? <SignalIcon /> : <SignalSlashIcon />}
      {online ? "Online" : "Offline"}
    </span>
  );
}
