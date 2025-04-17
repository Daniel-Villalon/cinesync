export interface AuthError {
  code: string;
  message: string;
}

export interface GoogleSignInResult {
  success: boolean;
  user?: {
    email: string;
    displayName: string | null;
    photoURL: string | null;
  };
  error?: AuthError;
} 