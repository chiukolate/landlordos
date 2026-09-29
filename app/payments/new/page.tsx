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
};

type Lease = {
  id: string;
  tenant_id: string;
  unit_id: string;
  monthly_rent: number;
  status: string;
};

function NewPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenantIdFromUrl = searchParams.get("tenantId");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);

  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [tenantId, setTenantId] = useState(
    tenantIdFromUrl ?? ""
  );

  const [unitId, setUnitId] = useState("");
  const [leaseId, setLeaseId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState("CASH");
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
    async function loadPaymentData() {
      const { data: unitsData, error: unitsError } =
        await supabase
          .from("units")
          .select(
            "id, unit_number, floor, monthly_rent"
          )
          .order("unit_number");

      const { data: leasesData, error: leasesError } =
        await supabase
          .from("leases")
          .select(
            "id, tenant_id, unit_id, monthly_rent, status"
          )
          .eq("status", "ACTIVE")
          .order("start_date", {
            ascending: false,
          });

      if (unitsError) {
        setError(
          `Unable to load units: ${unitsError.message}`
        );
      } else if (unitsData) {
        setUnits(unitsData);
      }

      if (leasesError) {
        setError(
          `Unable to load leases: ${leasesError.message}`
        );
      } else if (leasesData) {
        setLeases(leasesData);
      }

      setLoadingData(false);
    }

    loadPaymentData();
  }, []);

  const selectedTenant = tenants.find(
    (tenant) => tenant.id === tenantId
  );

  const tenantLeases = leases.filter(
    (lease) => lease.tenant_id === tenantId
  );

  const selectedLease = leases.find(
    (lease) => lease.id === leaseId
  );

  const selectedUnit = units.find(
    (unit) => unit.id === unitId
  );

  function handleTenantChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newTenantId = event.target.value;

    setTenantId(newTenantId);
    setUnitId("");
    setLeaseId("");
    setAmount("");
    setError("");
  }

  function handleLeaseChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newLeaseId = event.target.value;

    setLeaseId(newLeaseId);

    const lease = leases.find(
      (item) => item.id === newLeaseId
    );

    if (lease) {
      setUnitId(lease.unit_id);
      setAmount(String(lease.monthly_rent));
    } else {
      setUnitId("");
      setAmount("");
    }

    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!tenantId) {
      setError("Please select a tenant.");
      return;
    }

    if (!leaseId) {
      setError("Please select an active lease.");
      return;
    }

    if (!amount.trim()) {
      setError("Please enter the payment amount.");
      return;
    }

    const paymentAmount = Number(amount);

    if (
      Number.isNaN(paymentAmount) ||
      paymentAmount <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    if (!paymentDate) {
      setError("Please select the payment date.");
      return;
    }

    if (!selectedLease) {
      setError(
        "Unable to verify the selected lease."
      );
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        tenant_id: tenantId,
        unit_id: selectedLease.unit_id,
        lease_id: selectedLease.id,
        amount: paymentAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
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
            Record Payment
          </h1>

          <p className="mt-1 text-gray-600">
            Record a rent payment from a tenant.
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
                  onChange={handleTenantChange}
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
            </div>

            {/* Lease */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Active Lease
              </label>

              <select
                value={leaseId}
                onChange={handleLeaseChange}
                disabled={
                  loadingData || !tenantId
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingData
                    ? "Loading leases..."
                    : !tenantId
                      ? "Select a tenant first"
                      : tenantLeases.length === 0
                        ? "No active lease"
                        : "Select active lease"}
                </option>

                {tenantLeases.map((lease) => {
                  const unit = units.find(
                    (item) =>
                      item.id === lease.unit_id
                  );

                  return (
                    <option
                      key={lease.id}
                      value={lease.id}
                    >
                      {unit
                        ? `Unit ${unit.unit_number}`
                        : "Unknown Unit"}{" "}
                      — ₱
                      {Number(
                        lease.monthly_rent
                      ).toLocaleString()}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Unit */}
            {selectedUnit && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Unit
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900">
                  Unit {selectedUnit.unit_number} —{" "}
                  {selectedUnit.floor}
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                placeholder="8500"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Payment Date */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Date
              </label>

              <input
                type="date"
                value={paymentDate}
                onChange={(event) => {
                  setPaymentDate(event.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              >
                <option value="CASH">
                  Cash
                </option>

                <option value="BANK_TRANSFER">
                  Bank Transfer
                </option>

                <option value="GCASH">
                  GCash
                </option>

                <option value="CHECK">
                  Check
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
                placeholder="Optional payment notes..."
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
              disabled={
                saving ||
                !tenantId ||
                !leaseId
              }
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm text-gray-600">
              Loading payment form...
            </p>
          </div>
        </main>
      }
    >
      <NewPaymentForm />
    </Suspense>
  );
}