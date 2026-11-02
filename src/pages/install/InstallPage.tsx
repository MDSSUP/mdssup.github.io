// The screen a browser tab shows before anything else, asking for the app to
// be added to the home screen.
//
// The home-screen app is the intended way to use this, and nudging everyone
// onto it keeps them on the same thing when something goes wrong. The app
// sets no policy about it, though, and asks rather than insists:
// a browser tab is still the fallback if an installed copy misbehaves in the
// middle of an event, and some browsers can't install anything at all.
//
// It comes before the passcode on purpose. An iPhone's home-screen app doesn't
// share anything with Safari, so unlocking in Safari first means unlocking
// twice.

import { DevicePhoneMobileIcon } from "@heroicons/react/24/outline";

import BuildStamp from "../../components/BuildStamp";
import { Button } from "../../components/Button";
import "../../components/Page.css";
import "./InstallPage.css";

export default function InstallPage({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="page install-page">
      <DevicePhoneMobileIcon className="install-hero" />
      <h1 className="page-title">Add this to your home screen</h1>
      <p>
        The app is meant to be opened from an icon on the home screen. It then
        fills the screen and opens straight away.
      </p>
      <ul className="install-steps">
        <li>
          <strong>iPhone or iPad:</strong> in Safari, press the Share button,
          then <strong>Add to Home Screen</strong>.
        </li>
        <li>
          <strong>Android:</strong> in Chrome, open the menu, then{" "}
          <strong>Install app</strong> or <strong>Add to Home screen</strong>.
        </li>
      </ul>
      <p>
        Then open it from the new <strong>Scanner</strong> icon. If this page
        was opened from a link in WhatsApp, Instagram or similar, open it in
        Safari or Chrome first; those apps' own browsers can't add it.
      </p>
      <Button label="Continue in the browser" onClick={onContinue} />
      <BuildStamp />
    </div>
  );
}
