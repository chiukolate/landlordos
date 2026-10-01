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

type MonthlyBill = {
  id: string;
  unit_id: string;
  billing_month: string;
  rent_amount: number;
  electricity_amount: number;
  adjustment: number;
  total_amount_due: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
};

function NewPaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tenantIdFromUrl = searchParams.get("tenantId");

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [bills, setBills] = useState<MonthlyBill[]>([]);

  const [loadingTenants, setLoadingTenants] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingBills, setLoadingBills] = useState(false);

  // Total already paid toward the selected bill.
  const [alreadyPaid, setAlreadyPaid] = useState(0);
  const [loadingBillPayments, setLoadingBillPayments] =
    useState(false);

  const [tenantId, setTenantId] = useState(
    tenantIdFromUrl ?? ""
  );

  const [unitId, setUnitId] = useState("");
  const [leaseId, setLeaseId] = useState("");
  const [billId, setBillId] = useState("");

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

  useEffect(() => {
    async function loadBills() {
      if (!unitId) {
        setBills([]);
        setBillId("");
        return;
      }

      setLoadingBills(true);
      setError("");

      const { data, error } = await supabase
        .from("monthly_bills")
        .select(
          `
            id,
            unit_id,
            billing_month,
            rent_amount,
            electricity_amount,
            adjustment,
            total_amount_due,
            status
          `
        )
        .eq("unit_id", unitId)
        .order("billing_month", {
          ascending: false,
        });

      if (error) {
        setError(
          `Unable to load monthly bills: ${error.message}`
        );
        setBills([]);
      } else {
        setBills(data ?? []);
      }

      setLoadingBills(false);
    }

    loadBills();
  }, [unitId]);

  // When a bill is selected, load the payments already linked to it,
  // then default the Payment Amount to the remaining balance.
  useEffect(() => {
    let cancelled = false;

    async function loadBillPayments() {
      if (!billId) {
        setAlreadyPaid(0);
        setLoadingBillPayments(false);
        return;
      }

      const bill = bills.find(
        (item) => item.id === billId
      );

      if (!bill) {
        setAlreadyPaid(0);
        setLoadingBillPayments(false);
        return;
      }

      setLoadingBillPayments(true);

      const { data, error } = await supabase
        .from("payments")
        .select("amount")
        .eq("monthly_bill_id", billId);

      if (cancelled) {
        return;
      }

      if (error) {
        setError(
          `Unable to load payments for this bill: ${error.message}`
        );
        setAlreadyPaid(0);
        setLoadingBillPayments(false);
        return;
      }

      const paid = (data ?? []).reduce(
        (sum, payment) =>
          sum + Number(payment.amount),
        0
      );

      const remaining = Math.max(
        Math.round(
          (Number(bill.total_amount_due) - paid) *
            100
        ) / 100,
        0
      );

      setAlreadyPaid(paid);
      setAmount(
        remaining > 0 ? remaining.toFixed(2) : ""
      );
      setLoadingBillPayments(false);
    }

    loadBillPayments();

    return () => {
      cancelled = true;
    };
  }, [billId, bills]);

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

  const selectedBill = bills.find(
    (bill) => bill.id === billId
  );

  const remainingBalance = selectedBill
    ? Math.max(
        Math.round(
          (Number(selectedBill.total_amount_due) -
            alreadyPaid) *
            100
        ) / 100,
        0
      )
    : 0;

  function formatMonth(value: string) {
    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function formatCurrency(value: number) {
    return `₱${Number(value).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  function handleTenantChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newTenantId = event.target.value;

    setTenantId(newTenantId);
    setUnitId("");
    setLeaseId("");
    setBillId("");
    setBills([]);
    setAmount("");
    setError("");
  }

  function handleLeaseChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newLeaseId = event.target.value;

    setLeaseId(newLeaseId);
    setBillId("");
    setAmount("");

    const lease = leases.find(
      (item) => item.id === newLeaseId
    );

    if (lease) {
      setUnitId(lease.unit_id);
    } else {
      setUnitId("");
    }

    setError("");
  }

  function handleBillChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newBillId = event.target.value;

    setBillId(newBillId);

    // The amount is filled in with the remaining balance
    // once this bill's existing payments have loaded.
    setAmount("");
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

    if (!billId) {
      setError("Please select a monthly bill.");
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

    if (!selectedBill) {
      setError(
        "Unable to verify the selected monthly bill."
      );
      return;
    }

    if (
      selectedBill.status === "PAID"
    ) {
      setError(
        "This monthly bill is already fully paid."
      );
      return;
    }

    setSaving(true);

    // Save the payment and attach it to the monthly bill.
    const { error: insertError } = await supabase
      .from("payments")
      .insert({
        tenant_id: tenantId,
        unit_id: selectedLease.unit_id,
        lease_id: selectedLease.id,
        monthly_bill_id: selectedBill.id,
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

    // Get all payments attached to this bill.
    const { data: billPayments, error: paymentsError } =
      await supabase
        .from("payments")
        .select("amount")
        .eq(
          "monthly_bill_id",
          selectedBill.id
        );

    if (paymentsError) {
      setError(
        `Payment was recorded, but the bill status could not be updated: ${paymentsError.message}`
      );
      setSaving(false);
      return;
    }

    const totalPaid = (billPayments ?? []).reduce(
      (sum, payment) =>
        sum + Number(payment.amount),
      0
    );

    let newStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID";

    if (totalPaid <= 0) {
      newStatus = "UNPAID";
    } else if (
      totalPaid >=
      Number(selectedBill.total_amount_due)
    ) {
      newStatus = "PAID";
    } else {
      newStatus = "PARTIAL";
    }

    const { error: updateError } = await supabase
      .from("monthly_bills")
      .update({
        status: newStatus,
      })
      .eq("id", selectedBill.id);

    if (updateError) {
      setError(
        `Payment was recorded, but the bill status could not be updated: ${updateError.message}`
      );
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
            Record a tenant payment against a monthly bill.
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
                      — {formatCurrency(
                        Number(lease.monthly_rent)
                      )}
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

            {/* Monthly Bill */}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Monthly Bill
              </label>

              <select
                value={billId}
                onChange={handleBillChange}
                disabled={
                  loadingBills || !unitId
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-50"
              >
                <option value="">
                  {loadingBills
                    ? "Loading bills..."
                    : !unitId
                      ? "Select an active lease first"
                      : bills.length === 0
                        ? "No monthly bills for this unit"
                        : "Select monthly bill"}
                </option>

                {bills.map((bill) => (
                  <option
                    key={bill.id}
                    value={bill.id}
                    disabled={bill.status === "PAID"}
                  >
                    {formatMonth(
                      bill.billing_month
                    )}{" "}
                    — Due{" "}
                    {formatCurrency(
                      Number(
                        bill.total_amount_due
                      )
                    )}{" "}
                    — {bill.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Bill Summary */}

            {selectedBill && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  {formatMonth(
                    selectedBill.billing_month
                  )}
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Rent
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatCurrency(
                        Number(
                          selectedBill.rent_amount
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Electricity
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatCurrency(
                        Number(
                          selectedBill.electricity_amount
                        )
                      )}
                    </span>
                  </div>

                  {Number(
                    selectedBill.adjustment
                  ) !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Adjustment
                      </span>

                      <span className="font-medium text-gray-900">
                        {formatCurrency(
                          Number(
                            selectedBill.adjustment
                          )
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-medium text-gray-900">
                      Total Due
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        Number(
                          selectedBill.total_amount_due
                        )
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Already Paid
                    </span>

                    <span className="font-medium text-gray-900">
                      {loadingBillPayments
                        ? "Loading..."
                        : formatCurrency(alreadyPaid)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="font-medium text-gray-900">
                      Remaining Balance
                    </span>

                    <span className="font-semibold text-gray-900">
                      {loadingBillPayments
                        ? "Loading..."
                        : formatCurrency(
                            remainingBalance
                          )}
                    </span>
                  </div>
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
                  setAmount(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="5000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
              />

              <p className="mt-1 text-xs text-gray-500">
                Defaults to the remaining balance. Enter a smaller amount for a partial payment.
              </p>
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
                  setPaymentDate(
                    event.target.value
                  );
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
                  setNotes(
                    event.target.value
                  )
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
                loadingBillPayments ||
                !tenantId ||
                !leaseId ||
                !billId
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