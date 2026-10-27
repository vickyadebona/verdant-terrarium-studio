"use client";

import { createAuthClient } from "better-auth/react";

/** Browser side of Better Auth. It talks to /api/auth on whichever host served the page. */
export const authClient = createAuthClient();
