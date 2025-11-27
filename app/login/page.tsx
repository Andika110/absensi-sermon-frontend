'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { login } from '../../lib/api';

function saveToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(username, password);
      // sesuaikan dengan bentuk respons backend
      const token = res.token || res.accessToken;
      if (!token) {
        throw new Error('Token tidak ditemukan di respons login.');
      }

      saveToken(token);

      // jika user punya role admin, bisa arahkan ke /admin
      const role = res.user?.role;
      if (role === 'admin' && redirect === '/') {
        router.replace('/admin');
      } else {
        router.replace(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Kiri: branding */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-b from-emerald-500/20 via-sky-500/10 to-slate-900 p-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300 mb-3">
              Sistem Absensi Gereja
            </p>
            <h1 className="text-2xl font-semibold leading-snug text-slate-50">
              Selamat datang di
              <span className="block text-emerald-300">
                Aplikasi Absensi Sermon
              </span>
            </h1>
            <p className="mt-4 text-sm text-slate-200/80 max-w-sm">
              Kelola kehadiran jemaat, jadwal sermon, dan rekap absensi dengan
              cepat dan terpusat. Scan QR di pintu gereja, data langsung
              tercatat.
            </p>
          </div>

          <div className="mt-6 text-xs text-slate-300/80">
            <p className="font-medium">Tips keamanan</p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>Jangan bagikan akun admin kepada orang lain.</li>
              <li>Logout setelah selesai menggunakan komputer umum.</li>
            </ul>
          </div>
        </div>

        {/* Kanan: form login */}
        <div className="w-full md:w-1/2 bg-slate-950/60 backdrop-blur-sm p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-50">
              Masuk ke akun
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Gunakan akun Sintua atau Admin yang sudah terdaftar.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="contoh: admin01"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-slate-500 text-center">
            Bila lupa akun, hubungi admin gereja untuk reset atau pembuatan
            akun baru.
          </p>
        </div>
      </div>
    </main>
  );
}
