"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type EndLeaseButtonProps = {
  leaseId: string;
  unitId: string;
};

export default function EndLeaseButton({
  leaseId,
  unitId,
}: EndLeaseButtonProps) {
  const router = useRouter();

  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");

  async function handleEndLease() {
    const confirmed = window.confirm(
      "Are you sure you want to end this lease? The unit will be marked as vacant."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setEnding(true);

    const today = new Date().toISOString().split("T")[0];

    const { error: leaseError } = await supabase
      .from("leases")
      .update({
        status: "ENDED",
        end_date: today,
      })
      .eq("id", leaseId);

    if (leaseError) {
      setError(leaseError.message);
      setEnding(false);
      return;
    }

    const { error: unitError } = await supabase
      .from("units")
      .update({
        status: "VACANT",
      })
      .eq("id", unitId);

    if (unitError) {
      setError(
        `Lease was ended, but the unit status could not be updated: ${unitError.message}`
      );
      setEnding(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleEndLease}
        disabled={ending}
        className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {ending ? "Ending Lease..." : "End Lease"}
      </button>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}