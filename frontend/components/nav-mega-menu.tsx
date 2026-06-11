'use client';

import Link from 'next/link';
import { useClientSearchParams } from '@/lib/use-client-search-params';
import { ChevronDown } from 'lucide-react';
import { isCollectionsNavActive } from '@/lib/site-nav';
import type { NavMenuGroup } from '@/lib/site';

type NavMegaMenuProps = {
  id: string;
  label: string;
  groups: NavMenuGroup[];
  pathname: string;
  onNavigate?: () => void;
  variant?: 'desktop' | 'mobile';
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
};

export function NavMegaMenu({
  id,
  label,
  groups,
  pathname,
  onNavigate,
  variant = 'desktop',
  mobileOpen = false,
  onMobileToggle,
}: NavMegaMenuProps) {
  const searchParams = useClientSearchParams();
  const isActive = isCollectionsNavActive(pathname, searchParams);

  if (variant === 'mobile') {
    return (
      <li className="mobile-nav-accordion">
        <button
          type="button"
          className="mobile-nav-accordion-trigger"
          aria-expanded={mobileOpen}
          aria-controls={`${id}-panel`}
          onClick={onMobileToggle}
        >
          {label}
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            className={`mobile-nav-chevron-icon${mobileOpen ? ' is-open' : ''}`}
            aria-hidden
          />
        </button>
        {mobileOpen && (
          <div id={`${id}-panel`} className="mobile-nav-accordion-panel">
            {groups.map((group) => (
              <div key={group.title} className="mobile-nav-group">
                <p className="mobile-nav-group-title">{group.title}</p>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={onNavigate}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="nav-dropdown">
      <button
        type="button"
        className={`nav-dropdown-trigger${isActive ? ' is-active' : ''}`}
        aria-expanded="false"
        aria-haspopup="true"
      >
        {label}
        <ChevronDown size={16} strokeWidth={1.75} className="nav-dropdown-chevron" aria-hidden />
      </button>
      <div className="nav-dropdown-panel" role="menu">
        <div className="nav-dropdown-grid">
          {groups.map((group) => (
            <div key={group.title} className="nav-dropdown-col">
              <p className="nav-dropdown-heading">{group.title}</p>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} role="menuitem" onClick={onNavigate}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
