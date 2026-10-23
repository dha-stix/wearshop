import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { PageLoading } from "@/components/ui/States";

export const metadata = { title: "Dashboard" };

export default function Dashboard() {
  return (
    <RequireAuth>
      <Suspense fallback={<PageLoading />}>
        <DashboardPage />
      </Suspense>
    </RequireAuth>
  );
}
