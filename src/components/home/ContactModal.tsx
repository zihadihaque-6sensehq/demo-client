import { useEffect, useRef } from "react";

interface ContactModalProps {
  open: boolean;
  contentRef: string | null;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ContactModal({ open, contentRef, onClose }: ContactModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
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
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="contact-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="contact-modal-title" className="contact-modal__title">
          Contact Us
        </h2>
        <p className="contact-modal__body">
          {contentRef ?
            `We will connect you shortly (${contentRef}).`
          : "Tell us about your product and we will reach out."}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          className="marketing-btn marketing-btn--primary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}