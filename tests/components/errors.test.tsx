// T-NFR-2: Every message in PRD 12.2 is exported from messages.ts with the exact wording.
import { MSG } from '../../src/lib/messages';

describe('T-NFR-2 error messages — exact PRD 12.2 wording', () => {
  it('offline banner', () => {
    expect(MSG.OFFLINE).toBe("You're offline. Changes will not be saved.");
  });

  it('server / unknown error', () => {
    expect(MSG.SERVER_ERROR).toBe('Something went wrong. Try again.');
  });

  it('login expired', () => {
    expect(MSG.LOGIN_EXPIRED).toBe('Please log in again.');
  });

  it('not allowed', () => {
    expect(MSG.NOT_ALLOWED).toBe("You don't have permission to do that.");
  });

  it('upload failed', () => {
    expect(MSG.UPLOAD_FAILED).toBe('Upload failed. Check your connection.');
  });

  it('file type or size wrong', () => {
    expect(MSG.FILE_INVALID).toBe(
      "This file can't be used. Choose a JPG, PNG or WebP under 10 MB.",
    );
  });

  it('export range empty', () => {
    expect(MSG.EXPORT_EMPTY).toBe(
      'No receipts in that range. Adjust the dates and try again.',
    );
  });

  it('verification email resent', () => {
    expect(MSG.VERIFY_EMAIL_RESENT).toBe('Verification email sent.');
  });

  it('delete failed', () => {
    expect(MSG.DELETE_FAILED).toBe("Couldn't delete. Check your connection.");
  });
});
