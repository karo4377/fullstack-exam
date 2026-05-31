export function userFirstName(user: {
  firstName?: string | null;
  name?: string | null;
  email: string;
}): string {
  const first = user.firstName?.trim() || user.name?.trim().split(/\s+/)[0];
  if (first) return first;
  return user.email.split('@')[0] ?? 'there';
}
