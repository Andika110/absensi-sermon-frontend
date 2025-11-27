// app/login/login-content.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login } from '../../lib/api';


export function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ambil query redirect kalau ada, misalnya ?redirect=/admin/attendance
  const redirectTo =
    searchParams.get('redirect')?.toString() || '/admin/attendance';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    // panggil backend, simpan token ke localStorage (diatur di api.ts)
    await login(username, password);

    // kalau sukses, redirect
    router.push(redirectTo);
  } catch (err: any) {
    setError(err.message || 'Gagal login');
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md px-4">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Admin Panel
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Masuk ke Admin Absensi
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Gunakan akun admin untuk mengelola jadwal sermon dan absensi.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-5 shadow-xl shadow-slate-950/40"
        >
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-200 bg-red-500/10 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-500 text-slate-950 px-3 py-2 text-sm font-semibold shadow-md shadow-emerald-500/30 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <p className="mt-1 text-[11px] text-center text-slate-500">
            Setelah login, kamu akan diarahkan ke{' '}
            <span className="font-medium text-slate-300">
              {redirectTo}
            </span>
            .
          </p>
        </form>
      </div>
    </main>
  );
}
