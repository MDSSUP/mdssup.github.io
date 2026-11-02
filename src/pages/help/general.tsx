// The help pages that aren't about any one part of the app.

import { QrCodeIcon, SignalSlashIcon } from "@heroicons/react/24/outline";

import { ADMIN_NAME } from "../../config";
import { AppButton, HelpLink, Icon } from "./writing";
import type { HelpCategory } from "./types";

const General: HelpCategory = {
  id: "general",
  title: "General",
  body: (
    <>
      <p>
        This app checks student IDs against the society's member list. It reads
        the barcode on a student card with the device's camera, or takes a
        number typed in by hand.
      </p>
      <p>
        To get started, see <HelpLink to="scanner">Scanner</HelpLink>.
      </p>
      <p>
        For questions or problems, contact the{" "}
        <HelpLink to="general/contact">administrator</HelpLink>.
      </p>
    </>
  ),
  entries: [
    {
      id: "unlocking",
      title: "Unlocking this device",
      body: (
        <>
          <p>
            The first time the app is opened on a device, it asks for a
            passcode. If you don't have it, ask the{" "}
            <HelpLink to="general/contact">administrator</HelpLink>.
          </p>
          <p>
            It does not ask again until the device is locked or reset, or the
            passcode changes.
          </p>
          <h3>Locking it again</h3>
          <p>
            To return a device to the passcode screen, for example before
            handing it on, press <AppButton label="Lock" /> in{" "}
            <strong>Settings &gt; This device</strong>.
          </p>
          <p>
            If the passcode is ever changed, every device is asked for the new
            one the next time it is opened.
          </p>
          <p>
            The passcode stops someone who picks up the device from using the
            app. It does not keep the member list private.
          </p>
        </>
      ),
    },
    {
      id: "installing",
      title: "Installing the app",
      body: (
        <>
          <p>
            The app can be added to the device's home screen. It then opens
            from an icon rather than from a browser, and fills the screen with
            no address bar.
          </p>
          <p>
            This is the intended way to use the app. Opened in a browser tab,
            it first asks to be added to the home screen.{" "}
            <AppButton label="Continue in the browser" /> skips that until the
            tab is closed.
          </p>
          <h3>How to add it</h3>
          <ul>
            <li>
              <strong>iPhone or iPad (Safari):</strong> press the Share button,
              then <strong>Add to Home Screen</strong>.
            </li>
            <li>
              <strong>Android (Chrome):</strong> open the menu, then{" "}
              <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong>.
            </li>
          </ul>
          <p>
            The app is called <strong>Scanner</strong> once it is on the home
            screen.
          </p>
          <p>
            A link tapped inside WhatsApp, Instagram or a similar app opens in
            that app's own browser, which can't add it to the home screen. Open
            it in Safari or Chrome instead. On an iPhone, add it before entering
            the passcode: the home-screen app doesn't share anything with
            Safari, so it asks again.
          </p>
          <h3>Passing it on</h3>
          <p>
            <AppButton of={QrCodeIcon} label="Show QR code" /> in{" "}
            <strong>Settings &gt; Share this app</strong> shows a QR code of
            the app's address. Scanned with another phone's camera, it opens
            the app in that phone's browser, ready to add to the home screen.
            The new phone still needs the passcode.
          </p>
          <h3>Updates and connections</h3>
          <p>
            Updates are automatic. The app uses the newest version the next
            time it is opened.
          </p>
          <p>
            Installing it also keeps a copy on the device, so it opens quickly
            and copes better with a patchy connection. This is a convenience,
            not something to depend on: refresh the member list while you have a
            connection, and don't expect the app to be usable without one.
          </p>
          <p>
            The <Icon of={SignalSlashIcon} /> <strong>Offline</strong> mark at
            the end of the row of buttons shows whether the device currently has
            a connection. It is not a button. It explains why refreshing the
            member list may not work.
          </p>
        </>
      ),
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      body: (
        <>
          <p>
            Most problems belong to one part of the app. Start with the closest
            match:
          </p>
          <ul>
            <li>
              <HelpLink to="scanner/troubleshooting">
                Scanner troubleshooting
              </HelpLink>{" "}
              — the camera won't start, or a card won't scan.
            </li>
            <li>
              <HelpLink to="google-sheets/troubleshooting">
                Member list troubleshooting
              </HelpLink>{" "}
              — the member data is wrong or out of date, or the sheet can't be
              reached.
            </li>
            <li>
              <HelpLink to="scanner/results">Reading a result</HelpLink> — the
              app scanned something, but the answer on screen isn't what you
              expected.
            </li>
            <li>
              <HelpLink to="general/unlocking">Unlocking this device</HelpLink>{" "}
              — the app is asking for a passcode.
            </li>
          </ul>
          <p>
            If none of those covers it, contact the{" "}
            <HelpLink to="general/contact">administrator</HelpLink>.
          </p>
          <h3>Last resort: resetting the app</h3>
          <p>
            <AppButton label="Reset" /> in{" "}
            <strong>Settings &gt; This Device &gt; Reset app</strong> clears
            everything the app has saved on this device and starts it over.
          </p>
          <p>
            Use it only when nothing else has worked. It clears the member list
            and the saved unlock, so afterwards the device needs the passcode
            and a connection to download the member list again. Avoid doing it
            during an event.
          </p>
        </>
      ),
    },
    {
      id: "contact",
      title: "Getting help",
      body: (
        <>
          <p>
            The administrator for this app is <strong>{ADMIN_NAME}</strong>.
            Contact them for the passcode, for questions, or for problems the
            other help pages don't cover.
          </p>
        </>
      ),
    },
  ],
};

export default General;
