// The "enter the passcode" screen

import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { unlock } from "../../lib/auth";
import { asAppError, type AppError } from "../../lib/errors";
import BuildStamp from "../../components/BuildStamp";
import { Button } from "../../components/Button";
import ErrorNote from "../../components/ErrorNote";
import { ADMIN_NAME } from "../../config";
import "../../components/Page.css";
import "./PasscodePage.css";

export default function PasscodePage({ onUnlock }: { onUnlock: () => void }) {
  const [passcode, setPasscode] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);
  const [trouble, setTrouble] = useState<AppError | null>(null);

  const submit = async (event: React.SubmitEvent) => {
    event.preventDefault();
    setChecking(true);
    setTrouble(null);

    let correct: boolean;
    try {
      correct = await unlock(passcode);
    } catch (reason) {
      console.error("Could not check the passcode", reason);
      setTrouble(asAppError(reason));
      setChecking(false);
      return;
    }
    setChecking(false);

    if (correct) {
      onUnlock();
      return;
    }
    setWrong(true);
    setPasscode("");
  };

  return (
    <form className="page passcode-page" onSubmit={submit}>
      <LockClosedIcon className="passcode-hero" />
      <h1 className="page-title">Membership Scanner</h1>
      <p>Enter the passcode to use this device.</p>
      <input
        className="passcode-input"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        aria-label="Passcode"
        value={passcode}
        onChange={(event) => {
          setPasscode(event.target.value);
          setWrong(false);
        }}
      />
      {wrong && <p className="passcode-error">That passcode isn't right.</p>}
      {trouble !== null && <ErrorNote error={trouble} />}
      <Button
        label={checking ? "Checking…" : "Unlock"}
        type="submit"
        disabled={checking || passcode.length === 0}
      />
      <p className="passcode-help">
        Don't have the passcode? Ask {ADMIN_NAME}.
      </p>
      <BuildStamp />
    </form>
  );
}
