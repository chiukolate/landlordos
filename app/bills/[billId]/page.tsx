import Link from "next/link";
import { notFound } from "next/navigation";

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type BillDetailPageProps = {
  params: Promise<{
    billId: string;
  }>;
};

export default async function BillDetailPage({
  params,
}: BillDetailPageProps) {
  const { billId } = await params;

  const { data: bill, error } = await supabase
    .from("monthly_bills")
    .select(
      `
        id,
        billing_month,
        rent_amount,
        electricity_before,
        electricity_after,
        electricity_usage,
        electricity_rate,
        electricity_amount,
        adjustment,
        adjustment_reason,
        total_amount_due,
        status,
        notes,
        created_at,
        properties (
          name
        ),
        units (
          unit_number,
          floor
        ),
        tenants (
          id,
          first_name,
          last_name,
          phone,
          email
        ),
        leases (
          start_date,
          end_date,
          monthly_rent,
          security_deposit,
          status
        ),
        payments (
          id,
          amount,
          payment_date,
          payment_method,
          notes
        )
      `
    )
    .eq("id", billId)
    .single();

  if (error || !bill) {
    notFound();
  }

  const billProperty = bill.properties
    ? Array.isArray(bill.properties)
      ? bill.properties[0]
      : bill.properties
    : null;

  const billUnit = bill.units
    ? Array.isArray(bill.units)
      ? bill.units[0]
      : bill.units
    : null;

  const billTenant = bill.tenants
    ? Array.isArray(bill.tenants)
      ? bill.tenants[0]
      : bill.tenants
    : null;

  const billLease = bill.leases
    ? Array.isArray(bill.leases)
      ? bill.leases[0]
      : bill.leases
    : null;

  const billPayments = Array.isArray(bill.payments) ? bill.payments : [];

  const totalDue = Number(bill.total_amount_due || 0);

  const totalPaid = billPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const remainingBalance = Math.max(totalDue - totalPaid, 0);

  const tenantName = billTenant
    ? `${billTenant.first_name} ${billTenant.last_name}`
    : "Unassigned";

  const formatCurrency = (value: number) =>
    `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (value: string | null) => {
    if (!value) {
      return "—";
    }

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            href="/bills"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            ← Back to Bills
          </Link>
        </div>

        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Bill Details
            </h1>

            <p className="mt-1 text-gray-600">
              {new Date(
                `${bill.billing_month}T00:00:00`
              ).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-medium ${
              bill.status === "PAID"
                ? "bg-green-100 text-green-700"
                : bill.status === "PARTIAL"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {bill.status}
          </span>
        </header>

        <div className="space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Bill Information
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Property
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {billProperty?.name || "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Unit
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {billUnit ? `Unit ${billUnit.unit_number}` : "Unknown"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tenant
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {tenantName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Lease
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {billLease
                    ? `${formatDate(billLease.start_date)} – ${formatDate(
                        billLease.end_date
                      )}`
                    : "Unassigned"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Charges
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rent</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(bill.rent_amount || 0))}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Electricity</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(Number(bill.electricity_amount || 0))}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Adjustment</span>
                <span className="font-medium text-gray-900">
                  {Number(bill.adjustment || 0) === 0
                    ? "—"
                    : formatCurrency(Number(bill.adjustment))}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    Total Due
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Electricity Details
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Previous Reading
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {bill.electricity_before ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Current Reading
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {bill.electricity_after ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Usage
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {bill.electricity_usage ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Rate
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {bill.electricity_rate != null
                    ? formatCurrency(Number(bill.electricity_rate))
                    : "—"}
                </p>
              </div>
            </div>

            {bill.adjustment_reason ? (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Adjustment Reason
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {bill.adjustment_reason}
                </p>
              </div>
            ) : null}

            {bill.notes ? (
              <div className="mt-5 border-t border-gray-200 pt-5">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                  {bill.notes}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Summary
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Due
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(totalDue)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Total Paid
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(totalPaid)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Remaining
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {formatCurrency(remainingBalance)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment History
              </h2>

              {billTenant ? (
                <Link
                  href={`/payments/new?tenantId=${billTenant.id}`}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  + Record Payment
                </Link>
              ) : null}
            </div>

            {billPayments.length > 0 ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-gray-200">
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
                        Notes
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {billPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-gray-600">
                          {formatDate(payment.payment_date)}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatCurrency(Number(payment.amount || 0))}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.payment_method}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <p className="font-medium text-gray-900">
                  No payments recorded
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Payments for this bill will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}