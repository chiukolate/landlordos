"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: "⌂",
  },
  {
    name: "Properties",
    href: "/properties",
    icon: "⌂",
  },
  {
    name: "Tenants",
    href: "/tenants",
    icon: "♙",
  },
  {
    name: "Bills",
    href: "/bills",
    icon: "▤",
  },
  {
    name: "Payments",
    href: "/payments",
    icon: "₱",
  },
  {
    name: "Expenses",
    href: "/expenses",
    icon: "−",
  },
  {
    name: "Maintenance",
    href: "/maintenance",
    icon: "⚒",
  },
];

type NavigationItemsProps = {
  pathname: string;
  onNavigate?: () => void;
};

function NavigationItems({ pathname, onNavigate }: NavigationItemsProps) {
  return (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isDisabled = item.href === "#";

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : !isDisabled && pathname.startsWith(item.href);

        if (isDisabled) {
          return (
            <div
              key={item.name}
              className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400"
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.name}
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="w-5 text-center">{item.icon}</span>
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (pathname === "/login") {
    return null;
  }

  return (
    <>
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 px-6 py-5">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900"
          >
            LandlordOS
          </Link>

          <p className="mt-1 text-xs text-gray-500">
            Property Management
          </p>
        </div>

        <nav className="flex-1 px-3 py-6" aria-label="Main navigation">
          <NavigationItems pathname={pathname} />

          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400">
              <span className="w-5 text-center">⚙</span>
              Settings
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-sm font-medium text-gray-900">Salvador</p>
            <p className="text-xs text-gray-500">Property Owner</p>
          </div>
        </div>
      </aside>

      <div className="relative z-40 w-full md:hidden">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-3">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
            className="flex h-10 items-center gap-3 rounded-lg px-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            <span className="w-6 text-center text-lg leading-none" aria-hidden="true">
              {mobileMenuOpen ? "×" : "☰"}
            </span>
            LandlordOS
          </button>
        </header>

        {mobileMenuOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full border-b border-gray-200 bg-white px-3 py-3 shadow-lg"
          >
            <NavigationItems
              pathname={pathname}
              onNavigate={() => setMobileMenuOpen(false)}
            />

            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="flex w-full cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400">
                <span className="w-5 text-center">⚙</span>
                Settings
              </div>
            </div>
          </nav>
        )}
      </div>
    </>
  );
}