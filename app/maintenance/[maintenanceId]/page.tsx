"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function MaintenanceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const maintenanceId = params.maintenanceId as string;

  const [record, setRecord] = useState<MaintenanceRecord | null>(
    null
  );

  const [property, setProperty] = useState<Property | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMaintenance() {
      const { data, error } = await supabase
        .from("maintenance")
        .select(
          "id, property_id, unit_id, reported_date, category, description, status, cost, notes"
        )
        .eq("id", maintenanceId)
        .single();

      if (error) {
        console.error("Error loading maintenance:", error);
        setError("Maintenance record could not be found.");
        setLoading(false);
        return;
      }

      setRecord(data);
      setStatus(data.status);

      const { data: propertyData } = await supabase
        .from("properties")
        .select("id, name")
        .eq("id", data.property_id)
        .single();

      setProperty(propertyData);

      if (data.unit_id) {
        const { data: unitData } = await supabase
          .from("units")
          .select("id, unit_number")
          .eq("id", data.unit_id)
          .single();

        setUnit(unitData);
      }

      setLoading(false);
    }

    if (maintenanceId) {
      loadMaintenance();
    }
  }, [maintenanceId]);

  async function handleSave() {
    if (!record) {
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("maintenance")
      .update({
        status,
      })
      .eq("id", record.id);

    if (error) {
      console.error("Error updating maintenance:", error);
      setError("Unable to update maintenance status.");
      setSaving(false);
      return;
    }

    router.push("/maintenance");
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "long",
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

  if (loading) {
    return (
      <main className="p-6">
        <p className="text-sm text-gray-500">
          Loading maintenance record...
        </p>
      </main>
    );
  }

  if (!record) {
    return (
      <main className="p-6">
        <p className="text-red-600">
          {error || "Maintenance record not found."}
        </p>

        <Link
          href="/maintenance"
          className="mt-4 inline-block text-sm font-medium underline"
        >
          Back to Maintenance
        </Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6">
        <Link
          href="/maintenance"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Maintenance
        </Link>

        <h1 className="mt-3 text-2xl font-semibold text-gray-900">
          Maintenance Details
        </h1>
      </div>

      <div className="max-w-2xl rounded-xl border border-gray-200 bg-white p-6">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-gray-500">
              Property
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {property?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Unit
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {unit?.unit_number || "Common Area"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Date Reported
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatDate(record.reported_date)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Category
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatCategory(record.category)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Description
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {record.description}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Cost
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {formatAmount(record.cost)}
            </p>
          </div>

          {record.notes && (
            <div>
              <p className="text-sm text-gray-500">
                Notes
              </p>

              <p className="mt-1 text-gray-900">
                {record.notes}
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-5">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-black"
            >
              <option value="OPEN">
                Open
              </option>

              <option value="IN_PROGRESS">
                In Progress
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/maintenance"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Status"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}