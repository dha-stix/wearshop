"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import CustomerDashboard from "./CustomerDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";

// Same URL for everyone; the role on the user's Firestore profile picks the view.
export default function DashboardPage() {
  const { isManager } = useAuth();
  return isManager ? <ManagerDashboard /> : <CustomerDashboard />;
}
