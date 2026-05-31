export type UserProfile = {
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

export type UpdateProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

export function userFullName(user: Pick<UserProfile, 'firstName' | 'lastName' | 'name'>): string {
  const fromParts = [user.firstName?.trim(), user.lastName?.trim()].filter(Boolean).join(' ');
  if (fromParts) return fromParts;
  return user.name?.trim() ?? '';
}

export function profileToCheckoutFields(user: UserProfile) {
  return {
    fullName: userFullName(user),
    email: user.email,
    phone: user.phone ?? '',
    addressLine1: user.addressLine1 ?? '',
    addressLine2: user.addressLine2 ?? '',
    city: user.city ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country ?? 'Denmark',
  };
}

export const emptyProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'Denmark',
};

export function userToProfileForm(user: UserProfile) {
  return {
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    addressLine1: user.addressLine1 ?? '',
    addressLine2: user.addressLine2 ?? '',
    city: user.city ?? '',
    postalCode: user.postalCode ?? '',
    country: user.country ?? 'Denmark',
  };
}

export function isProfileComplete(user: UserProfile): boolean {
  return Boolean(
    user.firstName?.trim() &&
      user.phone?.trim() &&
      user.addressLine1?.trim() &&
      user.city?.trim() &&
      user.postalCode?.trim(),
  );
}

export function formatSavedAddress(user: UserProfile): string | null {
  const cityLine = [user.postalCode?.trim(), user.city?.trim()].filter(Boolean).join(' ');
  const parts = [user.addressLine1?.trim(), cityLine, user.country?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}
