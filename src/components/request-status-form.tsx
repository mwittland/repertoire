"use client";

import { useState } from "react";

export type RequestStatus = "pending" | "approved" | "rejected";
type StatusAction = (formData: FormData) => void | Promise<void>;

export function RequestStatusForm({
  requestId,
  status,
  action,
}: {
  requestId: string;
  status: RequestStatus;
  action: StatusAction;
}) {
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(status);
  return (
    <form
      action={action}
      className="mt-5 flex items-center gap-3 border-t border-[var(--line)] pt-5"
    >
      <input type="hidden" name="requestId" value={requestId} />
      <label className="text-sm text-[var(--muted)]">
        Status
        <select
          name="status"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as RequestStatus)
          }
          className="ml-2 rounded-lg border border-[var(--line)] bg-transparent px-2 py-1 text-[var(--ink)]"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <button className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-bold text-white">
        Save
      </button>
    </form>
  );
}
