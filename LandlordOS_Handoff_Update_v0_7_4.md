# LandlordOS — Handoff Update (v0.7.1 → v0.7.4)

Appends to *LandlordOS Project Handoff v0.7.0*. Where the two differ, this update wins.

## Current baseline

- **Version:** v0.7.4
- **Commit:** `bde96d3` — LandlordOS v0.7.4 - Friendly duplicate bill and invalid amount errors
- **Remote:** origin/main (in sync)
- **Build:** `npm run build` run before each checkpoint

## Commits since v0.7.0

| Version | Commit | Change |
|---|---|---|
| v0.7.1 | `960d28f` | Record Payment shows Total Due, Already Paid, Remaining Balance; amount defaults to remaining balance |
| v0.7.2 | `f7c6aaf` | Tenants list: Unit column for active tenants |
| v0.7.3 | `55f8f65` | Tenants list: Unassigned Tenants section |
| v0.7.4 | `bde96d3` | Create Bill: friendly duplicate-month and invalid-amount errors |

Also in history: `518dbf9` Add project handoff notes (HANDOFF.md).

## What changed

### Record Payment — `app/payments/new/page.tsx` (v0.7.1)
- On bill selection, loads payments linked via `monthly_bill_id` and sums them into Already Paid.
- Summary box shows Total Due, Already Paid, Remaining Balance.
- Payment Amount defaults to Remaining Balance (editable). Example: ₱7,122 due, ₱5,000 paid → defaults to ₱2,122.00.
- Stale-response guard on the loading effect; submit button disabled while the balance loads.
- Billing model unchanged. No overpayment or carry-forward logic added.

### Tenants list — `app/tenants/page.tsx` (v0.7.2, v0.7.3)
- Leases query now joins `units (unit_number, floor)`.
- Active Tenants table has a Unit column (unit number, floor underneath).
- Three sections:
  - **Active:** has an ACTIVE lease.
  - **Previous:** has had a lease, none active.
  - **Unassigned:** has never had a lease.
- The tenant detail page (`app/tenants/[tenantId]/page.tsx`) was reviewed and needed no change.

### Create Bill — `app/bills/new/page.tsx` (v0.7.4)
- Postgres unique violation (`23505`) shows: "A bill for Unit X already exists for Month YYYY. Choose a different month, or check the Bills page."
- Pre-save checks with plain-language messages for: negative rent, negative final electricity (adjustment larger than the charge), negative total due.
- Billing math unchanged: usage = after − before; charge = usage × rate; electricity_amount = charge + adjustment; total = rent + electricity_amount. The adjustment is already inside electricity_amount.

## Known limitations (unchanged or still open)

- Overpayments are clamped to zero in the Bills list and are not carried forward as credits.
- Record Payment loads bills by unit, not by tenant/lease.
- Create Bill error text prints a negative adjustment as `₱-5000.00` (cosmetic; no thousands separator).
- Historical workbook data is not imported (pending bookkeeper review).

## Test data note

A bill for Unit 1001 for September 2026 already exists (the duplicate-month test hit it), and a January 2026 Unit 1001 test bill (₱7,122) exists from earlier testing. Treat both as test data, not history, and clean up before the real import.

## Next tasks (suggested order)

1. **Tenant/lease-aware bill filtering** in Record Payment, ideally before any historical import.
2. **Bill detail page** with every linked payment (date, method, amount).
3. **Overpayment / carry-forward credits:** only after the rules are agreed with the bookkeeper.
4. **Historical import:** only after the bookkeeper review of the workbook.

## Working rules (unchanged)

One small task at a time. Read the existing file before changing it. Prefer complete file replacements with exact paths. Test the exact user flow locally, run `npm run build`, then commit and push each milestone as its own commit. Never expose Supabase credentials. Avoid feature creep and destructive database operations.
