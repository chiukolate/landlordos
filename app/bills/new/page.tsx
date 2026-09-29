"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
};

export default function NewBillPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [billingMonth, setBillingMonth] = useState("");
  const [rentAmount, setRentAmount] = useState("");
  const [previousReading, setPreviousReading] = useState("");
  const [currentReading, setCurrentReading] = useState("");
  const [electricityRate, setElectricityRate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [{ data: propertyData, error: propertyError }, { data: unitData, error: unitError }] =
        await Promise.all([
          supabase
            .from("properties")
            .select("id, name")
            .order("name"),
          supabase
            .from("units")
            .select("id, property_id, unit_number")
            .order("unit_number"),
        ]);

      if (propertyError) {
        setError(propertyError.message);
        setLoading(false);
        return;
      }

      if (unitError) {
        setError(unitError.message);
        setLoading(false);
        return;
      }

      setProperties(propertyData ?? []);
      setUnits(unitData ?? []);
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredUnits = units.filter(
    (unit) => unit.property_id === propertyId
  );

  const previous = Number(previousReading) || 0;
  const current = Number(currentReading) || 0;
  const rate = Number(electricityRate) || 0;
  const rent = Number(rentAmount) || 0;

  const kwhUsed = Math.max(current - previous, 0);
  const electricityCharge = kwhUsed * rate;
  const totalAmountDue = rent + electricityCharge;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!propertyId || !unitId || !billingMonth || !rentAmount) {
      setError("Please complete the required fields.");
      return;
    }

    if (current < previous) {
      setError("Current electricity reading cannot be lower than the previous reading.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase.from("bills").insert({
      property_id: propertyId,
      unit_id: unitId,
      billing_month: `${billingMonth}-01`,
      rent_amount: rent,
      electricity_previous_reading:
        previousReading === "" ? null : previous,
      electricity_current_reading:
        currentReading === "" ? null : current,
      electricity_rate:
        electricityRate === "" ? null : rate,
      electricity_charge:
        electricityRate === "" || currentReading === ""
          ? null
          : electricityCharge,
      total_amount_due: totalAmountDue,
      notes: notes || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    window.location.href = "/bills";
  }

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Create Monthly Bill
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Record rent and electricity charges for a billing month.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property
          </label>

          <select
            value={propertyId}
            onChange={(e) => {
              setPropertyId(e.target.value);
              setUnitId("");
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select property</option>

            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit
          </label>

          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
            disabled={!propertyId}
          >
            <option value="">Select unit</option>

            {filteredUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unit_number}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Month
          </label>

          <input
            type="month"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rent Amount
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            value={rentAmount}
            onChange={(e) => setRentAmount(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">
            Electricity
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Previous Reading
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current Reading
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rate per kWh
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Electricity Used</span>
            <span className="font-medium text-gray-900">
              {kwhUsed.toFixed(2)} kWh
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">Electricity Charge</span>
            <span className="font-medium text-gray-900">
              ₱{electricityCharge.toFixed(2)}
            </span>
          </div>

          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
            <span className="font-medium text-gray-900">
              Total Amount Due
            </span>

            <span className="text-lg font-semibold text-gray-900">
              ₱{totalAmountDue.toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Optional notes"
          />
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <a
            href="/bills"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </a>

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bill"}
          </button>
        </div>
      </form>
    </main>
  );
}