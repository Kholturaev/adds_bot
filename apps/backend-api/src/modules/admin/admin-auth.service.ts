export function isValidAdminCredentials(
  providedUsername: string | undefined,
  providedPassword: string | undefined,
  expectedUsername: string,
  expectedPassword: string,
): boolean {
  if (!providedUsername || !providedPassword) {
    return false;
  }

  return (
    providedUsername === expectedUsername &&
    providedPassword === expectedPassword
  );
}
