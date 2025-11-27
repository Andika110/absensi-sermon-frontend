'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sermon,
  getSermons,
  getAttendanceBySermon,
  AttendanceItem,
} from '../../lib/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [latestAttendance, setLatestAttendance] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/admin');
    }
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSermons();
        setSermons(data);

        if (data.length > 0) {
          const last = data[data.length - 1];
          const attend = await getAttendanceBySermon(last.id);
          setLatestAttendance(attend);
        }
      } catch (e: any) {
        setError(e.message || 'Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalSermon = sermons.length;
  const latest = sermons.at(-1) || null;
  const totalHadirTerakhir = latestAttendance.filter(
    (a) => a.status_kehadiran === 'Hadir',
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <header className="relative border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Admin Dashboard
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-50">
              Ringkasan Absensi Sermon
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Pantau jadwal, kehadiran sintua, dan akses cepat ke menu utama.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/40">
              Panel Admin Gereja
            </span>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-6 space-y-6">
        {error && (
          <p className="text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* kartu ringkasan */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-xl shadow-slate-950/40 p-4">
            <p className="text-[11px] font-medium text-slate-400">
              Total Sermon Terdaftar
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-50">
              {loading ? '…' : totalSermon}
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Semua jadwal ibadah yang sudah dibuat di sistem.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-xl shadow-slate-950/40 p-4">
            <p className="text-[11px] font-medium text-slate-400">
              Kehadiran Sermon Terakhir
            </p>
            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {loading || !latest ? '…' : totalHadirTerakhir}
            </p>
            <p className="mt-2 text-[11px] text-slate-400">
              Jumlah sintua yang tercatat hadir pada jadwal terakhir.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-slate-900 border border-emerald-500/40 shadow-xl shadow-emerald-500/20 p-4 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-medium text-emerald-200">
                Akses Cepat
              </p>
              <p className="mt-2 text-sm text-slate-50">
                Navigasi utama untuk mengelola jadwal dan rekap kehadiran.
              </p>
            </div>
            <div className="mt-3 space-y-2 text-[13px]">
              <Link
                href="/admin/sermons"
                className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 hover:bg-slate-900 transition-colors"
              >
                <span>Kelola Jadwal & QR</span>
                <span className="text-xs text-emerald-300">›</span>
              </Link>
              <Link
                href="/admin/attendance"
                className="flex items-center justify-between rounded-xl bg-slate-950/70 px-3 py-2 hover:bg-slate-900 transition-colors"
              >
                <span>Rekap Absensi</span>
                <span className="text-xs text-emerald-300">›</span>
              </Link>
            </div>
          </div>
        </div>

        {/* dua panel bawah */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-xl shadow-slate-950/40 p-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Sermon Terakhir
            </h2>
            {loading ? (
              <p className="mt-3 text-sm text-slate-400">Memuat data…</p>
            ) : latest ? (
              <div className="mt-3 space-y-1 text-sm text-slate-200">
                <p className="font-medium">
                  {latest.judul || `Sermon #${latest.id}`}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(latest.tanggal).toLocaleString('id-ID', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {latest.lokasi ? ` • ${latest.lokasi}` : ''}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {totalHadirTerakhir} sintua tercatat hadir.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">
                Belum ada sermon yang terdaftar.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-xl shadow-slate-950/40 p-4">
            <h2 className="text-sm font-semibold text-slate-50">
              Aktivitas Absensi Terbaru
            </h2>
            {loading ? (
              <p className="mt-3 text-sm text-slate-400">Memuat data…</p>
            ) : latestAttendance.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Belum ada data absensi untuk sermon terakhir.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                {latestAttendance.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between border-b border-slate-800/70 pb-1 last:border-0 last:pb-0"
                  >
                    <span>{a.Sintua?.nama || 'Sintua'}</span>
                    <span className="text-emerald-300 font-medium">
                      {a.status_kehadiran}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
