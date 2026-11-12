import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getAuthStatus } from "./api/client";
import { AuthenticatedPlaceholder } from "./pages/AuthenticatedPlaceholder";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { SignInPage } from "./pages/SignInPage";

type AuthState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; userId?: string }
  | { status: "error"; message: string };

export function App() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const refreshAuth = useCallback(async () => {
    try {
      const result = await getAuthStatus();
      if (result.isAuthenticated) {
        setAuth({ status: "authenticated", userId: result.userId });
      } else {
        setAuth({ status: "unauthenticated" });
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not verify session. Please try again.";
      setAuth({ status: "error", message });
    }
  }, []);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  if (auth.status === "loading") {
    return (
      <main className="sign-in-page">
        <p className="sign-in-loading" role="status">
          Loading…
        </p>
      </main>
    );
  }

  if (auth.status === "error") {
    return (
      <main className="sign-in-page">
        <div className="sign-in-column">
          <div className="feedback feedback-error" role="alert">
            {auth.message}
          </div>
          <button type="button" className="btn-sign-in" onClick={() => void refreshAuth()}>
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route
        path="/sign-in"
        element={
          auth.status === "authenticated" ? (
            <Navigate to="/" replace />
          ) : (
            <SignInPage onAuthSuccess={() => void refreshAuth()} />
          )
        }
      />
      <Route
        path="/"
        element={
          auth.status === "authenticated" ? (
            <AuthenticatedPlaceholder userId={auth.userId} />
          ) : (
            <Navigate to="/sign-in" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/sign-in" replace />} />
    </Routes>
  );
}
