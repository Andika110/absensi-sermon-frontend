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

      setCheckinMsg('✅ Anda sudah tercatat hadir untuk ibadah ini.');
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
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-semibold mb-4">Check-in Sermon</h1>

        {loading && (
          <p className="text-sm text-slate-300">Memuat data sermon...</p>
        )}

        {!loading && sermon && (
          <div className="mt-2 text-sm text-slate-200">
            <p>Judul: {sermon.judul || `Sermon #${sermon.id}`}</p>
            {sermon.tanggal && (
              <p>
                Waktu:{' '}
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
            {sermon.lokasi && <p>Lokasi: {sermon.lokasi}</p>}
          </div>
        )}

        <p className="mt-4 text-sm text-slate-300">
          QR: Sermon ID = {sermonId}
        </p>

        <button
          onClick={handleCheckin}
          disabled={checkingIn}
          className="mt-6 w-full rounded-xl bg-emerald-500 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:bg-emerald-800"
        >
          {checkingIn ? 'Memproses...' : 'Check-in sekarang'}
        </button>

        {checkinMsg && (
          <p className="mt-3 text-sm text-slate-200">{checkinMsg}</p>
        )}
      </div>
    </main>
  );
}
