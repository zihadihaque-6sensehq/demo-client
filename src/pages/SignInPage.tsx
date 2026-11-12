import { FormEvent, useCallback, useState } from "react";
import {
  getForgotPassword,
  getLegalPrivacy,
  getLegalTerms,
  getOAuthInit,
  getSsoInit,
  postLogin,
} from "../api/client";
import { LegalModal } from "../components/LegalModal";
import { createOAuthState, getOAuthRedirectUri } from "../lib/oauthState";

type SignInPageProps = {
  onAuthSuccess: () => void;
};

type ProviderKind = "sso" | "google" | "facebook" | "apple";

export function SignInPage({ onAuthSuccess }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [providerInProgress, setProviderInProgress] = useState<ProviderKind | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [legalModal, setLegalModal] = useState<{
    title: string;
    content: string;
    contentType: string;
  } | null>(null);

  const authBusy = loginInProgress || providerInProgress !== null;

  const validateFields = useCallback((): boolean => {
    const next: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      next.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Password is required.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }, [email, password]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateFields()) {
      return;
    }
    if (loginInProgress) {
      return;
    }
    setLoginInProgress(true);
    try {
      const result = await postLogin(email.trim(), password);
      if (result.success && result.sessionEstablished) {
        onAuthSuccess();
      } else {
        setFormError(result.errorMessage ?? "Sign-in failed. Please try again.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoginInProgress(false);
    }
  };

  const startProvider = async (kind: ProviderKind) => {
    if (authBusy) {
      return;
    }
    setFormError(null);
    setProviderInProgress(kind);
    try {
      if (kind === "sso") {
        const { redirectUrl } = await getSsoInit({
          returnUrl: `${window.location.origin}/`,
        });
        window.location.assign(redirectUrl);
        return;
      }
      const state = createOAuthState();
      const redirectUri = getOAuthRedirectUri();
      const { redirectUrl } = await getOAuthInit(kind, redirectUri, state);
      window.location.assign(redirectUrl);
    } catch (err) {
      setProviderInProgress(null);
      setFormError(
        err instanceof Error
          ? err.message
          : "Could not start sign-in. Please try again.",
      );
    }
  };

  const handleForgotPassword = async () => {
    setFormError(null);
    try {
      const prefill = email.trim() || undefined;
      const result = await getForgotPassword(prefill);
      if (result.recoveryRouteOpened) {
        setFormError(null);
        window.alert("Password recovery has been opened.");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not open password recovery.");
    }
  };

  const openLegal = async (which: "terms" | "privacy") => {
    setFormError(null);
    try {
      const data =
        which === "terms" ? await getLegalTerms() : await getLegalPrivacy();
      setLegalModal({
        title: which === "terms" ? "Terms of Service" : "Privacy Policy",
        content: data.content,
        contentType: data.contentType,
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not load document.");
    }
  };

  return (
    <main className="sign-in-page">
      <div className="sign-in-column">
        <h1 className="sign-in-title">Sign in</h1>
        <p className="sign-in-subtitle">You are one click away</p>
        <p className="sign-in-tagline">from being efficient</p>

        <div className="provider-row" role="group" aria-label="Sign in providers">
          <button
            type="button"
            className="provider-sso"
            disabled={authBusy}
            onClick={() => void startProvider("sso")}
            aria-busy={providerInProgress === "sso"}
          >
            SSO
          </button>
          <button
            type="button"
            className="provider-icon-btn provider-google"
            disabled={authBusy}
            onClick={() => void startProvider("google")}
            aria-label="Sign in with Google"
            aria-busy={providerInProgress === "google"}
          >
            G
          </button>
          <button
            type="button"
            className="provider-icon-btn provider-facebook"
            disabled={authBusy}
            onClick={() => void startProvider("facebook")}
            aria-label="Sign in with Facebook"
            aria-busy={providerInProgress === "facebook"}
          >
            f
          </button>
          <button
            type="button"
            className="provider-icon-btn provider-apple"
            disabled={authBusy}
            onClick={() => void startProvider("apple")}
            aria-label="Sign in with Apple"
            aria-busy={providerInProgress === "apple"}
          >
            <span aria-hidden="true">&#63743;</span>
          </button>
        </div>

        <div className="divider-or" aria-hidden="true">
          OR CONTINUE WITH
        </div>

        {formError ? (
          <div className="feedback feedback-error" role="alert">
            {formError}
          </div>
        ) : null}

        {loginInProgress || providerInProgress ? (
          <div className="feedback feedback-info" aria-live="polite">
            Signing in…
          </div>
        ) : null}

        <form onSubmit={(e) => void handleLogin(e)} noValidate>
          <div className="field-group">
            <label className="field-label" htmlFor="sign-in-email">
              Email
            </label>
            <input
              id="sign-in-email"
              className="field-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loginInProgress}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "sign-in-email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p id="sign-in-email-error" className="field-error" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="field-group">
            <div className="password-row">
              <button
                type="button"
                className="forgot-link"
                onClick={() => void handleForgotPassword()}
                disabled={loginInProgress}
              >
                Forgot password?
              </button>
            </div>
            <label className="field-label" htmlFor="sign-in-password">
              Password
            </label>
            <div className="password-input-wrap">
              <input
                id="sign-in-password"
                className="field-input"
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginInProgress}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={fieldErrors.password ? "sign-in-password-error" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordVisible((v) => !v)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                aria-pressed={passwordVisible}
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id="sign-in-password-error" className="field-error" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>

          <button type="submit" className="btn-sign-in" disabled={loginInProgress || authBusy}>
            {loginInProgress ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <footer className="legal-footer">
          By clicking continue, you agree to our{" "}
          <a
            href="#terms"
            onClick={(e) => {
              e.preventDefault();
              void openLegal("terms");
            }}
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              void openLegal("privacy");
            }}
          >
            Privacy Policy
          </a>
          .
        </footer>
      </div>

      {legalModal ? (
        <LegalModal
          title={legalModal.title}
          content={legalModal.content}
          contentType={legalModal.contentType}
          onClose={() => setLegalModal(null)}
        />
      ) : null}
    </main>
  );
}
