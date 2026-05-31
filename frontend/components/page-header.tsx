import type { ReactNode } from 'react';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/breadcrumbs';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      <h1 className="title-page">{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
