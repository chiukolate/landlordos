import type { DashboardData } from "./types";

export default function ClassicDashboard({
  data,
}: {
  data: DashboardData;
}) {
  const { property, propertyUnits, activeLeases, tenants } = data;

  const totalUnits = propertyUnits.length;

  const occupiedUnits = propertyUnits.filter(
    (unit) => unit.status === "OCCUPIED"
  ).length;

  const vacantUnits = propertyUnits.filter(
    (unit) => unit.status === "VACANT"
  ).length;

  const activeLeaseCount = activeLeases.length;

  const tenantById = new Map(
    tenants.map((tenant) => [tenant.id, tenant])
  );

  const unitById = new Map(
    propertyUnits.map((unit) => [unit.id, unit])
  );

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-gray-600">
            Overview of your rental property.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Units
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.propertyUnits.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Occupied
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.propertyUnits.filter((unit) => unit.status === "OCCUPIED").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Vacant
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.propertyUnits.filter((unit) => unit.status === "VACANT").length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Leases
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {data.activeLeases.length}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {data.property.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {data.property.address}
              </p>
            </div>

            <a
              href="/properties"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              View Property
            </a>
          </div>

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
                  {data.propertyUnits.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-4 py-3">
                        <a
                          href={`/properties/units/${unit.unit_number}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          Unit {unit.unit_number}
                        </a>
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
                          ? `₱${Number(unit.monthly_rent).toLocaleString()}`
                          : "Unknown"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
                {data.activeLeases.length} Active
              </span>
            </div>

            {data.activeLeases.length > 0 ? (
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
                    {data.activeLeases.map((lease) => {
                      const tenant = data.tenants.find((item) => item.id === lease.tenant_id);
                      const unit = data.propertyUnits.find((item) => item.id === lease.unit_id);

                      return (
                        <tr key={lease.id}>
                          <td className="px-4 py-3">
                            {tenant ? (
                              <a
                                href={`/tenants/${tenant.id}`}
                                className="font-medium text-gray-900 hover:underline"
                              >
                                {tenant.first_name} {tenant.last_name}
                              </a>
                            ) : (
                              <span className="font-medium text-red-600">
                                Unknown Tenant
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {unit ? (
                              <a
                                href={`/properties/units/${unit.unit_number}`}
                                className="font-medium text-gray-900 hover:underline"
                              >
                                Unit {unit.unit_number}
                              </a>
                            ) : (
                              <span className="font-medium text-red-600">
                                Unknown Unit
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-900">
                            ₱{Number(lease.monthly_rent).toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {new Date(lease.start_date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
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
