"use client";

import { useEffect, useState } from "react";

import ClassicDashboard from "./ClassicDashboard";
import ModernDashboard from "./ModernDashboard";
import type { DashboardData } from "./types";

type DashboardSwitcherProps = {
  data: DashboardData;
};

export default function DashboardSwitcher({
  data,
}: DashboardSwitcherProps) {
  const [modernEnabled, setModernEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedStyle = window.localStorage.getItem(
      "landlordos-dashboard-style"
    );

    if (savedStyle === "modern") {
      setModernEnabled(true);
    }

    setLoaded(true);
  }, []);

  function changeStyle(useModern: boolean) {
    setModernEnabled(useModern);

    window.localStorage.setItem(
      "landlordos-dashboard-style",
      useModern ? "modern" : "classic"
    );
  }

  if (!loaded) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <>
      <div className="fixed right-3 top-2 z-50 md:right-6 md:top-6">
        <div className="flex items-center rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => changeStyle(false)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              !modernEnabled
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Classic
          </button>

          <button
            type="button"
            onClick={() => changeStyle(true)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              modernEnabled
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Modern
          </button>
        </div>
      </div>

      {modernEnabled ? (
        <ModernDashboard data={data} />
      ) : (
        <ClassicDashboard data={data} />
      )}
    </>
  );
}
