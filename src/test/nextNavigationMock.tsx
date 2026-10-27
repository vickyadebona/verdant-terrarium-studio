import React, { forwardRef, useSyncExternalStore } from 'react';

// A tiny stand-in for the Next.js App Router in unit tests: it drives window.history and lets
// components that read the pathname re-render when it changes.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function navigateTo(href: string, replace = false) {
  if (replace) window.history.replaceState(null, '', href);
  else window.history.pushState(null, '', href);
  listeners.forEach((listener) => listener());
}

export const routerMock = {
  push: (href: string) => navigateTo(href),
  replace: (href: string) => navigateTo(href, true),
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => undefined,
  prefetch: () => undefined,
};

export const navigationMock = {
  useRouter: () => routerMock,
  usePathname: () => useSyncExternalStore(subscribe, () => window.location.pathname),
  useSearchParams: () =>
    new URLSearchParams(useSyncExternalStore(subscribe, () => window.location.search)),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (href: string) => navigateTo(href, true),
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const LinkMock = forwardRef<HTMLAnchorElement, LinkProps>(function LinkMock(
  { href, onClick, children, ...rest },
  ref
) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        navigateTo(href);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});
