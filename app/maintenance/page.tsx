"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type MaintenanceRecord = {
  id: string;
  property_id: string;
  unit_id: string | null;
  reported_date: string;
  category: string;
  description: string;
  status: string;
  cost: number | null;
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

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaintenance() {
      const [maintenanceResult, propertiesResult, unitsResult] =
        await Promise.all([
          supabase
            .from("maintenance")
            .select(
              "id, property_id, unit_id, reported_date, category, description, status, cost, notes"
            )
            .order("reported_date", { ascending: false }),

          supabase
            .from("properties")
            .select("id, name")
            .order("name"),

          supabase
            .from("units")
            .select("id, unit_number")
            .order("unit_number"),
        ]);

      if (maintenanceResult.error) {
        console.error(
          "Error loading maintenance:",
          maintenanceResult.error
        );
      }

      if (propertiesResult.error) {
        console.error(
          "Error loading properties:",
          propertiesResult.error
        );
      }

      if (unitsResult.error) {
        console.error(
          "Error loading units:",
          unitsResult.error
        );
      }

      setRecords(maintenanceResult.data || []);
      setProperties(propertiesResult.data || []);
      setUnits(unitsResult.data || []);

      setLoading(false);
    }

    loadMaintenance();
  }, []);

  function getPropertyName(propertyId: string) {
    const property = properties.find(
      (item) => item.id === propertyId
    );

    return property?.name || "—";
  }

  function getUnitNumber(unitId: string | null) {
    if (!unitId) {
      return "Common Area";
    }

    const unit = units.find(
      (item) => item.id === unitId
    );

    return unit?.unit_number || "—";
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  function formatAmount(amount: number | null) {
    if (amount === null || amount === undefined) {
      return "—";
    }

    return `₱${Number(amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function formatCategory(category: string) {
    return category.replaceAll("_", " ");
  }

  function formatStatus(status: string) {
    return status.replaceAll("_", " ");
  }

  function getStatusClass(status: string) {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-700";

      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  const totalIssues = records.length;

  const openIssues = records.filter(
    (record) => record.status === "OPEN"
  ).length;

  const inProgressIssues = records.filter(
    (record) => record.status === "IN_PROGRESS"
  ).length;

  const totalCost = records.reduce(
    (sum, record) => sum + Number(record.cost || 0),
    0
  );

  return (
    <main className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Maintenance
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Track maintenance issues and their status.
          </p>
        </div>

        <Link
          href="/maintenance/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Record Maintenance
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Issues
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {totalIssues}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Open
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {openIssues}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {inProgressIssues}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">
            Total Cost
          </p>

          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {formatAmount(totalCost)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading maintenance records...
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">
              No maintenance records yet.
            </p>

            <Link
              href="/maintenance/new"
              className="mt-4 inline-block text-sm font-medium text-black underline"
            >
              Record your first maintenance issue
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-600">
                    Date
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Property
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Unit
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Issue
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Category
                  </th>

                  <th className="px-5 py-3 font-medium text-gray-600">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right font-medium text-gray-600">
                    Cost
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                      {formatDate(record.reported_date)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {getPropertyName(record.property_id)}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {getUnitNumber(record.unit_id)}
                    </td>

                    <td className="max-w-xs px-5 py-4">
                      <Link
                        href={`/maintenance/${record.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {record.description}
                      </Link>

                      {record.notes && (
                        <div className="mt-1 text-xs text-gray-500">
                          {record.notes}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {formatCategory(record.category)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          record.status
                        )}`}
                      >
                        {formatStatus(record.status)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-right text-gray-700">
                      {formatAmount(record.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}