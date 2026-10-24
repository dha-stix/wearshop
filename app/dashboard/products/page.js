import { StoreTeamOnly } from "@/components/dashboard/DashboardLayout";
import ProductsPage from "@/components/dashboard/manager/ProductsPage";

export const metadata = { title: "Products" };

export default function Products() {
  return (
    <StoreTeamOnly>
      <ProductsPage />
    </StoreTeamOnly>
  );
}
