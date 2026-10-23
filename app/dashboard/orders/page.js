import { RolePage } from "@/components/dashboard/DashboardLayout";
import OrdersPage from "@/components/dashboard/manager/OrdersPage";
import CustomerOrders from "@/components/dashboard/customer/CustomerOrders";

export const metadata = { title: "Orders" };

export default function Orders() {
  return <RolePage manager={<OrdersPage />} customer={<CustomerOrders />} />;
}
