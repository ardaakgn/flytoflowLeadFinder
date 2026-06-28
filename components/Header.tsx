'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Compass, History, LogOut, Sun, Moon, Bookmark, User, ChevronDown } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial dark theme
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }

    // Get current user email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || null);
      }
    };
    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEmail(session.user.email || null);
      } else {
        setEmail(null);
      }
    });

    // Close dropdown on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
    setDropdownOpen(false);
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
          gap: '0.6rem',
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--foreground)',
          textDecoration: 'none'
        }}>
          <img src="/logo.png" alt="FlytoFlow Leads logo" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <span>FlytoFlow <span style={{ color: 'var(--primary)' }}>Leads</span></span>
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
          <Link href="/saved" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/saved') ? 'var(--primary)' : 'var(--text-muted)',
            textDecoration: 'none',
            borderBottom: isActive('/saved') ? '2px solid var(--primary)' : '2px solid transparent',
            paddingBottom: '0.25rem',
            transition: 'var(--transition)'
          }}>
            <Bookmark size={16} /> Kaydedilenler
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

          {/* User Email Dropdown */}
          {email && (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'var(--transition)'
                }}
                className="btn-secondary"
              >
                <User size={14} />
                <span>{email}</span>
                <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.4rem',
                  minWidth: '150px',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 200
                }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--error)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'left',
                      fontWeight: 500
                    }}
                    className="dropdown-item-logout"
                  >
                    <LogOut size={14} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .dropdown-item-logout:hover {
          background-color: var(--error-light) !important;
        }
      `}</style>
    </header>
  );
}
