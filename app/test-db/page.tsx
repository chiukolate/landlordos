import { supabase } from "@/lib/supabase";

export default async function TestDatabasePage() {
  const { data, error } = await supabase
    .from("properties")
    .select("*");

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Database Test
        </h1>

        {error ? (
          <div className="mt-6 rounded-xl bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Database connection failed
            </h2>

            <pre className="mt-3 whitespace-pre-wrap text-sm text-red-700">
              {error.message}
            </pre>
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Database connection successful
            </h2>

            <pre className="mt-4 overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}