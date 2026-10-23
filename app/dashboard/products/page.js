import { ManagerOnly } from "@/components/dashboard/DashboardLayout";
import ProductsPage from "@/components/dashboard/manager/ProductsPage";

export const metadata = { title: "Products" };

export default function Products() {
  return (
    <ManagerOnly>
      <ProductsPage />
    </ManagerOnly>
  );
}
