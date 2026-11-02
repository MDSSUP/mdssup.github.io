// The pop-up with a QR code of the app's own address, so that anyone who
// already has the app can pass it on.

import qrcode from "qrcode-generator";

import { ModalAction } from "../../components/Button";
import Modal from "../../components/Modal";
import "./ShareModal.css";

// The blank border a QR code needs around it to be read, in squares. Four is
// what the QR standard asks for.
const QUIET_ZONE = 4;

export default function ShareModal({ onClose }: { onClose: () => void }) {
  // The address this copy was opened from, rather than one written down in a
  // setting, so the code is right wherever the app is hosted and there is
  // nothing to update if it moves.
  const address = window.location.href;

  return (
    <Modal
      title="Share this app"
      actions={<ModalAction label="Close" onClick={onClose} />}
    >
      <QrCode text={address} />
      <p className="share-address">{address}</p>
      <p>
        Scan it with a phone's camera. It opens in Safari or Chrome, where the
        app can be added to the home screen. The passcode is still needed.
      </p>
    </Modal>
  );
}

// Drawn as one shape of black squares on a white background. The white
// matters: the app's dark background would leave the code unreadable to most
// cameras.
function QrCode({ text }: { text: string }) {
  // 0 picks the smallest size that fits; "M" survives some glare or smudging.
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const count = qr.getModuleCount();
  let squares = "";
  for (let row = 0; row < count; row += 1) {
    for (let column = 0; column < count; column += 1) {
      if (qr.isDark(row, column)) squares += `M${column} ${row}h1v1h-1z`;
    }
  }

  const size = count + QUIET_ZONE * 2;
  return (
    <svg
      className="share-qr"
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${size} ${size}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR code for ${text}`}
    >
      <rect
        x={-QUIET_ZONE}
        y={-QUIET_ZONE}
        width={size}
        height={size}
        fill="white"
      />
      <path d={squares} fill="black" />
    </svg>
  );
}
