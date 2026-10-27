"use client";

import { useAuth } from "../context/AuthContext";
import type { AuthModalConfig } from "../types/auth";

/**
 * Runs an action that needs an account. Signed-in shoppers go straight through; guests see the
 * sign-in dialog first, and the action runs once they have signed in or created an account.
 */
export function useSignedInAction() {
  const { isAuthenticated, openAuthModal } = useAuth();
  return (action: () => void, prompt: Omit<AuthModalConfig, "onAuthenticated">) => {
    if (isAuthenticated) action();
    else openAuthModal({ ...prompt, onAuthenticated: action });
  };
}

export const ADD_TO_JAR_PROMPT = {
  title: "Sign in to save it to your jar",
  message:
    "Your jar keeps your designs and editions together until checkout. Create a free account or sign in, and we'll add this right away.",
  actionLabel: "Add to Your Jar",
} satisfies Omit<AuthModalConfig, "onAuthenticated">;
