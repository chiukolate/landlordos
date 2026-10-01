import ClassicDashboard from "./ClassicDashboard";
import ModernDashboard from "./ModernDashboard";
import type { DashboardData } from "./types";

type DashboardContentProps = {
  data: DashboardData;
  modern: boolean;
};

export default function DashboardContent({
  data,
  modern,
}: DashboardContentProps) {
  if (modern) {
    return <ModernDashboard data={data} />;
  }

  return <ClassicDashboard data={data} />;
}
