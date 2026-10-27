import { useEffect, useLayoutEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open dialogs, newest last. Only the top one reacts to Escape and Tab, so a sign-in
// dialog opened over the jar closes on its own.
const openDialogs: symbol[] = [];

/**
 * Keyboard and focus behaviour for a modal dialog: moves focus into it when it opens,
 * keeps Tab inside it, closes it on Escape, and returns focus to where the shopper was.
 * Attach the returned ref to the element with role="dialog" and give it tabIndex={-1}.
 */
export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const id = Symbol('dialog');
    openDialogs.push(id);
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== id) return;
      const node = ref.current;
      if (!node) return;

      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab') {
        const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (focusable.length === 0) {
          event.preventDefault();
          node.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === node)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (!node.contains(active)) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      const index = openDialogs.indexOf(id);
      if (index !== -1) openDialogs.splice(index, 1);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  return ref;
}
