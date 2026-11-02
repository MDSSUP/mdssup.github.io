// The card outline drawn over the camera picture

import { useEffect, useRef } from "react";

import { clearCanvas, drawCardGuide } from "./card";
import "./CardGuide.css";

export default function CardGuide({
  showing,
  // Turns the outline green.
  found,
}: {
  showing: boolean;
  found: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null);

  // Draw it, and draw it again whenever the canvas changes size
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;

    const paint = () => {
      if (showing) {
        drawCardGuide(target, found);
      } else {
        clearCanvas(target);
      }
    };

    paint();
    const observer = new ResizeObserver(paint);
    observer.observe(target);
    return () => observer.disconnect();
  }, [showing, found]);

  return (
    <div className="scanner-overlay">
      <canvas ref={canvas} className="scanner-canvas" />
    </div>
  );
}
