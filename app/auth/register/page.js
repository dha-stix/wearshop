import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata = { title: "Create account", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="register" />
    </Suspense>
  );
}
