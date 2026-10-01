import type { DashboardData } from "./types";

export default function ModernDashboard({
  data,
}: {
  data: DashboardData;
}) {
  const tenantById = new Map(
    data.tenants.map((tenant) => [tenant.id, tenant])
  );

  const leaseByUnitId = new Map(
    data.activeLeases.map((lease) => [lease.unit_id, lease])
  );

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Property Overview
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              {data.property.name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {data.property.address}
            </p>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Units</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {data.propertyUnits.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Occupied</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {data.propertyUnits.filter(
                (unit) => unit.status === "OCCUPIED"
              ).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Vacant</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {data.propertyUnits.filter(
                (unit) => unit.status === "VACANT"
              ).length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active Leases</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {data.activeLeases.length}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Occupancy Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current status of your rental units.
                </p>
              </div>

              <span className="text-sm font-medium text-slate-500">
                {data.propertyUnits.length > 0
                  ? Math.round(
                      (data.propertyUnits.filter(
                        (unit) => unit.status === "OCCUPIED"
                      ).length /
                        data.propertyUnits.length) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${
                    data.propertyUnits.length > 0
                      ? (data.propertyUnits.filter(
                          (unit) => unit.status === "OCCUPIED"
                        ).length /
                          data.propertyUnits.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">
                Occupied{" "}
                <span className="font-medium text-slate-900">
                  {data.propertyUnits.filter(
                    (unit) => unit.status === "OCCUPIED"
                  ).length}
                </span>
              </span>

              <span className="text-slate-500">
                Vacant{" "}
                <span className="font-medium text-slate-900">
                  {data.propertyUnits.filter(
                    (unit) => unit.status === "VACANT"
                  ).length}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Property
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {data.property.name}
            </p>

            <div className="mt-6">
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {data.property.address}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Unit Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current status and standard rental rates.
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {data.propertyUnits.length} units
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.propertyUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700">
                    {unit.unit_number}
                  </div>

                  <div>
                    <a
                      href={`/properties/units/${unit.unit_number}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      Unit {unit.unit_number}
                    </a>

                    {(() => {
                      const lease = leaseByUnitId.get(unit.id);
                      const tenant = lease
                        ? tenantById.get(lease.tenant_id)
                        : null;

                      return (
                        <p className="mt-0.5 text-sm text-slate-500">
                          {tenant
                            ? `${tenant.first_name} ${tenant.last_name}`
                            : "Currently vacant"}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <p className="text-sm font-medium text-slate-900">
                    {unit.monthly_rent !== null
                      ? `₱${Number(unit.monthly_rent).toLocaleString()}`
                      : "Unknown"}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      unit.status === "OCCUPIED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Active Leases
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current tenants and lease details.
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {data.activeLeases.length} active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.activeLeases.map((lease) => {
              const tenant = tenantById.get(lease.tenant_id);
              const unit = data.propertyUnits.find(
                (item) => item.id === lease.unit_id
              );

              return (
                <div
                  key={lease.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {tenant
                        ? `${tenant.first_name} ${tenant.last_name}`
                        : "Unknown tenant"}
                    </p>

                    <p className="mt-0.5 text-sm text-slate-500">
                      {unit ? `Unit ${unit.unit_number}` : "Unknown unit"}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        ₱{Number(lease.monthly_rent).toLocaleString()}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Monthly rent
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {new Date(lease.start_date).toLocaleDateString()}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Start date
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
