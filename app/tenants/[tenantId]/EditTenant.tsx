"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Tenant = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
};

export default function EditTenant({
  tenant,
}: {
  tenant: Tenant;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const [firstName, setFirstName] = useState(tenant.first_name);
  const [lastName, setLastName] = useState(tenant.last_name);
  const [phone, setPhone] = useState(tenant.phone ?? "");
  const [email, setEmail] = useState(tenant.email ?? "");
  const [notes, setNotes] = useState(tenant.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleEdit() {
    setFirstName(tenant.first_name);
    setLastName(tenant.last_name);
    setPhone(tenant.phone ?? "");
    setEmail(tenant.email ?? "");
    setNotes(tenant.notes ?? "");

    setError("");
    setSuccess(false);
    setIsEditing(true);
  }

  function handleCancel() {
    if (saving) {
      return;
    }

    setIsEditing(false);
    setError("");
  }

  async function handleSave() {
    setError("");
    setSuccess(false);

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    setSaving(true);

    const { data, error: updateError } = await supabase
      .from("tenants")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        notes: notes.trim() || null,
      })
      .eq("id", tenant.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (!data) {
      setError("No tenant record was updated.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    setIsEditing(false);

    window.location.reload();
  }

  return (
    <>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleEdit}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Edit Tenant
        </button>
      </div>

      {success && (
        <p className="mt-2 text-right text-sm text-green-600">
          Tenant updated successfully.
        </p>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Tenant
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update this tenant's information.
              </p>
            </div>

            <div className="space-y-5">
              {/* First Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  First Name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Last Name
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Notes
                </label>

                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}