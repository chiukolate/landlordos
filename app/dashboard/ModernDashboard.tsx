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
    <main
      className="min-h-screen bg-[#f5f5f7] px-6 py-8 text-slate-900"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        backgroundImage:
          "linear-gradient(120deg, rgba(129, 140, 248, 0.2) 0%, transparent 32%), linear-gradient(245deg, rgba(34, 211, 238, 0.16) 0%, transparent 37%), linear-gradient(25deg, rgba(251, 113, 133, 0.09) 0%, transparent 42%)",
      }}
    >
      <div className="mx-auto max-w-[1400px]">
        <section className="relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/80 px-8 py-8 text-white shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur-2xl sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(115deg, rgba(79, 70, 229, 0.32) 0%, transparent 42%), linear-gradient(245deg, rgba(6, 182, 212, 0.22) 0%, transparent 40%), linear-gradient(160deg, transparent 34%, rgba(124, 58, 237, 0.18) 57%, transparent 82%)",
            }}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="mt-3 text-3xl font-normal sm:text-4xl">
                  {data.property.name}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {data.property.address}
                </p>
              </div>

            </div>

            <div className="mt-10">
              <p className="mt-1 max-w-2xl text-2xl font-normal text-white sm:text-3xl">
                Manage your property at a glance.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                <p className="text-xs font-medium text-slate-400">
                  Total units
                </p>

                <p className="mt-2 text-3xl font-normal">
                  {data.propertyUnits.length}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                <p className="text-xs font-medium text-slate-400">
                  Occupied
                </p>

                <p className="mt-2 text-3xl font-normal">
                  {
                    data.propertyUnits.filter(
                      (unit) => unit.status === "OCCUPIED"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
                <p className="text-xs font-medium text-slate-400">
                  Occupancy
                </p>

                <p className="mt-2 text-3xl font-normal">
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
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-white/80 bg-white/60 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                  Occupancy
                </p>

                <h2 className="mt-2 text-xl font-medium text-slate-950">
                  Current occupancy
                </h2>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                {data.propertyUnits.length} units
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
              <div className="relative h-40 w-40 shrink-0">
                <svg
                  viewBox="0 0 120 120"
                  className="h-full w-full -rotate-90"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    className="text-slate-100"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="9"
                    strokeLinecap="round"
                    className="text-indigo-600"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={
                      2 *
                      Math.PI *
                      50 *
                      (1 -
                        (data.propertyUnits.length > 0
                          ? data.propertyUnits.filter(
                              (unit) => unit.status === "OCCUPIED"
                            ).length / data.propertyUnits.length
                          : 0))
                    }
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-medium text-slate-950">
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

                  <span className="mt-1 text-xs font-normal text-slate-400">
                    occupied
                  </span>
                </div>
              </div>

              <div className="w-full space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-950">
                    Occupied units
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      data.propertyUnits.filter(
                        (unit) => unit.status === "OCCUPIED"
                      ).length
                    }{" "}
                    units currently generating rental income
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-950">
                    Vacant units
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      data.propertyUnits.filter(
                        (unit) => unit.status === "VACANT"
                      ).length
                    }{" "}
                    units available for lease
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/60 p-7 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
              Property
            </p>

            <h2 className="mt-2 text-xl font-medium text-slate-950">
              {data.property.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {data.property.address}
            </p>

            <div className="mt-8 border-t border-slate-100 pt-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Active leases
                </p>

                <p className="mt-2 text-2xl font-normal text-slate-950">
                  {data.activeLeases.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/80 bg-white/65 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-medium text-slate-900">
                Units
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your rental units
              </p>
            </div>

            <span className="text-sm font-medium text-slate-500">
              {data.propertyUnits.length} units
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.propertyUnits.map((unit) => {
              const lease = leaseByUnitId.get(unit.id);
              const tenant = lease
                ? tenantById.get(lease.tenant_id)
                : null;

              return (
                <div
                  key={unit.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <a
                      href={`/properties/units/${unit.unit_number}`}
                      className="flex h-10 w-14 items-center justify-center rounded-xl bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                      {unit.unit_number}
                    </a>

                    <div>
                      <p className="font-medium tracking-[-0.01em] text-slate-950">
                        {tenant
                          ? `${tenant.first_name} ${tenant.last_name}`
                          : "Currently vacant"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {unit.floor} · ₱
                        {Number(
                          unit.monthly_rent ?? 0
                        ).toLocaleString()}
                        {" / month"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
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
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-white/80 bg-white/65 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-medium text-slate-900">
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
                  className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-700">
                      {unit?.unit_number ?? "—"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-950">
                        {tenant
                          ? `${tenant.first_name} ${tenant.last_name}`
                          : "Unknown tenant"}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {unit
                          ? `Unit ${unit.unit_number} · ${unit.floor}`
                          : "Unknown unit"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 sm:justify-end">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        ₱{Number(lease.monthly_rent).toLocaleString()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Monthly rent
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-600">
                        {new Date(lease.start_date).toLocaleDateString()}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
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
