// The member list as the app actually holds it, with a search box.

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { useNavigation } from "../../app/navigation";
import { PageAction } from "../../components/Button";
import Page from "../../components/Page";
import "./MemberListPage.css";
import { plural } from "../../lib/format";
import type { Member, MemberList } from "../../lib/members";
import { displayName, paidVerdict } from "../../lib/scans";

export default function MemberListPage({
  memberList,
}: {
  memberList: MemberList | null;
}) {
  const { back } = useNavigation();
  const [search, setSearch] = useState("");

  const backButton = (
    <PageAction label="Back" icon={<ArrowLeftIcon />} onClick={back} />
  );

  if (memberList === null) {
    return (
      <Page title="Member list" actions={backButton}>
        <p>
          There is no member list on this device yet. Download one from the
          settings screen.
        </p>
      </Page>
    );
  }

  const wanted = search.trim().toLowerCase();
  const shown =
    wanted === ""
      ? memberList.members
      : memberList.members.filter(
          (member) =>
            member.studentId.includes(wanted) ||
            member.name.toLowerCase().includes(wanted),
        );

  return (
    <Page title="Member list" actions={backButton}>
      <p>
        {memberList.members.length}{" "}
        {plural(memberList.members.length, "person", "people")}, from "
        {memberList.sheetName}".
      </p>

      <input
        className="member-list-search"
        type="search"
        autoComplete="off"
        aria-label="Search by number or name"
        placeholder="Search by number or name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {wanted !== "" && (
        <p className="member-list-matches">
          {shown.length === 0
            ? "Nothing on the list matches that."
            : `${shown.length} of ${memberList.members.length} match.`}
        </p>
      )}

      <ol className="member-list-rows">
        {shown.map((member) => (
          <li key={member.studentId}>
            <span className="member-list-who">
              <code>{member.studentId}</code>
              <span>{displayName(member)}</span>
            </span>
            <Says member={member} />
          </li>
        ))}
      </ol>
    </Page>
  );
}

function Says({ member }: { member: Member }) {
  const verdict = paidVerdict(member);

  return (
    <span className="member-list-says">
      <span className={`member-list-verdict tone-${verdict.tone}`}>
        {verdict.words}
      </span>
      {member.membership !== "" && <span>{member.membership}</span>}
    </span>
  );
}
