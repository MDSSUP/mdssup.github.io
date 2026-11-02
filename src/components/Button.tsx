// The buttons used across the app.

import "./Button.css";

export function Button({
  label,
  icon,
  onClick,
  disabled,
  type = "button",
  // Extra classes, for the specialisations below. Screens should not need it.
  className,
}: {
  label: string;
  // An icon shown before the label. Leave it out for a plain text button.
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      className={className ? `button ${className}` : "button"}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
}

// A button in the row at the bottom of a page. The row divides its width
// between however many of these it holds.
export function PageAction(props: {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return <Button {...props} className="page-action" />;
}

// A button in the row at the bottom of a pop-up. Like PageAction, but a little
// smaller: two of them have to fit the width of the panel.
export function ModalAction(props: {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return <Button {...props} className="modal-action" />;
}

// An icon on its own, for the toolbar over the camera picture. The label is
// not drawn; it is what a screen reader reads out and what a long press shows.
//
// `on` is for a button that stays switched on once tapped, so the icon turns green while it is active.
export function ToolbarButton({
  label,
  icon,
  onClick,
  on,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      className={on ? "toolbar-button toolbar-button-on" : "toolbar-button"}
      aria-label={label}
      title={label}
      aria-pressed={on}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
