import { useEffect, useRef } from "react";

type LegalModalProps = {
  title: string;
  content: string;
  contentType: string;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LegalModal({ title, content, contentType, onClose }: LegalModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => el.offsetParent !== null || el === closeRef.current);
      if (focusables.length === 0) {
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="legal-modal-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        <h2 id="legal-modal-title">{title}</h2>
        {contentType.includes("html") ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{content}</pre>
        )}
        <button ref={closeRef} type="button" className="legal-modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
