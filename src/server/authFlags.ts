import "server-only";

/** Google sign-in turns on once its OAuth client id and secret are set for the environment. */
export const googleSignInEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
