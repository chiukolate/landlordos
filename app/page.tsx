import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function Dashboard() {
  const { data: properties, error: propertiesError } =
    await supabase
      .from("properties")
      .select("*")
      .order("created_at");

  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("id, property_id, unit_number, monthly_rent, status")
    .order("unit_number");

  const { data: activeLeases, error: leasesError } =
    await supabase
      .from("leases")
      .select(
        `
          id,
          start_date,
          monthly_rent,
          tenant_id,
          unit_id,
          tenants (
            first_name,
            last_name
          ),
          units (
            unit_number
          )
        `
      )
      .eq("status", "ACTIVE")
      .order("start_date", { ascending: false });

  if (propertiesError || unitsError || leasesError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load dashboard data
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {propertiesError?.message ||
                unitsError?.message ||
                leasesError?.message ||
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
            Dashboard
          </h1>

          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              No Property Found
            </h2>

            <p className="mt-2 text-gray-600">
              No properties have been added yet.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const propertyUnits =
    units?.filter(
      (unit) => unit.property_id === property.id
    ) ?? [];

  const totalUnits = propertyUnits.length;

  const occupiedUnits = propertyUnits.filter(
    (unit) => unit.status === "OCCUPIED"
  ).length;

  const vacantUnits = propertyUnits.filter(
    (unit) => unit.status === "VACANT"
  ).length;

  const activeLeaseCount = activeLeases?.length ?? 0;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-600">
            Overview of your rental property.
          </p>
        </header>

        {/* Summary Cards */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Units
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalUnits}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Occupied
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {occupiedUnits}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Vacant
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {vacantUnits}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Leases
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {activeLeaseCount}
            </p>
          </div>
        </section>

        {/* Property Overview */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {property.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {property.address}
              </p>
            </div>

            <Link
              href="/properties"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              View Property
            </Link>
          </div>

          {/* Unit Overview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Unit Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Standard rental rates assigned to each unit.
            </p>

            <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Unit
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Standard Rent
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {propertyUnits.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/properties/units/${unit.unit_number}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          Unit {unit.unit_number}
                        </Link>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            unit.status === "OCCUPIED"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {unit.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600">
                        {unit.monthly_rent !== null
                          ? `₱${Number(
                              unit.monthly_rent
                            ).toLocaleString()}`
                          : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Leases */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Active Leases
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Current tenants and their agreed monthly rent.
                </p>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {activeLeaseCount} Active
              </span>
            </div>

            {activeLeases && activeLeases.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-600">
                        Tenant
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-600">
                        Unit
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-600">
                        Lease Rent
                      </th>

                      <th className="px-4 py-3 font-medium text-gray-600">
                        Start Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {activeLeases.map((lease) => (
                      <tr key={lease.id}>
                        <td className="px-4 py-3">
                          {lease.tenants ? (
                            <Link
                              href={`/tenants/${lease.tenant_id}`}
                              className="font-medium text-gray-900 hover:underline"
                            >
                              {lease.tenants.first_name}{" "}
                              {lease.tenants.last_name}
                            </Link>
                          ) : (
                            "Unknown Tenant"
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {lease.units
                            ? `Unit ${lease.units.unit_number}`
                            : "Unknown Unit"}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          ₱
                          {Number(
                            lease.monthly_rent
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {new Date(
                            lease.start_date
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                <p className="font-medium text-gray-900">
                  No active leases
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  There are currently no tenants with an active lease.
                </p>
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                Standard Rent
              </span>{" "}
              is the normal rental rate assigned to the unit.
              <span className="font-medium text-gray-900">
                {" "}
                Lease Rent
              </span>{" "}
              is the actual monthly rent agreed with the current
              tenant.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}