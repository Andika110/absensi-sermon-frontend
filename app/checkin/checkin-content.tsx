'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSermonById } from '../../lib/api';

type SermonDetail = {
  id: number;
  judul: string | null;
  tanggal: string | null;
  lokasi: string | null;
};

export function CheckinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sermonId = searchParams.get('sermon_id');

  const [token, setToken] = useState<string | null>(null);
  const [sermon, setSermon] = useState<SermonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);

  // 1) Cek token; kalau belum login redirect ke /login?redirect=...
  useEffect(() => {
    const t =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!t) {
      const redirectUrl = `/checkin?sermon_id=${sermonId ?? ''}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }

    setToken(t);
  }, [router, sermonId]);

  // 2) Ambil data sermon
  useEffect(() => {
    if (!sermonId) {
      setLoading(false);
      return;
    }

    const numericId = Number(sermonId);

getSermonById(numericId)
  .then((data) => setSermon(data))
  .catch(() => { /* ... */ })
  .finally(() => setLoading(false));
  }, [sermonId]);

  async function handleCheckin() {
    if (!token || !sermonId) return;

    try {
      setCheckingIn(true);
      setCheckinMsg(null);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/attendance/self-checkin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sermon_id: Number(sermonId) }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Gagal check-in');
      }

      // Pesan singkat saja
      setCheckinMsg('Berhasil check-in.');
      // Optional: otomatis hilang setelah 3 detik
      setTimeout(() => setCheckinMsg(null), 3000);
    } catch (e: any) {
      setCheckinMsg(e.message || 'Terjadi kesalahan saat check-in.');
    } finally {
      setCheckingIn(false);
    }
  }

  if (!sermonId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">QR: Tidak ada QR di URL</p>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center overflow-hidden">
      {/* Layer glow background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      {/* Garis dekor di atas */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />

      <div className="relative max-w-md w-full px-4">
        <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
          {/* header kartu */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80">
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Absensi Ibadah
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-50">
              Check-in Sermon
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Tunjukkan layar ini ke petugas pintu setelah berhasil check-in.
            </p>
          </div>

          {/* isi kartu */}
          <div className="px-6 py-5">
            {loading && (
              <p className="text-sm text-slate-300 text-center">
                Memuat data sermon...
              </p>
            )}

            {!loading && sermon && (
              <div className="space-y-1.5 text-sm text-slate-200">
                <p>
                  <span className="font-medium text-slate-100">Judul:</span>{' '}
                  {sermon.judul || `Sermon #${sermon.id}`}
                </p>
                {sermon.tanggal && (
                  <p>
                    <span className="font-medium text-slate-100">Waktu:</span>{' '}
                    {new Date(sermon.tanggal).toLocaleString('id-ID', {
                      weekday: 'short',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
                {sermon.lokasi && (
                  <p>
                    <span className="font-medium text-slate-100">Lokasi:</span>{' '}
                    {sermon.lokasi}
                  </p>
                )}
              </div>
            )}

            <p className="mt-3 text-[11px] text-slate-500">
              QR ID: <span className="font-mono text-slate-300">{sermonId}</span>
            </p>

            <button
              onClick={handleCheckin}
              disabled={checkingIn}
              className="mt-6 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              {checkingIn ? 'Memproses...' : 'Check-in sekarang'}
            </button>

            {checkinMsg && (
              <div className="mt-4 rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <span>{checkinMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
