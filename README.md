# LandlordOS

LandlordOS is a property management application for managing rental properties, units, tenants, leases, billing, and payments.

It is designed to make day-to-day rental management simple and organized.

## What You Can Do

LandlordOS currently allows you to:

* View your property dashboard
* Manage rental units
* Add and manage tenants
* Manage leases
* Create monthly bills
* View bill details
* Record tenant payments
* View payment history
* Track occupied and vacant units
* View active leases and rental information

---

# Using LandlordOS

## 1. Dashboard

The dashboard gives you an overview of the property.

You can quickly see:

* Total number of units
* Occupied units
* Vacant units
* Active leases
* Property information
* Current rental information

The dashboard is intended to be the starting point for managing the property.

---

## 2. Properties and Units

Use the property and unit sections to keep track of your rental units.

For each unit, you can see information such as:

* Unit number
* Floor
* Monthly rent
* Occupancy status
* Current tenant, if occupied

A unit can be marked as **Occupied** or **Vacant**.

---

## 3. Tenants

The Tenants section contains the people currently or previously renting your units.

Tenant information is connected to their leases and billing records so that payments and bills can be associated with the correct tenant and unit.

---

## 4. Leases

A lease connects a tenant to a rental unit.

A lease contains information such as:

* Tenant
* Unit
* Start date
* Monthly rent

Active leases are shown on the dashboard for quick reference.

---

# Billing

## 5. Creating a Bill

When creating a monthly bill, select the appropriate:

1. Unit
2. Tenant
3. Lease
4. Billing month
5. Charges

Bills are associated with the tenant and lease for that particular unit.

This helps keep billing records organized when tenants or leases change.

---

## 6. Viewing a Bill

Click the billing month from the Bills section to open the bill details.

The bill detail page shows:

* Bill information
* Charges
* Electricity information
* Payment summary
* Payment history

You can also record a payment directly from the bill.

---

## 7. Recording a Payment

When recording a payment, select the appropriate bill and enter the payment information.

The payment is linked to:

* Tenant
* Unit
* Lease
* Monthly bill

This keeps the payment history connected to the correct rental record.

---

# Recommended Workflow

For normal monthly rental management, the general workflow is:

```text
Property
   ↓
Unit
   ↓
Tenant
   ↓
Lease
   ↓
Monthly Bill
   ↓
Payment
```

For example:

```text
Unit 101
   ↓
John Smith
   ↓
Active Lease
   ↓
October 2026 Bill
   ↓
Payment Received
```

Keeping these relationships correct makes the billing and payment history easier to understand.

---

# Dashboard Views

LandlordOS currently provides different dashboard presentations.

You can switch between the available dashboard styles using the dashboard switcher.

The **Modern** dashboard provides a more visual overview of the property, while the **Classic** dashboard provides a more traditional management view.

Your selected dashboard style is remembered on the device.

---

# Important Notes

LandlordOS is currently under active development.

Some features may still be incomplete or may change as the application continues to be improved.

If something does not work as expected, note:

1. What you were trying to do
2. Which page you were on
3. What happened
4. Any error message that appeared

This information will make it easier to troubleshoot the problem.

---

# For Developers

LandlordOS is built with:

* Next.js
* TypeScript
* React
* Tailwind CSS
* Supabase
* GitHub Actions
* Vercel

## Requirements

You will need:

* Node.js
* npm
* Access to the LandlordOS Supabase project
* Access to the repository

## Running Locally

Clone the repository and install the dependencies:

```bash
npm install
```

Create the required environment file:

```text
.env.local
```

Configure the required Supabase environment variables.

Then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Building the Application

To test a production build locally:

```bash
npm run build
```

## Git Workflow

LandlordOS uses feature branches rather than making changes directly on `main`.

Recommended workflow:

```text
Create feature branch
       ↓
Make changes
       ↓
Commit changes
       ↓
Push branch to GitHub
       ↓
Create Pull Request
       ↓
GitHub Actions runs CI
       ↓
Review
       ↓
Merge into main
```

The `main` branch should contain the stable version of the application.

---

# CI/CD

GitHub Actions automatically checks the application when:

* A Pull Request is opened or updated against `main`
* Changes are pushed to `main`

The CI workflow installs dependencies and runs the production build.

Vercel is connected to the repository for deployment.

---

# Project Status

LandlordOS is an evolving project.

The application currently focuses on the core property-management workflow:

**Properties → Units → Tenants → Leases → Billing → Payments**

More features will be added as development continues.
