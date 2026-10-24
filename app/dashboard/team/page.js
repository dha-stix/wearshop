import { ManagerOnly } from "@/components/dashboard/DashboardLayout";
import TeamPage from "@/components/dashboard/manager/TeamPage";

export const metadata = { title: "Team" };

export default function Team() {
  return (
    <ManagerOnly>
      <TeamPage />
    </ManagerOnly>
  );
}
