LandlordOS — Project Handoff
Complete project handoff from project start through v0.7.0
Prepared October 1, 2026
<b>Purpose:</b> Working source of truth for continuing LandlordOS in a new chat: project history, architecture, database, completed
work, billing model, current implementation, known limitations, and the immediate next task.
1. Project Overview
• <b>Project:</b> LandlordOS
• <b>Purpose:</b> Personal/property-management web application for managing a small apartment property, tenants, leases,
payments, bills, expenses, and maintenance.
• <b>Development style:</b> One small feature at a time; test locally; run a production build before meaningful Git checkpoints; push
to GitHub/Vercel.
• <b>UI preference:</b> Simple, clean, practical. Avoid feature creep.
• <b>User workflow preference:</b> Exact paths and commands, preferably complete file replacements, one issue at a time.
2. Technology Stack
• macOS / MacBook
• Next.js 16.3.6
• React + TypeScript
• Tailwind CSS
• Next.js App Router
• Turbopack
• Supabase JS + Supabase database
• VS Code
• Git / GitHub
• Vercel
• Local development: http://localhost:3000
3. Environment
• No src/ directory; app folders are directly under the project root.
• <b>lib/supabase.ts</b> creates the Supabase client using NEXT_PUBLIC_SUPABASE_URL and
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
• <b>.gitignore</b> contains .env*; credentials must never be committed.
• <b>components/Sidebar.tsx</b> navigation: Dashboard, Properties, Tenants, Bills, Payments, Expenses, Maintenance.
4. Property Baseline
• <b>Property:</b> C&amp;A Suites - Bacolod
• <b>Address:</b> Jasper St., City Heights Subd., Bacolod City
• <b>Property ID:</b> d073c3d5-90f7-47c0-a992-77239da41696
• <b>Units:</b> fixed 8-unit property.
5. Unit IDs
• 1001 — 2e02f9ba-4422-4e91-8b6f-4e77f6d4f2c8
• 1002 — 265bf94d-6738-4c16-98f4-23c69a67d728
• 1003 — f9b5790b-3ad7-4584-b25d-f03254f6b70c
• 1004 — 63da733b-cb7c-4973-b380-6a6f8cb0b3e0
• 2001 — 955f1784-57f8-42a9-96b7-7b35747aaa53
• 2002 — c693ff35-9cce-49a0-8600-af08c97a1c79
• 2003 — b9f1d67f-0822-4ae7-adf7-a93db97b43aa
• 2004 — e8f877a0-0221-4cf1-86e3-f9c838359b4f
6. Database Schema
• <b>properties:</b> id uuid; name text; address text; created_at timestamptz
• <b>units:</b> id uuid; property_id uuid; unit_number text; floor text; monthly_rent numeric; status text; notes text
• <b>tenants:</b> id uuid; first_name text; last_name text; phone text; email text; notes text; created_at timestamptz
• <b>leases:</b> id uuid; tenant_id uuid; unit_id uuid; start_date date; end_date date; monthly_rent numeric; security_deposit numeric;
status text; notes text; created_at timestamptz
• <b>payments:</b> id uuid; tenant_id uuid; unit_id uuid; lease_id uuid; amount numeric; payment_date date; payment_method text;
notes text; created_at timestamptz; monthly_bill_id uuid
• <b>expenses:</b> id uuid; property_id uuid; expense_date date; category text; description text; amount numeric; payment_method
text; notes text
• <b>monthly_bills:</b> id uuid; property_id uuid; unit_id uuid; tenant_id uuid nullable; lease_id uuid nullable; billing_month date;
rent_amount numeric; electricity_before/after/usage/rate numeric nullable; electricity_amount numeric; adjustment numeric;
adjustment_reason text; total_amount_due numeric; status text; notes text; created_at timestamptz
7. Monthly Bills Database Rules
• status is UNPAID, PARTIAL, or PAID.
• UNIQUE(unit_id, billing_month): one bill per unit per billing month.
• billing_month must be the first day of its month.
• rent_amount, electricity_amount, and total_amount_due cannot be negative.
• payments.monthly_bill_id references monthly_bills(id), with an index on that column.
• RLS policies exist for monthly_bills SELECT/INSERT/UPDATE.
8. Billing Model
• <b>Core rule:</b> Bill = what tenant owes. Payment = money actually received.
• A bill can have zero, one, or many payments.
• <b>Status:</b> total paid &lt;= 0 → UNPAID; total paid &lt; total due → PARTIAL; total paid &gt;= total due → PAID.
• <b>Electricity:</b> usage = after − before; raw charge = usage × rate; final electricity = raw charge + adjustment; total due = rent +
final electricity.
• <b>Important:</b> the adjustment is already included in electricity_amount and must not be subtracted twice.
9. Workbook Findings
• Historical workbook sheets cover 2024, 2025, and 2026 monthly rental logs, collections, and electricity monitoring.
• The workbook contains partial payments, late payments, overpayments, carry-forward credits, separate rent/electricity payments,
security deposits applied to rent, Airbnb timing, and adjustments.
• Therefore the application must not assume one bill equals one payment.
• <b>January 2026 Unit 1001:</b> 3092 → 3264; 172 kWh; ■13.50/kWh; raw ■2,322; adjustment -■200; electricity ■2,122; rent
■5,000; total ■7,122.
10. Historical Data Cleanup
• Tenants, leases, payments, and expenses were intentionally deleted so the workbook could be reviewed with the bookkeeper before
real historical import.
• At that cleanup point: 1 property, 8 units, 0 tenants, 0 leases, 0 payments, 0 expenses.
• Do not assume historical records currently exist unless subsequently re-created.
11. Completed User Stories
• US-001 Properties — DONE
• US-002 Units by property — DONE
• US-003 Unit number/floor/rent — DONE
• US-004 Unit details — DONE
• US-005 Edit unit — DONE
• US-008 Persist property/unit — DONE
• US-009 Real dashboard — DONE
• US-010 Dashboard from Supabase — DONE
• US-011 Tenant foundation — DONE
• US-012 Tenant details — DONE
• US-013 Edit Tenant — DONE
• US-014 Create Lease — DONE
• US-015 Tenant & Lease on Unit — DONE
• US-016 OCCUPIED automatically — DONE
• US-017 Prevent leasing occupied unit — DONE
• US-018 End lease — DONE
• US-019 Lease History — DONE
• US-020 Navigation — DONE
• US-021 Record Payment — DONE
• US-022 All Payments — DONE
• US-023 Property Expense — DONE
• US-024 Maintenance — DONE
• US-025A Monthly Bill basic — DONE/current
• US-025B Monthly Bill Details — IMPLEMENTED in v0.7.0; refinement in progress
• US-006 Add unit and US-007 Remove/deactivate unit were intentionally skipped because the property has a fixed 8-unit structure.
12. Git Baseline
• <b>Current:</b> v0.7.0
• <b>Commit:</b> c401bfe — LandlordOS v0.7.0 - Monthly Bills and Linked Payments
• <b>Remote:</b> origin/main
• <b>Backup branch:</b> backup/bills-work
• <b>History:</b> v0.6.3 c6b70c4; v0.6.2 b738b72; v0.6.1 cd5106b; v0.6.0 07f36cd; v0.5.0 df70bce; v0.4.0 34f7b5b; v0.3.0 72d8599;
v0.2.0 fd670e5; v0.1.0 c19d276; initial 0cab696.
13. Vercel / Production
• Deployment flow: Mac → GitHub → Vercel → LandlordOS online → Supabase.
• Vercel variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for Production,
Preview, Development.
• Known production URL: https://landlordosv1-git-main-land-lord-os.vercel.app/
• npm run build has passed successfully for the current baseline.
14. Current Bills Page
• <b>app/bills/page.tsx:</b> lists bills newest first and shows property, unit, billing month, rent, electricity, adjustment, total due, linked
payments, remaining balance, and status.
• Linked payments are summed through payments.monthly_bill_id.
• Remaining balance currently uses max(total due − total paid, 0).
• <b>Known limitation:</b> overpayments are clamped to zero and are not yet represented as carry-forward credits.
15. Current Create Bill Page
• <b>app/bills/new/page.tsx:</b> property → unit → billing month → rent → electricity readings/rate → optional adjustment/reason →
total → save.
• The database unique constraint protects against duplicate unit/month bills.
• Current improvement opportunities: friendlier duplicate-month error and friendly validation for an invalid final amount.
16. Current Record Payment Page
• <b>app/payments/new/page.tsx:</b> tenant → active lease → unit → monthly bill → amount → payment date/method/notes.
• Payments are inserted with monthly_bill_id.
• After insertion, all payments for the bill are summed and bill status is recalculated.
• PAID bills cannot receive another payment through the current form.
• <b>Known limitation:</b> bills are currently loaded by unit rather than explicitly constrained by tenant/lease.
• <b>Known usability issue:</b> selecting a bill defaults payment amount to the bill's full total instead of the remaining balance after
earlier payments.
17. Test / Demo Data
• A test tenant and lease were used for billing/payment testing; they should not be treated as historical production data.
• January 2026 Unit 1001 test bill: ■5,000 rent + ■2,122 electricity = ■7,122 total.
• Multiple payments were tested successfully and the bill reached PAID at ■7,122 total paid.
18. Immediate Next Task
• <b>Do not redesign billing.</b> Make one focused payment-form improvement.
• On bill selection: load payments linked to that bill, calculate Total Due, Already Paid, and Remaining Balance, display those values,
and default Payment Amount to Remaining Balance.
• <b>Example:</b> Bill ■7,122; already paid ■5,000; remaining ■2,122 → payment field defaults to ■2,122.
• After implementation: test locally → npm run build → Git checkpoint → git push.
19. Future Billing Items — Not Yet Implemented
• Overpayment / carry-forward credit handling.
• Historical payment import from the workbook.
• Historical rent/electricity reconciliation.
• Tenant/lease-aware bill filtering.
• Friendly duplicate-bill validation.
• Bill detail and richer payment history.
20. White-Label / Customization Roadmap
• Future Settings → Customization area.
• Possible organization settings: name, logo, colors, currency, phone, email, address, dashboard name, browser title, login/email
branding, footer, branding enabled.
• Do not turn LandlordOS into a full multi-tenant SaaS platform yet.
21. Development Rules
• One small task at a time.
• Read the existing file before changing it.
• Prefer complete file replacements.
• Never expose Supabase credentials.
• Test the exact user flow locally.
• Run npm run build before meaningful Git checkpoints.
• Commit meaningful milestones.
• Push successful milestones to origin/main.
• Avoid unnecessary resets/rebases/merges or destructive database operations.
• Avoid feature creep.
22. Current Handoff State
• <b>Stable baseline:</b> v0.7.0 / c401bfe.
• <b>Current area:</b> Monthly Bills + Linked Payments.
• <b>Last reviewed:</b> app/bills/page.tsx, app/bills/new/page.tsx, app/payments/new/page.tsx.
• <b>Next action:</b> refine Record Payment to calculate/display bill balance before recording a payment.
• <b>Important:</b> do not implement overpayment/carry-forward accounting yet; first make the normal partial-payment workflow
accurate and easy to use.