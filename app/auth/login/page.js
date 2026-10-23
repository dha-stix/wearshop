import { Suspense } from "react";
import AuthScreen from "@/components/auth/AuthScreen";

export const metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense>
      <AuthScreen mode="login" />
    </Suspense>
  );
}
