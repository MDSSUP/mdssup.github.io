// The shape of the help pages.
//
// Each category is one file in this folder — open general.tsx to see what one
// looks like — and HelpPage.tsx gathers them into the list of topics you see
// when you open Help.

import type { ReactNode } from "react";

export type HelpCategory = {
  // The short name used in links, e.g. the "scanner" of "scanner/log".
  // Lower case, no spaces.
  id: string;
  // The heading this category's topics are listed under, and the name of its
  // own page.
  title: string;
  // The category's own writing, shown above the list of its topics when
  // someone opens it. This is the place for whatever holds for the whole
  // subject — what the scanner is and how it is used — so that it doesn't
  // need a topic of its own called "Overview" or "Usage". Leave it out and
  // the category is only a list of its topics.
  body?: ReactNode;
  entries: HelpEntry[];
};

export type HelpEntry = {
  // The short name used in links, e.g. the "log" of "scanner/log".
  id: string;
  // The name of the topic, shown in the list and at the top of the page.
  title: string;
  // The writing itself, as ordinary JSX: paragraphs in <p>, lists in <ul> and
  // <li>, a smaller heading in <h3>. writing.tsx has the few pieces plain
  // HTML can't do — links to other help pages, and pictures of the app's own
  // buttons.
  body: ReactNode;
};
