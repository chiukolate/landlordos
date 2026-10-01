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

  const [electricityBefore, setElectricityBefore] = useState("");
  const [electricityAfter, setElectricityAfter] = useState("");
  const [electricityRate, setElectricityRate] = useState("");

  const [hasAdjustment, setHasAdjustment] = useState(false);
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [
        { data: propertyData, error: propertyError },
        { data: unitData, error: unitError },
      ] = await Promise.all([
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

  const selectedUnit = units.find(
    (unit) => unit.id === unitId
  );

  const previous =
    electricityBefore === "" ? null : Number(electricityBefore);

  const current =
    electricityAfter === "" ? null : Number(electricityAfter);

  const rent = Number(rentAmount) || 0;
  const rate = Number(electricityRate) || 0;

  const electricityUsage =
    previous !== null && current !== null
      ? current - previous
      : 0;

  const electricityCharge = electricityUsage * rate;

  const adjustmentValue = hasAdjustment
    ? Number(adjustment) || 0
    : 0;

  const electricityAmount =
    electricityCharge + adjustmentValue;

  const totalAmountDue =
    rent + electricityAmount;

  function formatBillingMonth(value: string) {
    const date = new Date(`${value}-01T00:00:00`);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (
      !propertyId ||
      !unitId ||
      !billingMonth ||
      rentAmount === ""
    ) {
      setError("Please complete the required fields.");
      return;
    }

    if (rent < 0) {
      setError("Rent amount cannot be negative.");
      return;
    }

    if (
      electricityBefore === "" ||
      electricityAfter === "" ||
      electricityRate === ""
    ) {
      setError(
        "Please enter the electricity meter readings and rate."
      );
      return;
    }

    if (electricityUsage < 0) {
      setError(
        "Current electricity reading cannot be lower than the previous reading."
      );
      return;
    }

    if (rate < 0) {
      setError("Electricity rate cannot be negative.");
      return;
    }

    if (hasAdjustment && adjustment === "") {
      setError("Please enter the adjustment amount.");
      return;
    }

    if (
      hasAdjustment &&
      adjustmentReason.trim() === ""
    ) {
      setError("Please enter the reason for the adjustment.");
      return;
    }

    // The final electricity amount and total due cannot be negative.
    if (electricityAmount < 0) {
      setError(
        `The adjustment of ₱${adjustmentValue.toFixed(2)} is larger than the electricity charge of ₱${electricityCharge.toFixed(2)}, which would make the electricity bill negative. Please check the adjustment amount.`
      );
      return;
    }

    if (totalAmountDue < 0) {
      setError(
        "The total amount due cannot be negative. Please check the rent and adjustment amounts."
      );
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("monthly_bills")
      .insert({
        property_id: propertyId,
        unit_id: unitId,
        billing_month: `${billingMonth}-01`,

        rent_amount: rent,

        electricity_before: previous,
        electricity_after: current,
        electricity_usage: electricityUsage,
        electricity_rate: rate,

        electricity_amount: electricityAmount,

        adjustment: adjustmentValue,
        adjustment_reason: hasAdjustment
          ? adjustmentReason.trim()
          : null,

        total_amount_due: totalAmountDue,

        status: "UNPAID",

        notes: notes || null,
      });

    if (insertError) {
      // 23505 = unique violation (one bill per unit per month).
      if (insertError.code === "23505") {
        setError(
          `A bill for ${
            selectedUnit
              ? `Unit ${selectedUnit.unit_number}`
              : "this unit"
          } already exists for ${formatBillingMonth(
            billingMonth
          )}. Choose a different month, or check the Bills page.`
        );
      } else {
        setError(insertError.message);
      }

      setSaving(false);
      return;
    }

    window.location.href = "/bills";
  }

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-600">
          Loading...
        </p>
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
          Record the rent and electricity charges for a billing month.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-3xl space-y-6 rounded-lg border border-gray-200 bg-white p-6"
      >
        {/* PROPERTY */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Property
          </label>

          <select
            value={propertyId}
            onChange={(event) => {
              setPropertyId(event.target.value);
              setUnitId("");
            }}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          >
            <option value="">
              Select property
            </option>

            {properties.map((property) => (
              <option
                key={property.id}
                value={property.id}
              >
                {property.name}
              </option>
            ))}
          </select>
        </div>

        {/* UNIT */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit
          </label>

          <select
            value={unitId}
            onChange={(event) =>
              setUnitId(event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
            disabled={!propertyId}
          >
            <option value="">
              Select unit
            </option>

            {filteredUnits.map((unit) => (
              <option
                key={unit.id}
                value={unit.id}
              >
                {unit.unit_number}
              </option>
            ))}
          </select>
        </div>

        {/* BILLING MONTH */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Billing Month
          </label>

          <input
            type="month"
            value={billingMonth}
            onChange={(event) =>
              setBillingMonth(event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>

        {/* RENT */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rent Amount
          </label>

          <input
            type="number"
            step="0.01"
            min="0"
            value={rentAmount}
            onChange={(event) =>
              setRentAmount(event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="0.00"
            required
          />
        </div>

        {/* ELECTRICITY */}

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">
            Electricity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Electricity is calculated from the meter usage and the rate
            for this billing period.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter Before
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={electricityBefore}
                onChange={(event) =>
                  setElectricityBefore(event.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Meter After
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={electricityAfter}
                onChange={(event) =>
                  setElectricityAfter(event.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Electricity Rate (₱/kWh)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={electricityRate}
                onChange={(event) =>
                  setElectricityRate(event.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="0.00"
                required
              />

              <p className="mt-1 text-xs text-gray-500">
                The rate can change every billing period.
              </p>
            </div>
          </div>
        </div>

        {/* ELECTRICITY CALCULATION */}

        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Electricity Usage
            </span>

            <span className="font-medium text-gray-900">
              {electricityUsage.toFixed(2)} kWh
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Rate
            </span>

            <span className="font-medium text-gray-900">
              ₱{rate.toFixed(2)} / kWh
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Electricity Charge
            </span>

            <span className="font-medium text-gray-900">
              ₱{electricityCharge.toFixed(2)}
            </span>
          </div>
        </div>

        {/* ADJUSTMENT */}

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-medium text-gray-900">
            Adjustment
          </h2>

          <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hasAdjustment}
              onChange={(event) => {
                setHasAdjustment(event.target.checked);

                if (!event.target.checked) {
                  setAdjustment("");
                  setAdjustmentReason("");
                }
              }}
              className="h-4 w-4"
            />

            Apply an adjustment to the electricity charge
          </label>

          {hasAdjustment && (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Adjustment Amount
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={adjustment}
                    onChange={(event) =>
                      setAdjustment(event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. -200.00"
                    required
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Use a negative amount to reduce the bill.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Reason
                  </label>

                  <input
                    type="text"
                    value={adjustmentReason}
                    onChange={(event) =>
                      setAdjustmentReason(event.target.value)
                    }
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. Previous overpayment"
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BILL SUMMARY */}

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <h2 className="font-medium text-gray-900">
            Bill Summary
          </h2>

          <div className="mt-4 flex justify-between text-sm">
            <span className="text-gray-600">
              Rent
            </span>

            <span className="font-medium text-gray-900">
              ₱{rent.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600">
              Electricity Charge
            </span>

            <span className="font-medium text-gray-900">
              ₱{electricityCharge.toFixed(2)}
            </span>
          </div>

          {hasAdjustment && (
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-600">
                Adjustment
              </span>

              <span className="font-medium text-gray-900">
                ₱{adjustmentValue.toFixed(2)}
              </span>
            </div>
          )}

          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
            <span className="font-medium text-gray-900">
              Electricity Bill
            </span>

            <span className="font-semibold text-gray-900">
              ₱{electricityAmount.toFixed(2)}
            </span>
          </div>

          <div className="mt-2 flex justify-between">
            <span className="font-medium text-gray-900">
              Total Amount Due
            </span>

            <span className="text-lg font-semibold text-gray-900">
              ₱{totalAmountDue.toFixed(2)}
            </span>
          </div>
        </div>

        {/* NOTES */}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={notes}
            onChange={(event) =>
              setNotes(event.target.value)
            }
            rows={4}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="Optional notes"
          />
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* BUTTONS */}

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