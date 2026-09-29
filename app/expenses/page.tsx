"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Expense = {
  id: string;
  expense_date: string;
  category: string;
  description: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  property_id: string;
  properties: {
  name: string;
}[] | null;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExpenses() {
      const { data, error } = await supabase
        .from("expenses")
        .select(
          `
            id,
            expense_date,
            category,
            description,
            amount,
            payment_method,
            notes,
            property_id,
            properties (
              name
            )
          `
        )
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setExpenses((data as Expense[]) ?? []);
      setLoading(false);
    }

    loadExpenses();
  }, []);

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  }

  function formatCategory(category: string) {
    return category.replaceAll("_", " ");
  }

  function formatPaymentMethod(method: string) {
    return method.replaceAll("_", " ");
  }

  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track expenses for your properties.
          </p>
        </div>

        <Link
          href="/expenses/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Record Expense
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-gray-500">Total Expenses</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">
          {formatAmount(totalExpenses)}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading expenses...
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-gray-500">
              No expenses recorded yet.
            </p>

            <Link
              href="/expenses/new"
              className="mt-3 inline-block text-sm font-medium text-gray-900 underline"
            >
              Record your first expense
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Property
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Payment Method
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatDate(expense.expense_date)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {expense.properties?.[0]?.name ?? "Unknown Property"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatCategory(expense.category)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{expense.description}</div>

                      {expense.notes && (
                        <div className="mt-1 text-xs text-gray-400">
                          {expense.notes}
                        </div>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                      {formatAmount(Number(expense.amount))}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {formatPaymentMethod(expense.payment_method)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}