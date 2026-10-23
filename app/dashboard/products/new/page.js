import { ManagerOnly } from "@/components/dashboard/DashboardLayout";
import ProductEditor from "@/components/dashboard/manager/ProductEditor";

export const metadata = { title: "Add product" };

export default function NewProduct() {
  return (
    <ManagerOnly>
      <ProductEditor />
    </ManagerOnly>
  );
}
