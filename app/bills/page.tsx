import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const { data: bills, error } = await supabase
    .from("monthly_bills")
    .select(
      `
        id,
        billing_month,
        rent_amount,
        electricity_amount,
        adjustment,
        total_amount_due,
        status,
        properties (
          name
        ),
        units (
          unit_number
        ),
        payments (
          amount
        )
      `
    )
    .order("billing_month", { ascending: false });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Monthly Bills
            </h1>

            <p className="mt-1 text-gray-600">
              View monthly rent and electricity bills.
            </p>
          </div>

          <Link
            href="/bills/new"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Create Bill
          </Link>
        </header>

        {error ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                Unable to load bills.
              </p>

              <p className="mt-1 text-xs text-red-600">
                {error.message}
              </p>
            </div>
          </section>
        ) : bills && bills.length > 0 ? (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-600">
                      Billing Month
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Property
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Unit
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Rent
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Electricity
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Adjustment
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Total Due
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Paid
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Remaining
                    </th>

                    <th className="px-4 py-3 font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {bills.map((bill) => {
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

                    const billPayments = Array.isArray(bill.payments)
                      ? bill.payments
                      : [];

                    const totalPaid = billPayments.reduce(
                      (sum, payment) => sum + Number(payment.amount || 0),
                      0
                    );

                    const totalDue = Number(bill.total_amount_due || 0);

                    const remainingBalance = Math.max(
                      totalDue - totalPaid,
                      0
                    );

                    return (
                      <tr key={bill.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {new Date(
                            `${bill.billing_month}T00:00:00`
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {billProperty?.name || "Unknown"}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {billUnit
                            ? `Unit ${billUnit.unit_number}`
                            : "Unknown"}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          ₱{Number(bill.rent_amount).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          ₱{Number(bill.electricity_amount).toLocaleString()}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {Number(bill.adjustment) === 0
                            ? "—"
                            : `₱${Number(
                                bill.adjustment
                              ).toLocaleString()}`}
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₱{totalDue.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-900">
                          ₱{totalPaid.toLocaleString()}
                        </td>

                        <td className="px-4 py-3 font-semibold text-gray-900">
                          ₱{remainingBalance.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              bill.status === "PAID"
                                ? "bg-green-100 text-green-700"
                                : bill.status === "PARTIAL"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-900">
                No monthly bills recorded
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Create your first monthly bill to get started.
              </p>

              <Link
                href="/bills/new"
                className="mt-5 inline-block rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Create Bill
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}