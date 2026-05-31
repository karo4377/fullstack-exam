export type OrderItem = {
  id?: string;
  productId?: string;
  title?: string;
  quantity?: number;
  priceCents?: number;
};

export type OrderSummary = {
  id: string;
  totalCents: number;
  status: string;
  createdAt?: string;
  items?: OrderItem[];
};

export function formatOrderDate(value?: string | Date): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatOrderStatus(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    SHIPPED: 'Shipped',
    CANCELLED: 'Cancelled',
  };
  return labels[status] ?? status;
}

export function orderStatusClass(status: string): string {
  const classes: Record<string, string> = {
    PENDING: 'order-status--pending',
    PAID: 'order-status--paid',
    SHIPPED: 'order-status--shipped',
    CANCELLED: 'order-status--cancelled',
  };
  return classes[status] ?? 'order-status--default';
}

export function orderShortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function lineTotalCents(item: OrderItem): number {
  return Number(item.priceCents ?? 0) * Number(item.quantity ?? 0);
}

export function orderItemCount(items: OrderItem[] | undefined): number {
  return (items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);
}
