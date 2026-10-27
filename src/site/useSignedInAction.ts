"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import type { AuthModalConfig } from "../types/auth";

type Prompt = Omit<AuthModalConfig, "onAuthenticated">;

/**
 * Runs an action that needs an account. Signed-in shoppers go straight through; guests see the
 * sign-in dialog first, and the action runs once they have signed in or created an account.
 * A click that lands while the session is still being checked (just after the page loads)
 * waits for the answer, so a signed-in shopper isn't asked to sign in again.
 */
export function useSignedInAction() {
  const { session, openAuthModal } = useAuth();
  const pending = useRef<{ action: () => void; prompt: Prompt } | null>(null);

  useEffect(() => {
    if (!pending.current || session.status === "loading") return;
    const { action, prompt } = pending.current;
    pending.current = null;
    if (session.status === "authenticated") action();
    else openAuthModal({ ...prompt, onAuthenticated: action });
  }, [session.status, openAuthModal]);

  return (action: () => void, prompt: Prompt) => {
    if (session.status === "loading") pending.current = { action, prompt };
    else if (session.status === "authenticated") action();
    else openAuthModal({ ...prompt, onAuthenticated: action });
  };
}

export const ADD_TO_JAR_PROMPT = {
  title: "Sign in to save it to your jar",
  message:
    "Your jar keeps your designs and editions together until checkout. Create a free account or sign in, and we'll add this right away.",
  actionLabel: "Add to Your Jar",
} satisfies Prompt;
