import { Suspense } from "react";
import RequireAuth from "@/components/auth/RequireAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PageLoading } from "@/components/ui/States";

export const metadata = { title: { default: "Dashboard", template: "%s · Dashboard · WearShop" } };

export default function Layout({ children }) {
  return (
    <RequireAuth>
      <DashboardLayout>
        <Suspense fallback={<PageLoading />}>{children}</Suspense>
      </DashboardLayout>
    </RequireAuth>
  );
}
