"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE, ROUTES } from "@/config/site";

// Sends visitors back to "/" if they open an inner page before the unlock time.
// Returns true once the page is allowed to render.
export default function useUnlockGuard() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const isSessionUnlocked = typeof window !== "undefined" && sessionStorage.getItem("birthday_unlocked") === "true";
    const unlockAt = new Date(SITE.birthdayISO).getTime();
    const unlocked = SITE.devUnlock || isSessionUnlocked || Number.isNaN(unlockAt) || Date.now() >= unlockAt;
    if (unlocked) setAllowed(true);
    else router.replace(ROUTES.lock);
  }, [router]);

  return allowed;
}
