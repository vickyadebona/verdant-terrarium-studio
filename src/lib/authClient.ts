"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/** Browser side of Better Auth. It talks to /api/auth on whichever host served the page. */
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: { preferredPaymentMethod: { type: "string", required: false } },
    }),
  ],
});
