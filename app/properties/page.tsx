import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const { data: properties, error: propertiesError } =
    await supabase
      .from("properties")
      .select("*")
      .order("created_at");

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("*")
    .order("unit_number");

  if (propertiesError || unitsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Properties
          </h1>

          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load property data
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {propertiesError?.message ||
                unitsError?.message ||
                "Unknown database error"}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const property = properties?.[0];

  if (!property) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            No Property Found
          </h1>

          <p className="mt-2 text-gray-600">
            No properties have been added yet.
          </p>
        </div>
      </main>
    );
  }

  const propertyUnits =
    units?.filter(
      (unit) => unit.property_id === property.id
    ) ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {property.name}
          </h1>

          <p className="mt-1 text-gray-600">
            {property.address}
          </p>
        </header>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Units
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {propertyUnits.length} rental units across 2 floors.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {propertyUnits.map((unit) => (
              <Link
                key={unit.id}
                href={`/properties/units/${unit.unit_number}`}
                className="group block cursor-pointer rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      {unit.floor}
                    </p>

                    <h3 className="mt-1 text-2xl font-bold text-gray-900 group-hover:underline">
                      Unit {unit.unit_number}
                    </h3>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {unit.status}
                  </span>
                </div>

                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500">
                    Monthly Rent
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {unit.monthly_rent !== null
                      ? `₱${Number(
                          unit.monthly_rent
                        ).toLocaleString()}`
                      : "Unknown"}
                  </p>

                  <p className="mt-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                    View unit →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}