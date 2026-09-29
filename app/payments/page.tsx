import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const { data: payments, error } = await supabase
    .from("payments")
    .select(
      `
        id,
        amount,
        payment_date,
        payment_method,
        notes,
        tenants (
          first_name,
          last_name
        ),
        units (
          unit_number
        )
      `
    )
    .order("payment_date", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payments
            </h1>

            <p className="mt-1 text-gray-600">
              View recorded tenant payments.
            </p>
          </div>

          <Link
            href="/tenants"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Record Payment
          </Link>
        </header>

        {/* Error */}
        {error ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                Unable to load payments.
              </p>

              <p className="mt-1 text-xs text-red-600">
                {error.message}
              </p>
            </div>
          </section>
        ) : payments && payments.length > 0 ? (
          /* Payment Table */
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Date
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Tenant
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Unit
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
                  {payments.map((payment) => {
                    const paymentTenant = payment.tenants
                      ? Array.isArray(payment.tenants)
                        ? payment.tenants[0]
                        : payment.tenants
                      : null;

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

                        <td className="px-4 py-3 font-medium text-gray-900">
                          {paymentTenant
                            ? `${paymentTenant.first_name} ${paymentTenant.last_name}`
                            : "Unknown Tenant"}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {paymentUnit
                            ? `Unit ${paymentUnit.unit_number}`
                            : "Unknown"}
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₱
                          {Number(
                            payment.amount
                          ).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {payment.payment_method.replace(
                            "_",
                            " "
                          )}
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
          </section>
        ) : (
          /* Empty State */
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-900">
                No payments recorded
              </p>

              <p className="mt-1 text-sm text-gray-500">
                No tenant payments have been recorded yet.
              </p>

              <Link
                href="/tenants"
                className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Go to Tenants
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}