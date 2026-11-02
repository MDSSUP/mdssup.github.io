// A pop-up over whatever screen is showing

import "./Modal.css";

export default function Modal({
  title,
  children,
  // The buttons along the bottom. Use ModalAction from Button.tsx for these.
  actions,
  // Called when the form is sent — by the submit button, or by pressing Enter
  // in a text box. Leave it out for a modal with nothing to fill in.
  onSubmit,
}: {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onSubmit?: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.();
        }}
      >
        <h2 className="modal-title">{title}</h2>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </form>
    </div>
  );
}
