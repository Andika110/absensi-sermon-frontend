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

  // 2) Ambil data sermon dari backend
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

      setCheckinMsg(
        '✅ Check-in berhasil! Anda sudah tercatat hadir untuk ibadah ini.'
      );
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

  // Saat belum selesai cek token / sedang redirect ke login
  if (!token) {
    return null;
  }

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center overflow-hidden">
      {/* background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <div className="relative max-w-md w-full px-4">
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-xl shadow-slate-950/40 p-6">
          <h1 className="text-2xl font-semibold mb-4 text-center">
            Check-in Sermon
          </h1>

          {loading && (
            <p className="text-sm text-slate-300 text-center">
              Memuat data sermon...
            </p>
          )}

          {!loading && sermon && (
            <div className="mt-2 text-sm text-slate-200 space-y-1 text-center">
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

          <p className="mt-4 text-xs text-slate-400 text-center">
            QR: Sermon ID = {sermonId}
          </p>

          <button
            onClick={handleCheckin}
            disabled={checkingIn}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:cursor-not-allowed transition-colors"
          >
            {checkingIn ? 'Memproses...' : 'Check-in sekarang'}
          </button>

          {checkinMsg && (
            <div className="mt-4 rounded-xl border border-emerald-400/60 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {checkinMsg}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
