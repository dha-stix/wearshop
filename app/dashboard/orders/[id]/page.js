import { RolePage } from "@/components/dashboard/DashboardLayout";
import OrderDetail from "@/components/dashboard/manager/OrderDetail";
import CustomerOrderDetail from "@/components/dashboard/customer/CustomerOrderDetail";

export const metadata = { title: "Order" };

export default async function Order({ params }) {
  const { id } = await params;
  return <RolePage manager={<OrderDetail id={id} />} customer={<CustomerOrderDetail id={id} />} />;
}
