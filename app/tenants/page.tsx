import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
};

type LeaseUnit = {
  unit_number: string;
  floor: string | null;
};

type Lease = {
  tenant_id: string;
  status: string;
  units: LeaseUnit | LeaseUnit[] | null;
};

export default async function TenantsPage() {
  const { data: tenants, error: tenantsError } = await supabase
    .from("tenants")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: leases, error: leasesError } = await supabase
    .from("leases")
    .select(
      `
        tenant_id,
        status,
        units (
          unit_number,
          floor
        )
      `
    );

  if (tenantsError || leasesError) {
    const errorMessage =
      tenantsError?.message ||
      leasesError?.message ||
      "Unknown database error";

    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Tenants
          </h1>

          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load tenant data
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const allLeases = (leases ?? []) as Lease[];

  const activeLeases = allLeases.filter(
    (lease) => lease.status === "ACTIVE"
  );

  // Tenants who have at least one lease of any status.
  const leasedTenantIds = new Set(
    allLeases.map((lease) => lease.tenant_id)
  );

  const activeTenantIds = new Set(
    activeLeases.map((lease) => lease.tenant_id)
  );

  // Map each tenant to the unit on their active lease.
  const unitByTenantId = new Map<string, LeaseUnit>();

  for (const lease of activeLeases) {
    const unit = Array.isArray(lease.units)
      ? lease.units[0]
      : lease.units;

    if (unit) {
      unitByTenantId.set(lease.tenant_id, unit);
    }
  }

  const activeTenants =
    (tenants as Tenant[] | null)?.filter((tenant) =>
      activeTenantIds.has(tenant.id)
    ) ?? [];

  // Had a lease before, but none is active now.
  const previousTenants =
    (tenants as Tenant[] | null)?.filter(
      (tenant) =>
        leasedTenantIds.has(tenant.id) &&
        !activeTenantIds.has(tenant.id)
    ) ?? [];

  // Never had a lease at all.
  const unassignedTenants =
    (tenants as Tenant[] | null)?.filter(
      (tenant) => !leasedTenantIds.has(tenant.id)
    ) ?? [];

  function TenantTable({
    tenantList,
    showUnit = false,
  }: {
    tenantList: Tenant[];
    showUnit?: boolean;
  }) {
    return (
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-600">
                Name
              </th>

              {showUnit && (
                <th className="px-6 py-4 font-medium text-gray-600">
                  Unit
                </th>
              )}

              <th className="px-6 py-4 font-medium text-gray-600">
                Phone
              </th>

              <th className="px-6 py-4 font-medium text-gray-600">
                Email
              </th>

              <th className="px-6 py-4 font-medium text-gray-600">
                Date Added
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {tenantList.map((tenant) => {
              const unit = unitByTenantId.get(tenant.id);

              return (
                <tr key={tenant.id}>
                  <td className="px-6 py-4">
                    <Link
                      href={`/tenants/${tenant.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {tenant.first_name} {tenant.last_name}
                    </Link>
                  </td>

                  {showUnit && (
                    <td className="px-6 py-4">
                      {unit ? (
                        <>
                          <p className="font-medium text-gray-900">
                            Unit {unit.unit_number}
                          </p>

                          {unit.floor && (
                            <p className="text-xs text-gray-500">
                              {unit.floor}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-600">
                          —
                        </span>
                      )}
                    </td>
                  )}

                  <td className="px-6 py-4 text-gray-600">
                    {tenant.phone || "—"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {tenant.email || "—"}
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {new Date(
                      tenant.created_at
                    ).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tenants
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your tenant records.
            </p>
          </div>

          <Link
            href="/tenants/new"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Tenant
          </Link>
        </header>

        {/* Active Tenants */}
        <section>
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Tenants
              </h2>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {activeTenants.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Tenants with an active lease.
            </p>
          </div>

          {activeTenants.length > 0 ? (
            <TenantTable
              tenantList={activeTenants}
              showUnit
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-medium text-gray-900">
                No active tenants
              </p>

              <p className="mt-1 text-sm text-gray-500">
                There are currently no tenants with an active
                lease.
              </p>
            </div>
          )}
        </section>

        {/* Previous Tenants */}
        <section className="mt-10">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Previous Tenants
              </h2>

              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                {previousTenants.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Tenants whose leases have all ended.
            </p>
          </div>

          {previousTenants.length > 0 ? (
            <TenantTable tenantList={previousTenants} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-medium text-gray-900">
                No previous tenants
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Previous tenants will appear here after their
                leases end.
              </p>
            </div>
          )}
        </section>

        {/* Unassigned Tenants */}
        <section className="mt-10">
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Unassigned Tenants
              </h2>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                {unassignedTenants.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Tenants who have not been given a lease yet.
            </p>
          </div>

          {unassignedTenants.length > 0 ? (
            <TenantTable tenantList={unassignedTenants} />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <p className="font-medium text-gray-900">
                No unassigned tenants
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Tenants without any lease will appear here.
              </p>
            </div>
          )}
        </section>

        {/* Back to Dashboard */}
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}