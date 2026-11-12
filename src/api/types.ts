export type AuthStatusResponse = {
  isAuthenticated: boolean;
  userId?: string;
};

export type LoginResponse = {
  success: boolean;
  sessionEstablished: boolean;
  errorMessage?: string;
};

export type RedirectUrlResponse = {
  redirectUrl: string;
};

export type OAuthCallbackResponse = {
  success: boolean;
  sessionEstablished: boolean;
  errorMessage?: string;
};

export type ForgotPasswordResponse = {
  recoveryRouteOpened: boolean;
  errorMessage?: string;
};

export type LegalContentResponse = {
  content: string;
  contentType: string;
  errorMessage?: string;
};

export type ApiErrorBody = {
  message?: string;
  errorMessage?: string;
};
