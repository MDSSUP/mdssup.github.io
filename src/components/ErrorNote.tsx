// A problem shown in place, on the screen that caused it, rather than instead
// of everything else.

import type { AppError } from "../lib/errors";
import { Button } from "./Button";
import "./ErrorNote.css";

export default function ErrorNote({
  error,
  onOpenHelp,
}: {
  error: AppError;
  onOpenHelp?: (help: string) => void;
}) {
  const help = error.help;

  return (
    <div className="error-note">
      <p className="error-note-message">{error.message}</p>
      {error.hint !== undefined && (
        <p className="error-note-hint">{error.hint}</p>
      )}
      {help !== undefined && onOpenHelp !== undefined && (
        <Button label="Help" onClick={() => onOpenHelp(help)} />
      )}
    </div>
  );
}
