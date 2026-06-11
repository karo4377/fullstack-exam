import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/breadcrumbs';

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  variant?: 'default' | 'compact';
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  variant = 'default',
}: PageHeaderProps) {
  return (
    <header className={`page-header${variant === 'compact' ? ' page-header--compact' : ''}`}>
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      {title ? <h1 className="title-page">{title}</h1> : null}
      {subtitle && <p className="subtitle">{subtitle}</p>}
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
