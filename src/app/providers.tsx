"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { StudioProvider } from "../site/StudioContext";
import { SiteShell } from "../site/SiteShell";
import { CartDrawer } from "../components/CartDrawer";
import { StripeCheckoutModal } from "../components/StripeCheckoutModal";
import { OrderTrackerModal } from "../components/OrderTrackerModal";
import { AuthModal } from "../components/AuthModal";

/** Client-side state shared by every page, the site header and footer, and the global dialogs. */
export function Providers({
  children,
  googleSignInEnabled,
}: {
  children: ReactNode;
  googleSignInEnabled: boolean;
}) {
  return (
    <AuthProvider googleSignInEnabled={googleSignInEnabled}>
      <CartProvider>
        <StudioProvider>
          <SiteShell>{children}</SiteShell>
          <CartDrawer />
          <StripeCheckoutModal />
          <OrderTrackerModal />
          <AuthModal />
        </StudioProvider>
      </CartProvider>
    </AuthProvider>
  );
}
