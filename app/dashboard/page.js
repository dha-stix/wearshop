import { RolePage } from "@/components/dashboard/DashboardLayout";
import ManagerOverview from "@/components/dashboard/manager/ManagerOverview";
import CustomerOverview from "@/components/dashboard/customer/CustomerOverview";

export const metadata = { title: "Dashboard" };

export default function DashboardHome() {
  return <RolePage manager={<ManagerOverview />} customer={<CustomerOverview />} />;
}
