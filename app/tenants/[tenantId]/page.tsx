import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EditTenant from "./EditTenant";
import EndLeaseButton from "./EndLeaseButton";

export default async function TenantDetailsPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .single();

  if (tenantError || !tenant) {
    notFound();
  }

  const { data: leases, error: leasesError } = await supabase
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
        units (
          unit_number,
          floor
        )
      `
    )
    .eq("tenant_id", tenant.id)
    .order("start_date", { ascending: false });

  const { data: payments, error: paymentsError } =
    await supabase
      .from("payments")
      .select(
        `
          id,
          amount,
          payment_date,
          payment_method,
          notes,
          unit_id,
          units (
            unit_number
          )
        `
      )
      .eq("tenant_id", tenant.id)
      .order("payment_date", { ascending: false });

  const activeLease =
    leases?.find((lease) => lease.status === "ACTIVE") ?? null;

  const activeLeaseUnit = activeLease?.units
    ? Array.isArray(activeLease.units)
      ? activeLease.units[0]
      : activeLease.units
    : null;

  const endedLeases =
    leases?.filter((lease) => lease.status === "ENDED") ?? [];

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/tenants"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Tenants
          </Link>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {tenant.first_name} {tenant.last_name}
            </h1>

            <p className="mt-1 text-gray-600">
              Tenant Details
            </p>
          </div>

          <EditTenant
            tenant={{
              id: tenant.id,
              first_name: tenant.first_name,
              last_name: tenant.last_name,
              phone: tenant.phone,
              email: tenant.email,
              notes: tenant.notes,
            }}
          />
        </header>

        {/* Contact Information */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Contact Information
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                First Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {tenant.first_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Last Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {tenant.last_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Phone
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {tenant.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {tenant.email || "Not provided"}
              </p>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Notes
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-gray-600">
            {tenant.notes || "No notes added."}
          </p>
        </section>

        {/* Current Lease */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Current Lease
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current rental agreement
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeLease && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              )}

              {!activeLease && (
                <Link
                  href={`/leases/new?tenantId=${tenant.id}`}
                  className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Add Lease
                </Link>
              )}
            </div>
          </div>

          {leasesError ? (
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Unable to load lease information.
              </p>

              <p className="mt-1 text-xs text-red-600">
                {leasesError.message}
              </p>
            </div>
          ) : activeLease ? (
            <div className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Unit */}
                <div>
                  <p className="text-sm text-gray-500">
                    Unit
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {activeLeaseUnit
                      ? `Unit ${activeLeaseUnit.unit_number}`
                      : "Unknown"}
                  </p>

                  {activeLeaseUnit && (
                    <p className="mt-1 text-sm text-gray-500">
                      {activeLeaseUnit.floor}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-gray-500">
                    Status
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {activeLease.status}
                  </p>
                </div>

                {/* Start Date */}
                <div>
                  <p className="text-sm text-gray-500">
                    Start Date
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {new Date(
                      activeLease.start_date
                    ).toLocaleDateString()}
                  </p>
                </div>

                {/* End Date */}
                <div>
                  <p className="text-sm text-gray-500">
                    End Date
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {activeLease.end_date
                      ? new Date(
                          activeLease.end_date
                        ).toLocaleDateString()
                      : "No end date"}
                  </p>
                </div>

                {/* Monthly Rent */}
                <div>
                  <p className="text-sm text-gray-500">
                    Monthly Rent
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    ₱
                    {Number(
                      activeLease.monthly_rent
                    ).toLocaleString()}
                  </p>
                </div>

                {/* Security Deposit */}
                <div>
                  <p className="text-sm text-gray-500">
                    Security Deposit
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {activeLease.security_deposit !== null
                      ? `₱${Number(
                          activeLease.security_deposit
                        ).toLocaleString()}`
                      : "Not specified"}
                  </p>
                </div>

                {/* Lease Notes */}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">
                    Lease Notes
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-gray-600">
                    {activeLease.notes ||
                      "No lease notes added."}
                  </p>
                </div>
              </div>

              {/* End Lease */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <EndLeaseButton
                  leaseId={activeLease.id}
                  unitId={activeLease.unit_id}
                />
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="font-medium text-gray-900">
                No active lease
              </p>

              <p className="mt-1 text-sm text-gray-500">
                This tenant does not currently have an active lease.
              </p>
            </div>
          )}
        </section>

        {/* Payment History */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recorded rent payments
              </p>
            </div>

            {activeLease && (
              <Link
                href={`/payments/new?tenantId=${tenant.id}`}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                + Record Payment
              </Link>
            )}
          </div>

          {paymentsError ? (
            <div className="mt-6 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Unable to load payment history.
              </p>

              <p className="mt-1 text-xs text-red-600">
                {paymentsError.message}
              </p>
            </div>
          ) : payments && payments.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Amount
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Method
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Unit
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Notes
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => {
                    const paymentUnit = payment.units
                      ? Array.isArray(payment.units)
                        ? payment.units[0]
                        : payment.units
                      : null;

                    return (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(
                            payment.payment_date
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₱
                          {Number(
                            payment.amount
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.payment_method
                            .replace("_", " ")}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {paymentUnit
                            ? `Unit ${paymentUnit.unit_number}`
                            : "Unknown"}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-6 text-center">
              <p className="font-medium text-gray-900">
                No payments recorded
              </p>

              <p className="mt-1 text-sm text-gray-500">
                No rent payments have been recorded for this tenant yet.
              </p>
            </div>
          )}
        </section>

        {/* Lease History */}
        {endedLeases.length > 0 && (
          <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              Lease History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Previous rental agreements
            </p>

            <div className="mt-6 space-y-4">
              {endedLeases.map((lease) => {
                const leaseUnit = lease.units
                  ? Array.isArray(lease.units)
                    ? lease.units[0]
                    : lease.units
                  : null;

                return (
                  <div
                    key={lease.id}
                    className="rounded-lg border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {leaseUnit
                            ? `Unit ${leaseUnit.unit_number}`
                            : "Unknown Unit"}
                        </p>

                        {leaseUnit && (
                          <p className="mt-1 text-sm text-gray-500">
                            {leaseUnit.floor}
                          </p>
                        )}
                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        Ended
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Start Date
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {new Date(
                            lease.start_date
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          End Date
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          {lease.end_date
                            ? new Date(
                                lease.end_date
                              ).toLocaleDateString()
                            : "No end date"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Monthly Rent
                        </p>

                        <p className="mt-1 font-medium text-gray-900">
                          ₱
                          {Number(
                            lease.monthly_rent
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}