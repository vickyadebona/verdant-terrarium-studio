import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../server/auth";

// Better Auth's endpoints: sign-up, sign-in, sign-out, session, Google callback, ...
export const { GET, POST } = toNextJsHandler(auth);
