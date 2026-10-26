export type Page =
  | "home"
  | "design"
  | "build"
  | "edition"
  | "terracare"
  | "about"
  | "faq"
  | "account";

export type EditionKey = "cloud_forest" | "fern_study" | "moss_garden";

export const VALID_EDITIONS: EditionKey[] = [
  "cloud_forest",
  "fern_study",
  "moss_garden",
];

export const ROUTES = {
  ROOT: "/",
  COLLECTIONS: "/collections",
  OUR_STORY: "/our-story",
  STUDIO: "/studio",
  TERRACARE: "/terracare",
  FAQ: "/faq",
  ACCOUNT: "/account",
  EDITIONS: "/editions",
} as const;

export interface RouteInfo {
  page: Page;
  path: string;
  editionId?: EditionKey;
  redirectFromRoot?: boolean;
}

/**
 * Parses the current window pathname into a canonical RouteInfo object.
 */
export function parsePath(pathname: string): RouteInfo {
  // Normalize pathname: remove trailing slash if length > 1
  const clean = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (clean === "" || clean === "/") {
    return {
      page: "home",
      path: "/collections",
      redirectFromRoot: true,
    };
  }

  if (clean === "/collections" || clean === "/home") {
    return {
      page: "home",
      path: "/collections",
    };
  }

  if (clean === "/our-story" || clean === "/about" || clean === "/design") {
    return {
      page: "about",
      path: "/our-story",
    };
  }

  // /checkout and /payments were the old Studio review steps; the Studio now hands off to the jar.
  if (
    clean === "/studio" ||
    clean === "/build" ||
    clean === "/checkout" ||
    clean === "/payments"
  ) {
    return {
      page: "build",
      path: "/studio",
    };
  }

  if (clean === "/terracare") {
    return {
      page: "terracare",
      path: "/terracare",
    };
  }

  if (clean === "/faq") {
    return {
      page: "faq",
      path: "/faq",
    };
  }

  if (clean === "/account") {
    return {
      page: "account",
      path: "/account",
    };
  }

  // Edition details route: /editions/:id or /edition/:id
  const editionMatch = clean.match(/^\/(?:editions|edition)\/([a-zA-Z0-9_-]+)$/);
  if (editionMatch) {
    const rawKey = editionMatch[1] as EditionKey;
    const editionId = VALID_EDITIONS.includes(rawKey) ? rawKey : "cloud_forest";
    return {
      page: "edition",
      path: `/editions/${editionId}`,
      editionId,
    };
  }

  // Unknown route -> default to collections
  return {
    page: "home",
    path: "/collections",
  };
}

/**
 * Resolves a destination (path, page name, or edition) to its canonical browser URL.
 */
export function resolvePath(
  target: string | Page,
  params?: { editionId?: EditionKey }
): { path: string; redirectFromRoot?: boolean } {
  if (target === "/" || target === "") {
    return { path: "/collections", redirectFromRoot: true };
  }

  if (target.startsWith("/")) {
    const parsed = parsePath(target);
    return { path: parsed.path };
  }

  switch (target) {
    case "home":
      return { path: "/collections" };
    case "about":
    case "design":
      return { path: "/our-story" };
    case "build":
      return { path: "/studio" };
    case "terracare":
      return { path: "/terracare" };
    case "faq":
      return { path: "/faq" };
    case "account":
      return { path: "/account" };
    case "edition":
      return { path: `/editions/${params?.editionId || "cloud_forest"}` };
    default:
      return { path: "/collections" };
  }
}
