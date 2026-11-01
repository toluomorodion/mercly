'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, ShoppingCart, PackageOpen, LogOut } from 'lucide-react';
import styles from './layout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userName = session?.user?.name || '';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowLogout(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/products', label: 'Products', icon: ShoppingCart },
    { href: '/orders', label: 'Orders', icon: PackageOpen },
  ];

  return (
    <div className={styles.layout}>
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>Mercly</div>
        <nav className={styles.nav}>
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.activeNavLink : ''}`}
            >
              <link.icon size={18} strokeWidth={1.5} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter} ref={menuRef}>
          <div className={styles.userInfo} onClick={() => setShowLogout((prev) => !prev)}>
            <button className={styles.avatar}>{initials}</button>
            <span className={styles.userName}>{userName}</span>
            {showLogout && (
              <div className={styles.logoutDropdown}>
                <button className={styles.logoutItem} onClick={() => signOut({ callbackUrl: '/auth?mode=login' })}>
                  <LogOut size={16} strokeWidth={1.5} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className={styles.mobileNav}>
        <div className={styles.logo}>Mercly</div>
        <nav className={styles.mobileMenu}>
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.activeNavLink : ''}`}
            >
              <link.icon size={18} strokeWidth={1.5} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.content}>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
