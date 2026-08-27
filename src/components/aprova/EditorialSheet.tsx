import { type PropsWithChildren, type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

type EditorialSheetProps = PropsWithChildren<{
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  summary?: string;
  accent?: string;
  actions?: ReactNode;
}>;

const FOCUSABLE =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function EditorialSheet({
  open,
  onClose,
  eyebrow,
  title,
  summary,
  accent = "var(--color-primary)",
  actions,
  children,
}: EditorialSheetProps) {
  const [mounted, setMounted] = useState(false);
  const reduced = Boolean(useReducedMotion());
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const summaryId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusPanel = window.setTimeout(
      () => {
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
      },
      reduced ? 0 : 180,
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;
      const first = focusable[0]!;
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusPanel);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose, open, reduced]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="editorial-sheet"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={summary ? summaryId : undefined}
            className="editorial-sheet__panel"
            style={{ "--sheet-accent": accent } as React.CSSProperties}
            initial={reduced ? false : { opacity: 0, y: 54, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 42, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
          >
            <div className="editorial-sheet__beam" aria-hidden="true" />
            <header>
              <span>{eyebrow}</span>
              <button type="button" onClick={onClose} aria-label="Fechar painel">
                <X />
              </button>
            </header>
            <div className="editorial-sheet__body">
              <h2 id={titleId}>{title}</h2>
              {summary ? <p id={summaryId}>{summary}</p> : null}
              {children}
            </div>
            {actions ? <footer>{actions}</footer> : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

