// The pop-up for typing a student ID in by hand, for cards that won't scan.

import { useState } from "react";

import { ModalAction } from "../../components/Button";
import Modal from "../../components/Modal";
import { STUDENT_ID_PATTERN } from "../../config";
import "./ManualEntry.css";

export default function ManualEntry({
  onEntered,
  onCancel,
}: {
  onEntered: (studentId: string) => void;
  onCancel: () => void;
}) {
  const [studentId, setStudentId] = useState("");
  const valid = STUDENT_ID_PATTERN.test(studentId);

  return (
    <Modal
      title="Type the ID in"
      onSubmit={() => {
        if (valid) onEntered(studentId);
      }}
      actions={
        <>
          <ModalAction label="Cancel" onClick={onCancel} />
          <ModalAction label="Look up" type="submit" disabled={!valid} />
        </>
      }
    >
      <p>The 8-digit number printed under the photo.</p>
      <input
        className="manual-entry-input"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        aria-label="Student ID"
        value={studentId}
        onChange={(event) => setStudentId(event.target.value.trim())}
      />
    </Modal>
  );
}
