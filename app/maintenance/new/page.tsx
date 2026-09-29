"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  name: string;
};

type Unit = {
  id: string;
  unit_number: string;
  property_id: string;
};

const categories = [
  "PLUMBING",
  "ELECTRICAL",
  "AIRCON",
  "APPLIANCE",
  "STRUCTURAL",
  "CLEANING",
  "OTHER",
];

export default function NewMaintenancePage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const [propertyId, setPropertyId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [reportedDate, setReportedDate] = useState("");
  const [category, setCategory] = useState("PLUMBING");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      const [propertiesResult, unitsResult] = await Promise.all([
        supabase
          .from("properties")
          .select("id, name")
          .order("name"),

        supabase
          .from("units")
          .select("id, unit_number, property_id")
          .order("unit_number"),
      ]);

      if (propertiesResult.error) {
        setError(propertiesResult.error.message);
        setLoadingProperties(false);
        return;
      }

      if (unitsResult.error) {
        setError(unitsResult.error.message);
        setLoadingProperties(false);
        return;
      }

      const loadedProperties = propertiesResult.data ?? [];
      const loadedUnits = unitsResult.data ?? [];

      setProperties(loadedProperties);
      setUnits(loadedUnits);

      if (loadedProperties.length === 1) {
        setPropertyId(loadedProperties[0].id);
      }

      setLoadingProperties(false);
    }

    loadInitialData();

    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    setReportedDate(formattedDate);
  }, []);

  const availableUnits = units.filter(
    (unit) => unit.property_id === propertyId
  );

  function handlePropertyChange(value: string) {
    setPropertyId(value);
    setUnitId("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!propertyId) {
      setError("Please select a property.");
      return;
    }

    if (!reportedDate) {
      setError("Please select the reported date.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (cost && Number(cost) < 0) {
      setError("Cost cannot be negative.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("maintenance").insert({
      property_id: propertyId,
      unit_id: unitId || null,
      reported_date: reportedDate,
      category,
      description: description.trim(),
      status,
      cost: cost ? Number(cost) : null,
      notes: notes.trim() || null,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/maintenance");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Record Maintenance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Record a maintenance issue for one of your properties.
        </p>
      </div>

      <div className="max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="property"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Property
            </label>

            <select
              id="property"
              value={propertyId}
              onChange={(event) =>
                handlePropertyChange(event.target.value)
              }
              disabled={loadingProperties || saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="">
                {loadingProperties
                  ? "Loading properties..."
                  : "Select property"}
              </option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="unit"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Unit
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <select
              id="unit"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              disabled={!propertyId || loadingProperties || saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="">
                Common Area / No Specific Unit
              </option>

              {availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unit_number}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="reportedDate"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date Reported
            </label>

            <input
              id="reportedDate"
              type="date"
              value={reportedDate}
              onChange={(event) =>
                setReportedDate(event.target.value)
              }
              disabled={saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={saving}
              rows={4}
              placeholder="e.g. Kitchen faucet is leaking"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              disabled={saving}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="cost"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Cost
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <input
              id="cost"
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(event) => setCost(event.target.value)}
              disabled={saving}
              placeholder="0.00"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Notes
              <span className="ml-1 font-normal text-gray-400">
                (optional)
              </span>
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Optional notes"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || loadingProperties}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Maintenance"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/maintenance")}
              disabled={saving}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}