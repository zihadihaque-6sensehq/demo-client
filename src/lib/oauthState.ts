const OAUTH_STATE_KEY = "signin_oauth_state";

export function createOAuthState(): string {
  const state =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  return state;
}

export function consumeOAuthState(receivedState?: string): boolean {
  const expected = sessionStorage.getItem(OAUTH_STATE_KEY);
  sessionStorage.removeItem(OAUTH_STATE_KEY);
  if (!expected || !receivedState) {
    return false;
  }
  return expected === receivedState;
}

export function getOAuthRedirectUri(): string {
  return `${window.location.origin}/oauth/callback`;
}
