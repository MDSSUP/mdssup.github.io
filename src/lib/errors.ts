
// Anything thrown as one of these ends up on screen in front of a person, so
// the wording matters more than usual: say what happened, then what to do.
export class AppError extends Error {
  // What to do about it.
  hint?: string;
  // The help page the error screen offers to open, written the way links in the
  // help pages are: a category, or a category and a topic joined by a slash, e.g. "scanner/troubleshooting".
  help?: string;
  // What the problem is about, which is how the error screen picks an icon.
  about?: "camera" | "page";

  constructor(
    message: string,
    options: {
      hint?: string;
      help?: string;
      about?: "camera" | "page";
    } = {},
  ) {
    super(message);
    this.name = "AppError";
    this.hint = options.hint;
    this.help = options.help;
    this.about = options.about;
  }
}

// Browsers only allow the camera, and only allow the passcode to be hashed, on
// a page they consider secure: https://... or localhost.
export function insecurePageError(): AppError | null {
  if (globalThis.isSecureContext) return null;

  return new AppError("This page isn't secure, so the app can't work", {
    hint:
      "Open it over https, or on localhost. The camera and the passcode are both " +
      "blocked by the browser on an insecure page, so there is nothing the " +
      "app can do about it from here.",
    about: "page",
  });
}

// Whatever was thrown, as something the app can show.
export function asAppError(error: unknown): AppError {
  return error instanceof AppError ? error : new AppError(describeError(error));
}

// Convert an unknown error into a string to display.
export function describeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error !== "") return error;
  if (typeof error === "number" || typeof error === "boolean") {
    return String(error);
  }
  return `Unknown error${error instanceof Object ? ": " + JSON.stringify(error) : ""}`;
}
