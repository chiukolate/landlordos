export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DashboardSwitcher from "@/app/dashboard/DashboardSwitcher";

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
          unit_id
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

  const tenantIds =
    activeLeases
      ?.map((lease) => lease.tenant_id)
      .filter(Boolean) ?? [];

  const { data: tenants, error: tenantsError } =
    tenantIds.length > 0
      ? await supabase
          .from("tenants")
          .select("id, first_name, last_name")
          .in("id", tenantIds)
      : { data: [], error: null };

  if (tenantsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load tenant data
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {tenantsError.message}
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

  const dashboardData = {
    property,
    propertyUnits,
    activeLeases: activeLeases ?? [],
    tenants: tenants ?? [],
  };

  const totalUnits = propertyUnits.length;

  const occupiedUnits = propertyUnits.filter(
    (unit) => unit.status === "OCCUPIED"
  ).length;

  const vacantUnits = propertyUnits.filter(
    (unit) => unit.status === "VACANT"
  ).length;

  const activeLeaseCount = activeLeases?.length ?? 0;

  const tenantById = new Map(
    (tenants ?? []).map((tenant) => [
      tenant.id,
      tenant,
    ])
  );

  const unitById = new Map(
    (units ?? []).map((unit) => [
      unit.id,
      unit,
    ])
  );

  return (
    <DashboardSwitcher data={dashboardData} />
  );
}