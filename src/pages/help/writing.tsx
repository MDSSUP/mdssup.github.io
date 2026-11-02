// The pieces for writing a help page, for the things plain HTML can't do.
//
// Everything else is ordinary JSX: <p> for a paragraph, <ul> and <li> for a
// list, <h3> for a heading part-way down a page, <strong> to stress a word,
// <a href="..."> for a link out to a website.
//
// Icons come from Heroicons (https://heroicons.com) via the @heroicons/react
// package — search the site for a name, then import it, the same way the rest
// of the app does.

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from "react";

import "./writing.css";

// Any Heroicon. Import the one you want and pass it straight in:
//
//   import { CreditCardIcon } from "@heroicons/react/24/outline";
//   <Icon of={CreditCardIcon} />
export type HelpIcon = ComponentType<SVGProps<SVGSVGElement>>;

// One icon, sitting in a line of writing at the size of the writing around it.
// Use it when naming a button that shows no words of its own.
export function Icon({ of: IconComponent }: { of: HelpIcon }) {
  // Hidden from screen readers: the sentence around it already says what it
  // is, so reading the icon out as well would only repeat that.
  return <IconComponent className="help-icon" aria-hidden="true" />;
}

// A picture of one of the app's buttons, sitting in a line of writing. It is
// the real button's appearance, only smaller, so what someone reads here
// matches what they are looking for on screen. It does nothing when tapped.
//
// `label` is the button's name. For the icon-only buttons in the row over the
// camera picture, that is the name their tooltip shows.
export function AppButton({
  of: icon,
  label,
}: {
  of?: HelpIcon;
  label: string;
}) {
  return (
    <span className="button help-app-button">
      {icon && <Icon of={icon} />}
      {label}
    </span>
  );
}

// A table where each row can hide a longer explanation behind an arrow, so
// the table stays readable on a phone and the detail is still a tap away.
//
//   <HelpTable columns={["Issue", "Resolution"]}>
//     <HelpRow cells={["App won't open", "Reset the app"]}>
//       Usually a bad update. Resetting fetches the app again.
//     </HelpRow>
//   </HelpTable>
//
// Give every row the same number of cells as there are columns. A row whose
// explanation is short enough to sit in a cell doesn't need one — leave the
// writing out and that row simply has no arrow.
//
// The arrow sits in the first cell rather than in a column of its own: these
// tables are read on a phone, where a column holding nothing but an arrow is
// width the writing needs more.
export function HelpTable({
  columns,
  children,
}: {
  columns: string[];
  // The rows. Use HelpRow for these.
  children: ReactNode;
}) {
  return (
    // The table scrolls sideways inside this rather than pushing the page
    // wider than the screen.
    <div className="help-table-scroll">
      <table className="help-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        {children}
      </table>
    </div>
  );
}

// One row of a HelpTable. Anything written inside it becomes the explanation
// that the arrow shows and hides, which appears in a strip underneath the
// row itself.
export function HelpRow({
  cells,
  children,
}: {
  cells: ReactNode[];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  // Ties the arrow to the strip it opens, for screen readers.
  const detailsId = useId();

  return (
    // Each row is its own group so that the strip underneath keeps the
    // shading of the row it belongs to, and so the shading still alternates
    // by row rather than counting the open strips as rows of their own.
    <tbody className="help-row">
      <tr>
        {cells.map((cell, index) =>
          // The first cell carries the arrow, when there is anything to show.
          // Tapping anywhere in it opens the strip underneath, so the target
          // is the width of the cell rather than the arrow alone.
          index === 0 && children ? (
            <td key={index}>
              <button
                type="button"
                className="help-row-arrow"
                aria-expanded={open}
                aria-controls={detailsId}
                onClick={() => setOpen((showing) => !showing)}
              >
                {cell}
                <ChevronDownIcon
                  className={open ? "help-icon turned" : "help-icon"}
                  aria-hidden="true"
                />
              </button>
            </td>
          ) : (
            <td key={index}>{cell}</td>
          ),
        )}
      </tr>
      {children && (
        // The strip stays in the table when it is closed rather than being
        // taken out of it, so that opening it doesn't move anything else.
        <tr id={detailsId} className="help-row-details" hidden={!open}>
          <td colSpan={cells.length}>{children}</td>
        </tr>
      )}
    </tbody>
  );
}

// How HelpLink reaches the help page it sits on. Entries don't touch this —
// HelpPage.tsx sets it up once around everything it draws.
const GoToEntry = createContext<(id: string) => void>(() => {});

export function HelpNav({
  go,
  children,
}: {
  go: (id: string) => void;
  children: ReactNode;
}) {
  return <GoToEntry value={go}>{children}</GoToEntry>;
}

// A link to another help page. `to` is the category and the entry joined by a
// slash, as they are written in the files in this folder:
//
//   <HelpLink to="scanner/log">the scanner log</HelpLink>
export function HelpLink({ to, children }: { to: string; children: ReactNode }) {
  const go = useContext(GoToEntry);

  return (
    <button type="button" className="button-link" onClick={() => go(to)}>
      {children}
    </button>
  );
}
