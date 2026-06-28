'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Compass, History, LogOut, Sun, Moon } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header style={{
      backgroundColor: 'var(--card-bg)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
    }}>
      <div className="container" style={{
        paddingTop: '1rem',
        paddingBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--foreground)',
          textDecoration: 'none'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={18} />
          </div>
          <span>Lead Finder <span style={{ color: 'var(--primary)' }}>Pro</span></span>
        </Link>

        {/* Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-muted)',
            textDecoration: 'none',
            borderBottom: isActive('/dashboard') ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'var(--transition)'
          }}>
            <Compass size={16} /> Dashboard
          </Link>
          <Link href="/history" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/history') ? 'var(--primary)' : 'var(--text-muted)',
            textDecoration: 'none',
            borderBottom: isActive('/history') ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'var(--transition)'
          }}>
            <History size={16} /> Geçmiş Aramalar
          </Link>
        </nav>

        {/* User / Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground)',
              padding: '0.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
            title={isDark ? 'Açık Tema' : 'Koyu Tema'}
            className="btn-secondary"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  );
}
