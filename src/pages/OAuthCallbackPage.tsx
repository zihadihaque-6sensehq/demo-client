import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthStatus, getOAuthCallback } from "../api/client";
import { GENERIC_OAUTH_ERROR } from "../lib/safeErrorMessage";
import { consumeOAuthState } from "../lib/oauthState";

export function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const authorizationCode = searchParams.get("code") ?? searchParams.get("authorizationCode") ?? undefined;
      const state = searchParams.get("state") ?? undefined;
      const providerError = searchParams.get("error");

      if (providerError) {
        if (!cancelled) {
          setMessage(GENERIC_OAUTH_ERROR);
          window.setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
        }
        return;
      }

      if (state) {
        if (!consumeOAuthState(state)) {
          if (!cancelled) {
            setMessage("Invalid or expired sign-in session. Please try again.");
            window.setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
          }
          return;
        }
      } else if (!authorizationCode) {
        if (!cancelled) {
          setMessage("Invalid or expired sign-in session. Please try again.");
          window.setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
        }
        return;
      }

      try {
        const result = await getOAuthCallback({
          authorizationCode,
          state,
        });
        if (result.success && result.sessionEstablished) {
          const status = await getAuthStatus();
          if (status.isAuthenticated) {
            navigate("/", { replace: true });
            return;
          }
        }
        if (!cancelled) {
          setMessage("Sign-in could not be completed. Please try again.");
          window.setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
        }
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
          window.setTimeout(() => navigate("/sign-in", { replace: true }), 2500);
        }
      }
    }

    void complete();
    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <main className="sign-in-page">
      <p className="sign-in-loading" role="status" aria-live="polite">
        {message}
      </p>
    </main>
  );
}
