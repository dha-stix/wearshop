import { ManagerOnly } from "@/components/dashboard/DashboardLayout";
import ProductEditor from "@/components/dashboard/manager/ProductEditor";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params }) {
  const { id } = await params;
  return (
    <ManagerOnly>
      <ProductEditor id={id} />
    </ManagerOnly>
  );
}
