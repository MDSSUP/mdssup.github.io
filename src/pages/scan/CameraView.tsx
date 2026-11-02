// The camera picture, and what is shown until it arrives.

import { useCamera } from "./camera";
import { Spinner } from "./Spinner";
import "./CameraView.css";

export default function CameraView({
  video,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
}) {
  useCamera(video);

  return (
    <div className="scanner-display">
      {/* Sits behind the video, so the camera picture covers it as soon as
          the first frame arrives. */}
      <div className="scanner-loading">
        <Spinner />
        <p>Starting the camera…</p>
      </div>
      <video ref={video} autoPlay playsInline muted className="scanner-video" />
    </div>
  );
}
