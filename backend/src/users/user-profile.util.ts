export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  postalCode: true,
  country: true,
  role: true,
} as const;

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  role: string;
};

export function buildDisplayName(firstName?: string | null, lastName?: string | null): string | null {
  const full = [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
  return full || null;
}

export function splitFullName(name?: string | null): { firstName: string | null; lastName: string | null } {
  const trimmed = name?.trim();
  if (!trimmed) return { firstName: null, lastName: null };
  const parts = trimmed.split(/\s+/);
  return {
    firstName: parts[0] ?? null,
    lastName: parts.slice(1).join(' ') || null,
  };
}

export function normalizeOptional(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
