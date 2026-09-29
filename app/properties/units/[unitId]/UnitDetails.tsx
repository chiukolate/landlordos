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
  const [isEditing, setIsEditing] = useState(false);
  const [unitNumber, setUnitNumber] = useState(unit.unit);
  const [floor, setFloor] = useState(unit.floor);
  const [rent, setRent] = useState(
    unit.rent !== null ? String(unit.rent) : ""
  );
  const [notes, setNotes] = useState(unit.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [endingLease, setEndingLease] = useState(false);
  const [endLeaseMessage, setEndLeaseMessage] = useState("");

  const tenant = activeLease?.tenants ?? null;

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("units")
      .update({
        unit_number: unitNumber,
        floor,
        monthly_rent: rent === "" ? null : Number(rent),
        notes: notes || null,
      })
      .eq("unit_number", unit.unit);

    if (error) {
      setMessage(`Error: ${error.message}`);
      setSaving(false);
      return;
    }

    setMessage("Unit updated successfully.");
    setSaving(false);
    setIsEditing(false);

    window.location.reload();
  }

  async function handleEndLease() {
    if (!activeLease) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to end this lease?"
    );

    if (!confirmed) {
      return;
    }

    setEndingLease(true);
    setEndLeaseMessage("");

    const today = new Date().toISOString().split("T")[0];

    const { error: leaseError } = await supabase
      .from("leases")
      .update({
        status: "ENDED",
        end_date: today,
      })
      .eq("id", activeLease.id);

    if (leaseError) {
      setEndLeaseMessage(
        `Error ending lease: ${leaseError.message}`
      );
      setEndingLease(false);
      return;
    }

    const { error: unitError } = await supabase
      .from("units")
      .update({
        status: "VACANT",
      })
      .eq("unit_number", unit.unit);

    if (unitError) {
      setEndLeaseMessage(
        `Lease ended, but unit status could not be updated: ${unitError.message}`
      );
      setEndingLease(false);
      return;
    }

    setEndLeaseMessage("Lease ended successfully.");
    setEndingLease(false);

    window.location.reload();
  }

  return (
    <div className="space-y-6">
      {/* Unit Information */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Unit Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic information and rental details for this unit.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Edit Unit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit Number
              </label>

              <input
                type="text"
                value={unitNumber}
                onChange={(e) =>
                  setUnitNumber(e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Floor
              </label>

              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monthly Rent
              </label>

              <input
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>

            {message && (
              <p className="text-sm text-gray-600">
                {message}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setUnitNumber(unit.unit);
                  setFloor(unit.floor);
                  setRent(
                    unit.rent !== null
                      ? String(unit.rent)
                      : ""
                  );
                  setNotes(unit.notes ?? "");
                  setMessage("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Unit Number
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {unit.unit}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Floor
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {unit.floor}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Monthly Rent
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {unit.rent !== null
                  ? `₱${Number(
                      unit.rent
                    ).toLocaleString()}`
                  : "Not set"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    unit.status === "OCCUPIED"
                      ? "bg-green-100 text-green-700"
                      : unit.status === "VACANT"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {unit.status ?? "UNKNOWN"}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">
                Notes
              </p>

              <p className="mt-1 text-gray-700">
                {unit.notes || "No notes"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Active Lease */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Current Lease
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current tenant and lease information.
            </p>
          </div>

          {activeLease && (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              ACTIVE
            </span>
          )}
        </div>

        {leaseError ? (
          <div className="mt-6 rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Unable to load lease information
            </p>

            <p className="mt-1 text-sm text-red-700">
              {leaseError}
            </p>
          </div>
        ) : activeLease ? (
          <div className="mt-6 space-y-6">
            {/* Tenant */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Tenant
              </p>

              {tenant ? (
                <div className="mt-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {tenant.first_name}{" "}
                    {tenant.last_name}
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
                </div>
              ) : (
                <div className="mt-2 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800">
                    Tenant information unavailable
                  </p>

                  <p className="mt-1 text-xs text-yellow-700">
                    The active lease exists, but the tenant
                    record could not be loaded.
                  </p>
                </div>
              )}
            </div>

            {/* Lease Details */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">
                  Monthly Rent
                </p>

                <p className="mt-1 font-medium text-gray-900">
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
                  {activeLease.security_deposit !== null
                    ? `₱${Number(
                        activeLease.security_deposit
                      ).toLocaleString()}`
                    : "Not set"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Start Date
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {new Date(
                    activeLease.start_date
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  End Date
                </p>

                <p className="mt-1 font-medium text-gray-900">
                  {activeLease.end_date
                    ? new Date(
                        activeLease.end_date
                      ).toLocaleDateString()
                    : "Ongoing"}
                </p>
              </div>
            </div>

            {/* Lease Notes */}
            {activeLease.notes && (
              <div>
                <p className="text-sm text-gray-500">
                  Lease Notes
                </p>

                <p className="mt-1 text-gray-700">
                  {activeLease.notes}
                </p>
              </div>
            )}

            {/* End Lease */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">
                Lease Actions
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Ending the lease will mark the tenant's lease
                as ended and make this unit vacant.
              </p>

              {endLeaseMessage && (
                <p className="mt-3 text-sm text-gray-600">
                  {endLeaseMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleEndLease}
                disabled={endingLease}
                className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {endingLease
                  ? "Ending Lease..."
                  : "End Lease"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
            <p className="font-medium text-gray-900">
              No active lease
            </p>

            <p className="mt-1 text-sm text-gray-500">
              This unit is currently available for lease.
            </p>
          </div>
        )}
      </section>

      {/* Payment History */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Payment History
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Payment history for this unit will appear here.
        </p>

        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            Payment history coming soon.
          </p>
        </div>
      </section>
    </div>
  );
}