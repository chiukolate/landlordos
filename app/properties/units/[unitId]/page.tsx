import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

import UnitDetails from "./UnitDetails";

export default async function UnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;

  const { data: unit, error: unitError } = await supabase
    .from("units")
    .select("*")
    .eq("unit_number", unitId)
    .single();

  if (unitError || !unit) {
    notFound();
  }

  const { data: leases, error: leaseError } = await supabase
    .from("leases")
    .select(
      `
        id,
        start_date,
        end_date,
        monthly_rent,
        security_deposit,
        status,
        notes,
        unit_id,
        tenant_id
      `
    )
    .eq("unit_id", unit.id)
    .eq("status", "ACTIVE")
    .order("start_date", { ascending: false })
    .limit(1);

  let activeLease = null;

  if (leases?.[0]) {
    const lease = leases[0];

    const { data: tenant, error: tenantError } =
      await supabase
        .from("tenants")
        .select(
          `
            id,
            first_name,
            last_name,
            phone,
            email
          `
        )
        .eq("id", lease.tenant_id)
        .single();

    activeLease = {
      ...lease,
      tenants: tenantError ? null : tenant,
    };
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm text-gray-500">
            C&A Suites - Bacolod
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Unit {unit.unit_number}
          </h1>

          <p className="mt-1 text-gray-600">
            {unit.floor}
          </p>
        </header>

        <UnitDetails
          unit={{
            unit: unit.unit_number,
            floor: unit.floor,
            rent:
              unit.monthly_rent !== null
                ? Number(unit.monthly_rent)
                : null,
            status: unit.status,
            notes: unit.notes,
          }}
          leaseError={leaseError?.message ?? ""}
          activeLease={activeLease}
        />
      </div>
    </main>
  );
}