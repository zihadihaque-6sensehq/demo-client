import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { sendInvite } from "@/api/invited";
import { ApiError } from "@/api/http";
import { validateInviteEmail } from "@/utils/email";

interface SendInviteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
}

export function SendInviteModal({
  open,
  onClose,
  onSuccess,
  onError,
  returnFocusRef,
}: SendInviteModalProps) {
  const titleId = useId();
  const emailId = useId();
  const emailErrorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const close = useCallback(() => {
    if (submitting) return;
    onClose();
    setEmail("");
    setError(null);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, [onClose, returnFocusRef, submitting]);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setError(null);
    const t = window.setTimeout(() => emailRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, close]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const trap = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    dialog.addEventListener("keydown", trap);
    return () => dialog.removeEventListener("keydown", trap);
  }, [open]);

  const validateField = useCallback((value: string, touch: boolean) => {
    if (!touch && !value.trim()) {
      setError(null);
      return false;
    }
    const result = validateInviteEmail(value);
    if (!result.valid) {
      setError(result.message);
      return false;
    }
    setError(null);
    return true;
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = validateInviteEmail(email);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setSubmitting(true);
    try {
      await sendInvite({ email: result.email });
      onSuccess();
      setSubmitting(false);
      close();
    } catch (err) {
      setSubmitting(false);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(err.message || "This email is already registered or invited.");
          return;
        }
        if (err.status === 401 || err.status === 403) {
          onError(
            err.status === 401
              ? "Your session has expired. Please sign in again."
              : "You don't have permission to send invites.",
          );
          return;
        }
      }
      onError("Invite could not be sent. Please try again.");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => close()} role="presentation">
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            Send Invite
          </h2>
          <button
            type="button"
            className="modal__close"
            aria-label="Close"
            onClick={() => close()}
            disabled={submitting}
          >
            ×
          </button>
        </div>
        <form
          className="modal__body"
          noValidate
          onSubmit={(e) => void handleSubmit(e)}
        >
          <label className="field" htmlFor={emailId}>
            <span className="field__label">Email</span>
            <input
              ref={emailRef}
              id={emailId}
              type="email"
              className={`field__input ${error ? "field__input--error" : ""}`}
              value={email}
              autoComplete="email"
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? emailErrorId : undefined}
              onChange={(ev) => setEmail(ev.target.value)}
              onBlur={() => validateField(email, true)}
            />
            {error && (
              <span
                id={emailErrorId}
                className="field__error"
                role="alert"
              >
                {error}
              </span>
            )}
          </label>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => close()}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? "Sending…" : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
