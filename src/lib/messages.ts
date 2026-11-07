export const MSG = {
  passwordWeak: 'At least 8 characters, including a number.',
  alreadyRegistered: 'This email already has an account.',
  emailNotConfirmed: 'Please verify your email first.',
  rateLimited: 'Too many attempts. Try again in 15 minutes.',
  invalidCredentials: 'Incorrect email or password.',
  verificationSent: 'Verification email sent.',
  resetLinkSent:
    "If an account exists for this email, we've sent a reset link.",
  fromSignUpBanner:
    'Check your email and click the link to verify your account.',
  OFFLINE: "You're offline. Changes will not be saved.",
  SERVER_ERROR: 'Something went wrong. Try again.',
  LOGIN_EXPIRED: 'Please log in again.',
  NOT_ALLOWED: "You don't have permission to do that.",
  UPLOAD_FAILED: 'Upload failed. Check your connection.',
  FILE_INVALID: "This file can't be used. Choose a JPG, PNG or WebP under 10 MB.",
  EXPORT_EMPTY: 'No receipts in that range. Adjust the dates and try again.',
  VERIFY_EMAIL_RESENT: 'Verification email sent.',
  DELETE_FAILED: "Couldn't delete. Check your connection.",
} as const;
