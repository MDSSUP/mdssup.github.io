// The help page: a list of topics, and the writing for whichever one is open.
//
// The writing itself lives in src/pages/help — one file per category. To add to it,
// open one of those files; nothing here needs changing.

import { useState } from "react";

import { PageAction } from "../../components/Button";
import Page, { PageSection } from "../../components/Page";
import { HelpLink, HelpNav } from "./writing";
import General from "./general";
import Scanner from "./scanner";
import GoogleSheets from "./google_sheets";
import type { HelpCategory, HelpEntry } from "./types";

import "./HelpPage.css";

// Every category, in the order they are listed. Add a new one here once its
// file exists in src/pages/help.
const categories: HelpCategory[] = [General, Scanner, GoogleSheets];

// Drawn in place of whatever was showing — by App when a screen opens help, and
// by the error screen — and `onClose` goes back to it.
export default function HelpPage({
  onClose,
  // The page to open on, rather than the list of topics: a category id such
  // as "scanner", or a category and a topic such as "scanner/log". The error
  // screen uses this to open help at whatever went wrong.
  initialOpen,
}: {
  onClose: () => void;
  initialOpen?: string;
}) {
  // What is open: nothing (the list of topics), a category id such as
  // "scanner", or a category and a topic such as "scanner/log".
  const [openId, setOpenId] = useState<string | null>(initialOpen ?? null);

  const [categoryId, entryId] = openId?.split("/") ?? [];
  const category: HelpCategory | undefined = categories.find(
    (c) => c.id === categoryId,
  );
  const entry: HelpEntry | undefined = category?.entries.find(
    (e) => e.id === entryId,
  );

  // An id that names nothing shows the list of topics (or the category) instead,
  // which from the outside looks like the Help button simply not working. Said
  // out loud while developing, because the ids are plain strings written by
  // hand in whichever file raised the error.
  if (
    import.meta.env.DEV &&
    openId !== null &&
    (category === undefined || (entryId !== undefined && entry === undefined))
  ) {
    console.warn(
      `No help page is called "${openId}". Check the id against the ` +
        `categories in pages/help, and whatever asked for this page.`,
    );
  }

  // Back steps up the hierarchy — a topic to its category, a category to the
  // list — rather than retracing however someone arrived here.
  const parentId = entry ? categoryId : null;

  const title = entry?.title ?? category?.title;

  return (
    <HelpNav go={setOpenId}>
      <Page
        title={"Help" + (title ? `: ${title}` : "")}
        subtitle={openId ?? undefined}
        actions={
          <>
            <PageAction label="Close" onClick={() => onClose()} />
            <PageAction
              label="Back"
              onClick={() => setOpenId(parentId)}
              disabled={!openId}
            />
          </>
        }
      >
        {entry ? (
          <>
            <div className="help-body">{entry.body}</div>
            {category && category.entries.length > 0 && (
              <PageSection title="In this category:">
                <EntryList category={category} />
              </PageSection>
            )}
          </>
        ) : category ? (
          <>
            {category.body && <div className="help-body">{category.body}</div>}
            {category.entries.length > 0 && (
              <PageSection title="In this category:">
                <EntryList category={category} />
              </PageSection>
            )}
          </>
        ) : (
          <>
            <p>
              Welcome to the help page. Please select a topic from the list
              below.
            </p>

            {categories.map((c) => (
              <PageSection
                key={c.id}
                title={<HelpLink to={c.id}>{c.title}</HelpLink>}
              >
                <EntryList category={c} />
              </PageSection>
            ))}
          </>
        )}
      </Page>
    </HelpNav>
  );
}

// The topics within one category, as links.
function EntryList({ category }: { category: HelpCategory }) {
  return (
    <ul className="help-topic-list">
      {category.entries.map((entry) => (
        <li key={entry.id}>
          <HelpLink to={`${category.id}/${entry.id}`}>{entry.title}</HelpLink>
        </li>
      ))}
    </ul>
  );
}
