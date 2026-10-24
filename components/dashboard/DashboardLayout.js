"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { EmptyState } from "@/components/ui/States";
import DashboardShell from "./DashboardShell";
import { ManagerDataProvider, useManagerData } from "./manager/ManagerData";

const PRODUCTS = {
  href: "/dashboard/products",
  label: "Products",
  icon: "watch",
  match: (path) => path.startsWith("/dashboard/products") && path !== "/dashboard/products/new",
};

// Staff and managers share the store data; the menu shows only what each role may use.
function StoreFrame({ children }) {
  const { isManager } = useAuth();
  const { needsUpdate } = useManagerData();
  const orders = { href: "/dashboard/orders", label: "Orders", icon: "cart", badge: needsUpdate.length };
  const nav = isManager
    ? [
        { href: "/dashboard", label: "Overview", icon: "grid", exact: true },
        orders,
        PRODUCTS,
        { href: "/dashboard/products/new", label: "Add product", icon: "plus", exact: true },
        { href: "/dashboard/team", label: "Team", icon: "users" },
      ]
    : [{ href: "/dashboard", label: "Overview", icon: "grid", exact: true }, orders, PRODUCTS];
  return (
    <DashboardShell nav={nav} role={isManager ? "Manager" : "Staff"}>
      {children}
    </DashboardShell>
  );
}

const CUSTOMER_NAV = [
  { href: "/dashboard", label: "Overview", icon: "grid", exact: true },
  { href: "/dashboard/orders", label: "My orders", icon: "truck" },
];

// Frame for every /dashboard page: managers and staff get store tools, customers get their orders.
export default function DashboardLayout({ children }) {
  const { isStoreTeam } = useAuth();
  if (isStoreTeam) {
    return (
      <ManagerDataProvider>
        <StoreFrame>{children}</StoreFrame>
      </ManagerDataProvider>
    );
  }
  return <DashboardShell nav={CUSTOMER_NAV}>{children}</DashboardShell>;
}

// Renders the store-team or customer version of a page. Staff see the manager version
// (each page hides what staff can't do) unless a `staff` version is given.
export function RolePage({ manager, staff, customer }) {
  const { isManager, isStaff } = useAuth();
  if (isManager) return manager;
  if (isStaff) return staff ?? manager;
  return customer;
}

// For pages staff may see too (e.g. the read-only product list).
export function StoreTeamOnly({ children }) {
  const { isStoreTeam } = useAuth();
  if (isStoreTeam) return children;
  return <Locked title="Store team only">This page is for WearShop staff and managers.</Locked>;
}

function Locked({ title, children }) {
  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <EmptyState icon="lock" title={title} action="Back to your dashboard" href="/dashboard">
        {children}
      </EmptyState>
    </div>
  );
}

export function ManagerOnly({ children }) {
  const { isManager } = useAuth();
  if (isManager) return children;
  return <Locked title="Managers only">This page is for store managers.</Locked>;
}
