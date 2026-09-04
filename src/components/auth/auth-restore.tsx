"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { loadAuthFromStorage } from "@/lib/auth-utils";

/**
 * Silent client component that restores the Zustand auth state from
 * localStorage on initial mount (used by the "remember me" feature).
 * Renders nothing — purely a side-effect.
 */
export function AuthRestore() {
  const login = useAppStore((s) => s.login);

  useEffect(() => {
    const user = loadAuthFromStorage();
    if (user) {
      login(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
