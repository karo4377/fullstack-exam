export type GuestCartLine = {
  productId: string;
  quantity: number;
};

const STORAGE_KEY = 'tiny_frames_guest_cart';

export function readGuestCart(): GuestCartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (line) => typeof line.productId === 'string' && typeof line.quantity === 'number' && line.quantity > 0,
    );
  } catch {
    return [];
  }
}

export function writeGuestCart(items: GuestCartLine[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function guestCartCount(items = readGuestCart()) {
  return items.reduce((sum, line) => sum + line.quantity, 0);
}

export function addGuestCartItem(productId: string, quantity = 1) {
  const items = readGuestCart();
  const existing = items.find((line) => line.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  writeGuestCart(items);
  return items;
}

export function removeGuestCartItem(productId: string) {
  const items = readGuestCart().filter((line) => line.productId !== productId);
  writeGuestCart(items);
  return items;
}

export function updateGuestCartItem(productId: string, quantity: number) {
  if (quantity < 1) return removeGuestCartItem(productId);
  const items = readGuestCart();
  const line = items.find((entry) => entry.productId === productId);
  if (line) line.quantity = quantity;
  writeGuestCart(items);
  return items;
}

export function clearGuestCart() {
  writeGuestCart([]);
}
