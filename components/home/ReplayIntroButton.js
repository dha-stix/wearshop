"use client";

import { usePathname, useRouter } from "next/navigation";

export const REPLAY_EVENT = "wearshop:replay-intro";

export default function ReplayIntroButton() {
  const pathname = usePathname();
  const router = useRouter();

  const replay = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0 });
      window.dispatchEvent(new Event(REPLAY_EVENT));
    } else {
      router.push("/?intro=replay");
    }
  };

  return (
    <button type="button" className="footer__replay" onClick={replay}>
      Replay intro ↺
    </button>
  );
}
