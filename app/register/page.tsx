'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, UserPlus, Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg('Kayıt esnasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '1.5rem',
      backgroundColor: 'var(--background)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <UserPlus size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Hesap Oluştur</h1>
          <p className="description">Lead Finder Pro'yu kullanmak için kaydolun</p>
        </div>

        {errorMsg && (
          <div className="badge badge-danger" style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            textTransform: 'none',
            letterSpacing: 'normal',
            display: 'block'
          }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="badge badge-success" style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            textTransform: 'none',
            letterSpacing: 'normal',
            display: 'block'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} className="text-muted" /> E-posta
            </label>
            <input
              id="email"
              type="email"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || successMsg !== ''}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} className="text-muted" /> Şifre
            </label>
            <input
              id="password"
              type="password"
              placeholder="•••••••• (Min. 6 Karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || successMsg !== ''}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} className="text-muted" /> Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || successMsg !== ''}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || successMsg !== ''}
            style={{ width: '100%', marginTop: '0.5rem', height: '46px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Hesap Oluşturuluyor...
              </>
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          Zaten hesabınız var mı?{' '}
          <Link href="/login" style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            <ArrowLeft size={14} /> Giriş Yap
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
