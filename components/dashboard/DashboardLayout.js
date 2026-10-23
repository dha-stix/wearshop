"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { EmptyState } from "@/components/ui/States";
import DashboardShell from "./DashboardShell";
import { ManagerDataProvider, useManagerData } from "./manager/ManagerData";

function ManagerFrame({ children }) {
  const { needsUpdate } = useManagerData();
  const nav = [
    { href: "/dashboard", label: "Overview", icon: "grid", exact: true },
    { href: "/dashboard/orders", label: "Orders", icon: "cart", badge: needsUpdate.length },
    {
      href: "/dashboard/products",
      label: "Products",
      icon: "watch",
      match: (path) => path.startsWith("/dashboard/products") && path !== "/dashboard/products/new",
    },
    { href: "/dashboard/products/new", label: "Add product", icon: "plus", exact: true },
  ];
  return (
    <DashboardShell nav={nav} role="Manager">
      {children}
    </DashboardShell>
  );
}

const CUSTOMER_NAV = [
  { href: "/dashboard", label: "Overview", icon: "grid", exact: true },
  { href: "/dashboard/orders", label: "My orders", icon: "truck" },
];

// Frame for every /dashboard page: the manager gets store tools, customers get their orders.
export default function DashboardLayout({ children }) {
  const { isManager } = useAuth();
  if (isManager) {
    return (
      <ManagerDataProvider>
        <ManagerFrame>{children}</ManagerFrame>
      </ManagerDataProvider>
    );
  }
  return <DashboardShell nav={CUSTOMER_NAV}>{children}</DashboardShell>;
}

// Renders the manager or customer version of a page.
export function RolePage({ manager, customer }) {
  const { isManager } = useAuth();
  return isManager ? manager : customer;
}

export function ManagerOnly({ children }) {
  const { isManager } = useAuth();
  if (isManager) return children;
  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <EmptyState icon="lock" title="Managers only" action="Back to your dashboard" href="/dashboard">
        This page is for store managers.
      </EmptyState>
    </div>
  );
}
