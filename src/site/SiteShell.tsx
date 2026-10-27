"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ArrowIcon, LeafMark } from "./views";

const NAV_LINKS: Array<{ href: string; label: string; activeFor: string[] }> = [
  { href: "/collections", label: "Collection", activeFor: ["/collections"] },
  { href: "/our-story", label: "Our Story", activeFor: ["/our-story"] },
  { href: "/studio", label: "Studio", activeFor: ["/studio"] },
  { href: "/terracare", label: "TerraCare", activeFor: ["/terracare"] },
  { href: "/faq", label: "FAQ", activeFor: ["/faq"] },
];

// The Studio and account pages are full-height tools without the marketing footer.
const PAGES_WITHOUT_FOOTER = ["/studio", "/account"];

/** Site header (logo, main navigation, account and greenhouse actions, mobile menu) and footer. */
export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const { openCart, itemCount, openTrackerModal, orders } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu whenever the page changes (links, Back and Forward).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  // Escape closes the mobile menu and returns focus to its button.
  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const showFooter = !PAGES_WITHOUT_FOOTER.includes(pathname);

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link href="/collections" className="brand" aria-label="TerraScape home">
          <LeafMark />
          <span>
            Terra<span className="brand-scape">Scape</span>
          </span>
        </Link>
        <nav id="main-navigation" className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={link.activeFor.includes(pathname) ? "active" : ""}
              aria-current={link.activeFor.includes(pathname) ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          {orders.length > 0 && (
            <button
              className="text-button"
              onClick={() => openTrackerModal()}
              title="Track Active Studio Builds"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#34d399",
                  display: "inline-block",
                }}
              />
              Tracker ({orders.length})
            </button>
          )}

          {currentUser ? (
            <Link
              href="/account"
              className="text-button account-link"
              title={`Signed in as ${currentUser.name}`}
            >
              Account
            </Link>
          ) : (
            <Link
              href="/account?mode=login"
              className="nav-cta-button"
              title="Sign in or create a TerraScape account"
            >
              <span className="cta-label-full">Login / Create account</span>
              <span className="cta-label-short">Log in</span>
            </Link>
          )}

          {/* The greenhouse belongs to an account, so only signed-in shoppers see it. */}
          {currentUser && (
            <button className="bag-button" onClick={openCart} title="Open Your Greenhouse">
              Greenhouse <span>{itemCount}</span>
            </button>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            className={menuOpen ? "menu-button open" : "menu-button"}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>{children}</main>

      {showFooter && (
        <footer>
          <div className="footer-brand">
            <div className="brand footer-wordmark">
              <LeafMark />
              <span>
                Terra<span className="brand-scape">Scape</span>
              </span>
            </div>
            <p>
              Small worlds,
              <br />
              grown with intention.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="newsletter">
            <strong>Notes from the greenhouse</strong>
            <p>Seasonal care, new flora, and studio stories from Los Angeles, CA.</p>
            <label>
              <input type="email" placeholder="Email address" />
              <button aria-label="Subscribe">
                <ArrowIcon />
              </button>
            </label>
          </div>
          <small>© 2026 TerraScape · Los Angeles, CA · Living worlds, made by hand.</small>
        </footer>
      )}
    </div>
  );
}
