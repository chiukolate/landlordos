"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Unit = {
  unit: string;
  floor: string;
  rent: number | null;
  status?: string;
  notes?: string | null;
};

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
};

type Lease = {
  id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  security_deposit: number | null;
  status: string;
  notes: string | null;
  tenants: Tenant | null;
};

export default function UnitDetails({
  unit,
  activeLease,
  leaseError,
}: {
  unit: Unit;
  activeLease: Lease | null;
  leaseError: string;
}) {
  const [savedRent, setSavedRent] = useState<number | null>(
    unit.rent
  );

  const [savedStatus, setSavedStatus] = useState(
    unit.status ?? "VACANT"
  );

  const [savedNotes, setSavedNotes] = useState(
    unit.notes ?? ""
  );

  const [rent, setRent] = useState(
    unit.rent !== null ? String(unit.rent) : ""
  );

  const [status, setStatus] = useState(
    unit.status ?? "VACANT"
  );

  const [notes, setNotes] = useState(
    unit.notes ?? ""
  );

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [endingLease, setEndingLease] = useState(false);
  const [leaseEndError, setLeaseEndError] = useState("");

  function handleEdit() {
    setRent(
      savedRent !== null ? String(savedRent) : ""
    );

    setStatus(savedStatus);
    setNotes(savedNotes);

    setSaved(false);
    setError("");
    setIsEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");

    const updatedRent =
      rent.trim() === "" ? null : Number(rent);

    if (
      updatedRent !== null &&
      Number.isNaN(updatedRent)
    ) {
      setError("Please enter a valid rent amount.");
      setSaving(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("units")
      .update({
        monthly_rent: updatedRent,
        status,
        notes: notes.trim() === "" ? null : notes.trim(),
      })
      .eq("unit_number", unit.unit);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setSavedRent(updatedRent);
    setSavedStatus(status);
    setSavedNotes(notes);

    setIsEditing(false);
    setSaved(true);
    setSaving(false);

    window.location.reload();
  }

  function handleCancel() {
    setRent(
      savedRent !== null ? String(savedRent) : ""
    );

    setStatus(savedStatus);
    setNotes(savedNotes);

    setIsEditing(false);
    setSaved(false);
    setError("");
  }

  async function handleEndLease() {
    if (!activeLease) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this lease? The lease will be marked as ENDED and the unit will become VACANT."
    );

    if (!confirmed) {
      return;
    }

    setEndingLease(true);
    setLeaseEndError("");

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const { error: leaseUpdateError } = await supabase
      .from("leases")
      .update({
        status: "ENDED",
        end_date: today,
      })
      .eq("id", activeLease.id);

    if (leaseUpdateError) {
      setLeaseEndError(
        `Unable to end the lease: ${leaseUpdateError.message}`
      );
      setEndingLease(false);
      return;
    }

    const { error: unitUpdateError } = await supabase
      .from("units")
      .update({
        status: "VACANT",
      })
      .eq("unit_number", unit.unit);

    if (unitUpdateError) {
      setLeaseEndError(
        `The lease was ended, but the unit could not be marked as vacant: ${unitUpdateError.message}`
      );
      setEndingLease(false);
      return;
    }

    window.location.reload();
  }

  const tenant = activeLease?.tenants ?? null;

  return (
    <>
      {/* Unit Information */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Monthly Rent
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {savedRent !== null
              ? `₱${savedRent.toLocaleString()}`
              : "Unknown"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Status
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {savedStatus}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Floor
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {unit.floor}
          </p>
        </div>
      </section>

      {/* Edit Button */}
      <div className="mt-6 flex flex-col items-end gap-2">
        <button
          onClick={handleEdit}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Edit Unit
        </button>

        {saved && (
          <p className="text-sm text-green-600">
            Changes saved successfully.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      {/* Tenant & Lease */}
      <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tenant & Lease
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current tenant and rental agreement
            </p>
          </div>

          {activeLease && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              Active
            </span>
          )}
        </div>

        {leaseError ? (
          <div className="mt-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">
              Unable to load lease information.
            </p>

            <p className="mt-1 text-xs text-red-600">
              {leaseError}
            </p>
          </div>
        ) : activeLease ? (
          <div className="mt-6">
            {/* Tenant */}
            <div className="border-b border-gray-100 pb-6">
              <p className="text-sm text-gray-500">
                Tenant
              </p>

              {tenant ? (
                <>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {tenant.first_name} {tenant.last_name}
                  </p>

                  {tenant.phone && (
                    <p className="mt-1 text-sm text-gray-600">
                      {tenant.phone}
                    </p>
                  )}

                  {tenant.email && (
                    <p className="mt-1 text-sm text-gray-600">
                      {tenant.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Tenant information unavailable
                </p>
              )}
            </div>

            {/* Lease Details */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Lease Start
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {new Date(
                    activeLease.start_date
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Lease End
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {activeLease.end_date
                    ? new Date(
                        activeLease.end_date
                      ).toLocaleDateString()
                    : "No end date"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Lease Rent
                </p>

                <p className="mt-1 text-xl font-bold text-gray-900">
                  ₱
                  {Number(
                    activeLease.monthly_rent
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Security Deposit
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {activeLease.security_deposit !==
                  null
                    ? `₱${Number(
                        activeLease.security_deposit
                      ).toLocaleString()}`
                    : "Not specified"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">
                  Lease Notes
                </p>

                <p className="mt-1 whitespace-pre-wrap text-gray-600">
                  {activeLease.notes ||
                    "No lease notes added."}
                </p>
              </div>
            </div>

            {/* End Lease */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Lease Actions
              </h3>

              <button
                type="button"
                onClick={handleEndLease}
                disabled={endingLease}
                className="mt-3 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {endingLease
                  ? "Ending Lease..."
                  : "End Lease"}
              </button>

              {leaseEndError && (
                <p className="mt-2 text-sm text-red-600">
                  {leaseEndError}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="font-medium text-gray-900">
              No tenant is currently assigned
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This unit does not have an active lease.
            </p>
          </div>
        )}
      </section>

      {/* Payment History */}
      <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Payment History
        </h2>

        <p className="mt-2 text-gray-600">
          No payments recorded yet.
        </p>
      </section>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Unit {unit.unit}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the information for this unit.
              </p>
            </div>

            <div className="space-y-5">
              {/* Unit Number */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Unit Number
                </label>

                <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  Unit {unit.unit}
                </div>
              </div>

              {/* Floor */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Floor
                </label>

                <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                  {unit.floor}
                </div>
              </div>

              {/* Monthly Rent */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Monthly Rent
                </label>

                <input
                  type="number"
                  min="0"
                  value={rent}
                  onChange={(e) =>
                    setRent(e.target.value)
                  }
                  placeholder="Leave blank if unknown"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Leave blank if the monthly rent is unknown.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                >
                  <option value="VACANT">
                    Vacant
                  </option>

                  <option value="OCCUPIED">
                    Occupied
                  </option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  rows={3}
                  placeholder="Add any notes about this unit..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}