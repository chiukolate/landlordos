"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Bill = {
  id: string;
  property_id: string;
  unit_id: string;
  billing_month: string;
  rent_amount: number;
  electricity_previous_reading: number | null;
  electricity_current_reading: number | null;
  electricity_rate: number | null;
  electricity_charge: number | null;
  total_amount_due: number;
  notes: string | null;
};

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  unit_number: string;
};

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [
        { data: billData, error: billError },
        { data: propertyData, error: propertyError },
        { data: unitData, error: unitError },
      ] = await Promise.all([
        supabase
          .from("bills")
          .select("*")
          .order("billing_month", { ascending: false }),
        supabase
          .from("properties")
          .select("id, name")
          .order("name"),
        supabase
          .from("units")
          .select("id, unit_number")
          .order("unit_number"),
      ]);

      if (billError) {
        setError(billError.message);
        setLoading(false);
        return;
      }

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

      setBills(billData ?? []);
      setProperties(propertyData ?? []);
      setUnits(unitData ?? []);
      setLoading(false);
    }

    loadData();
  }, []);

  function getPropertyName(propertyId: string) {
    return (
      properties.find((property) => property.id === propertyId)?.name ??
      "Unknown property"
    );
  }

  function getUnitNumber(unitId: string) {
    return (
      units.find((unit) => unit.id === unitId)?.unit_number ??
      "Unknown unit"
    );
  }

  function formatMonth(value: string) {
    const date = new Date(`${value}T00:00:00`);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Bills</h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage monthly rent and electricity bills.
          </p>
        </div>

        <Link
          href="/bills/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Create Bill
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {bills.length === 0 ? (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">
            No bills have been recorded yet.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Billing Month
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Property
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Unit
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Rent
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Electricity
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700">
                    Total Due
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      {formatMonth(bill.billing_month)}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {getPropertyName(bill.property_id)}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      {getUnitNumber(bill.unit_id)}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      ₱{Number(bill.rent_amount).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      ₱{Number(bill.electricity_charge ?? 0).toFixed(2)}
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-900">
                      ₱{Number(bill.total_amount_due).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}