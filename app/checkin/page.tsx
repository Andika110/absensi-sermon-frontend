'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSermonById, selfCheckin } from '../../lib/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export default function CheckinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sermonIdParam = searchParams.get('sermon_id');

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState<string>('');
  const [sermon, setSermon] = useState<any | null>(null);

  // cek sermon_id & login, lalu otomatis checkin
  useEffect(() => {
    const sermonId = sermonIdParam ? Number(sermonIdParam) : NaN;
    if (!sermonIdParam || Number.isNaN(sermonId)) {
      setStatus('error');
      setMessage('Link absensi tidak valid. Parameter sermon_id tidak ditemukan.');
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace(`/login?redirect=/checkin?sermon_id=${sermonId}`);
      return;
    }

    async function run() {
      try {
        setStatus('loading');
        setMessage('Memproses kehadiran Anda...');

        // opsional: ambil info sermon untuk ditampilkan
        const s = await getSermonById(sermonId);
        setSermon(s);

        await selfCheckin(sermonId); // panggil endpoint self-checkin
        setStatus('success');
        setMessage('Kehadiran Anda sudah tercatat. Terima kasih.');
      } catch (e: any) {
        setStatus('error');
        setMessage(e.message || 'Terjadi kesalahan saat mencatat kehadiran.');
      }
    }

    run();
  }, [router, sermonIdParam]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-xl shadow-2xl shadow-slate-950/40 p-6 sm:p-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-400/40">
            {status === 'success' ? (
              <span className="text-emerald-400 text-2xl">✓</span>
            ) : status === 'error' ? (
              <span className="text-red-400 text-2xl">!</span>
            ) : (
              <span className="text-sky-400 text-2xl">⏳</span>
            )}
          </div>

          <h1 className="text-lg sm:text-xl font-semibold text-slate-50">
            {status === 'success'
              ? 'Absensi Berhasil'
              : status === 'error'
              ? 'Absensi Gagal'
              : 'Memproses Absensi'}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            {message ||
              'Mohon tunggu sebentar, sistem sedang memproses data kehadiran Anda.'}
          </p>

          {sermon && (
            <div className="mt-4 w-full rounded-2xl bg-slate-950/70 border border-slate-700 px-4 py-3 text-left text-xs sm:text-sm">
              <p className="text-slate-200 font-medium">
                {sermon.judul || `Sermon #${sermon.id}`}
              </p>
              <p className="mt-1 text-slate-400">
                {new Date(sermon.tanggal).toLocaleString('id-ID', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {sermon.lokasi ? ` • ${sermon.lokasi}` : ''}
              </p>
            </div>
          )}

          <p className="mt-4 text-[11px] text-slate-500">
            Simpan layar ini sebagai bukti bila petugas membutuhkan konfirmasi
            kehadiran Anda.
          </p>
        </div>
      </div>
    </main>
  );
}
