import {
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  VideoCameraSlashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import BuildStamp from "../components/BuildStamp";
import { Button } from "../components/Button";
import { AppError, describeError } from "../lib/errors";
import HelpPage from "../pages/help/HelpPage";
import "./ErrorScreen.css";

export default function ErrorScreen({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  const [helpOpen, setHelpOpen] = useState(false);

  // AppError's can have a help topic attached, which is what the "Help" button opens.
  const help =
    error instanceof AppError
      ? error.help
      // Default to the general troubleshooting page for errors that don't have a specific help topic.
      : "general/troubleshooting";

  if (helpOpen) {
    return <HelpPage initialOpen={help} onClose={() => setHelpOpen(false)} />;
  }

  const footer = (
    <>
      <div className="error-actions">
        <Button label="Try again" onClick={resetErrorBoundary} />
        {help && (
          <Button
            label="Help"
            icon={<QuestionMarkCircleIcon />}
            onClick={() => setHelpOpen(true)}
          />
        )}
      </div>
      <BuildStamp />
    </>
  );

  if (error instanceof AppError) {
    return (
      <div className="error-container">
        <Icon about={error.about} />
        <h1>{error.message}</h1>
        {error.hint && <p>{error.hint}</p>}
        {footer}
      </div>
    );
  }
  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>{describeError(error)}</p>
      {footer}
    </div>
  );
}

// What the error is about, as a picture. An error that doesn't say gets no
// icon rather than a misleading one.
function Icon({ about }: { about?: "camera" | "page" }) {
  if (about === "camera") return <VideoCameraSlashIcon className="error-icon" />;
  if (about === "page") return <ExclamationTriangleIcon className="error-icon" />;
  return null;
}
