export function userFirstName(user: {
  firstName?: string | null;
  name?: string | null;
  email: string;
  role?: string;
}): string {
  const firstName = user.firstName?.trim();
  if (firstName) return firstName;
  if (user.role === 'ADMIN') return 'Admin';
  const fromName = user.name?.trim().split(/\s+/)[0];
  if (fromName) return fromName;
  return user.email.split('@')[0] ?? 'there';
}
