// The shape every plain screen takes: a heading, the content in its own
// scrolling area below it, and a row of full-width buttons along the bottom
//
// The scanning screen is not one of these, see pages/scan/ScanPage.tsx.

import "./Page.css";

export default function Page({
  title,
  children,
  // The buttons along the bottom. Use PageAction from Button.tsx for these.
  actions,
  subtitle,
}: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="page">
      <div>
        {subtitle && <h6 className="page-subtitle">{subtitle}</h6>}
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="page-content">{children}</div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

// One block of a page, under its own smaller heading, with a line above it
// separating it from the block before.
export function PageSection({
  title,
  children,
}: {
  // Usually just the words of the heading. The help page puts a link here so
  // that the heading itself opens the category it names.
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="page-section">
      <h2 className="page-section-title">{title}</h2>
      {children}
    </section>
  );
}
