"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { resolvePath, type EditionKey, type Page } from "../utils/router";

export type Navigate = (
  next: Page | string,
  options?: { replace?: boolean; editionId?: EditionKey }
) => void;

/**
 * Keeps the page components' existing `navigate("faq")` / `navigate("/studio")` calls working on
 * the App Router: page names and legacy aliases resolve to their canonical URL first.
 */
export function useAppNavigate(): Navigate {
  const router = useRouter();
  return useCallback<Navigate>(
    (next, options) => {
      const { path } = resolvePath(next, { editionId: options?.editionId });
      if (options?.replace) router.replace(path);
      else router.push(path);
    },
    [router]
  );
}
