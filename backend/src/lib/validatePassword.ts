// Password strength rules. Used whenever a password is created (new admin accounts), never when logging in.

export const MIN_PASSWORD_LENGTH = 8;

/** Returns an error message for a weak password, or null when it is strong enough. */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) return "Kata sandi wajib diisi.";
  if (password.length < MIN_PASSWORD_LENGTH) return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  if (!/[a-z]/.test(password)) return "Kata sandi harus memuat huruf kecil.";
  if (!/[A-Z]/.test(password)) return "Kata sandi harus memuat huruf besar.";
  if (!/[0-9]/.test(password)) return "Kata sandi harus memuat angka.";
  return null;
}
