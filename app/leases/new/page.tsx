"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
};

type Unit = {
  id: string;
  unit_number: string;
  floor: string;
  monthly_rent: number | null;
  status: string;
};

function NewLeaseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenantIdFromUrl = searchParams.get("tenantId");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(true);

  const [tenantId, setTenantId] = useState(
    tenantIdFromUrl ?? ""
  );
  const [unitId, setUnitId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenantIdFromUrl) {
      setTenantId(tenantIdFromUrl);
    }
  }, [tenantIdFromUrl]);

  useEffect(() => {
    async function loadTenants() {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, first_name, last_name")
        .order("last_name")
        .order("first_name");

      if (error) {
        setError(
          `Unable to load tenants: ${error.message}`
        );
      } else if (data) {
        setTenants(data);
      }

      setLoadingTenants(false);
    }

    loadTenants();
  }, []);

  useEffect(() => {
    async function loadUnits() {
      const { data, error } = await supabase
        .from("units")
        .select(
          "id, unit_number, floor, monthly_rent, status"
        )
        .order("unit_number");

      if (error) {
        setError(
          `Unable to load units: ${error.message}`
        );
      } else if (data) {
        setUnits(data);
      }

      setLoadingUnits(false);
    }

    loadUnits();
  }, []);

  const selectedTenant = tenants.find(
    (tenant) => tenant.id === tenantId
  );

  function handleUnitChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const selectedUnitId = event.target.value;

    setUnitId(selectedUnitId);

    const selectedUnit = units.find(
      (unit) => unit.id === selectedUnitId
    );

    if (selectedUnit?.monthly_rent != null) {
      setMonthlyRent(
        String(selectedUnit.monthly_rent)
      );
    } else {
      setMonthlyRent("");
    }

    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!tenantId) {
      setError("No tenant was selected.");
      return;
    }

    if (!unitId) {
      setError("Please select a unit.");
      return;
    }

    const { data: selectedUnit, error: unitCheckError } =
      await supabase
        .from("units")
        .select("id, unit_number, status")
        .eq("id", unitId)
        .single();

    if (unitCheckError || !selectedUnit) {
      setError(
        "Unable to verify the selected unit. Please try again."
      );
      return;
    }

    if (
      status === "ACTIVE" &&
      selectedUnit.status === "OCCUPIED"
    ) {
      setError(
        `Unit ${selectedUnit.unit_number} is already occupied and cannot have another active lease.`
      );
      return;
    }

    if (!startDate) {
      setError("Please select a lease start date.");
      return;
    }

    if (!monthlyRent.trim()) {
      setError("Please enter the monthly rent.");
      return;
    }

    const rent = Number(monthlyRent);

    if (Number.isNaN(rent) || rent <= 0) {
      setError("Please enter a valid monthly rent.");
      return;
    }

    let deposit: number | null = null;

    if (securityDeposit.trim()) {
      deposit = Number(securityDeposit);

      if (Number.isNaN(deposit) || deposit < 0) {
        setError(
          "Please enter a valid security deposit."
        );
        return;
      }
    }

    if (endDate && endDate < startDate) {
      setError(
        "The lease end date cannot be before the start date."
      );
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("leases")
      .insert({
        tenant_id: tenantId,
        unit_id: unitId,
        start_date: startDate,
        end_date: endDate || null,
        monthly_rent: rent,
        security_deposit: deposit,
        status,
        notes: notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (status === "ACTIVE") {
      const { error: unitUpdateError } = await supabase
        .from("units")
        .update({
          status: "OCCUPIED",
        })
        .eq("id", unitId);

      if (unitUpdateError) {
        setError(
          `Lease was created, but the unit could not be updated: ${unitUpdateError.message}`
        );
        setSaving(false);
        return;
      }
    }

    router.push(`/tenants/${tenantId}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8">
          <Link
            href={
              tenantId
                ? `/tenants/${tenantId}`
                : "/tenants"
            }
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Tenant
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Create Lease
          </h1>

          <p className="mt-1 text-gray-600">
            Create a rental agreement for a tenant and unit.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm"
        >
          <div className="space-y-5">
            {/* Tenant */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Tenant
              </label>

              {tenantIdFromUrl ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-900">
                  {loadingTenants
                    ? "Loading tenant..."
                    : selectedTenant
                      ? `${selectedTenant.first_name} ${selectedTenant.last_name}`
                      : "Tenant not found"}
                </div>
              ) : (
                <select
                  value={tenantId}
                  onChange={(event) => {
                    setTenantId(event.target.value);
                    setError("");
                  }}
                  disabled={loadingTenants}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingTenants
                      ? "Loading tenants..."
                      : "Select tenant"}
                  </option>

                  {tenants.map((tenant) => (
                    <option
                      key={tenant.id}
                      value={tenant.id}
                    >
                      {tenant.first_name}{" "}
                      {tenant.last_name}
                    </option>
                  ))}
                </select>
              )}

              {tenantIdFromUrl && (
                <p className="mt-1.5 text-xs text-gray-500">
                  Tenant is fixed because you opened this form from the tenant's profile.
                </p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Unit
              </label>

              <select
                value={unitId}
                onChange={handleUnitChange}
                disabled={loadingUnits}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingUnits
                    ? "Loading units..."
                    : "Select unit"}
                </option>

                {units.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                    disabled={unit.status === "OCCUPIED"}
                  >
                    Unit {unit.unit_number} — {unit.floor}
                    {unit.status === "OCCUPIED"
                      ? " — Occupied"
                      : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-xs text-gray-500">
                Occupied units cannot be assigned to a new active lease.
              </p>
            </div>

            {/* Start Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Leave blank if the lease has no end date.
              </p>
            </div>

            {/* Monthly Rent */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Monthly Rent
              </label>

              <input
                type="number"
                min="0"
                value={monthlyRent}
                onChange={(event) => {
                  setMonthlyRent(event.target.value);
                  setError("");
                }}
                placeholder="8500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <p className="mt-1.5 text-xs text-gray-500">
                Automatically filled from the unit's current rent. You can adjust it for this lease.
              </p>
            </div>

            {/* Security Deposit */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Security Deposit
              </label>

              <input
                type="number"
                min="0"
                value={securityDeposit}
                onChange={(event) => {
                  setSecurityDeposit(event.target.value);
                  setError("");
                }}
                placeholder="8500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="ENDED">
                  Ended
                </option>

                <option value="PENDING">
                  Pending
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
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={4}
                placeholder="Add notes about this lease..."
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <Link
              href={
                tenantId
                  ? `/tenants/${tenantId}`
                  : "/tenants"
              }
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Lease"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewLeasePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-gray-600">
              Loading lease form...
            </p>
          </div>
        </main>
      }
    >
      <NewLeaseForm />
    </Suspense>
  );
}