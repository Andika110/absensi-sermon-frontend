'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import { Sermon, getSermons } from '../../../lib/api';

const WEB_BASE_URL = 'http://192.168.22.229:3001'; // sesuaikan IP/domain

export default function AdminSermonsPage() {
  const [data, setData] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const sermons = await getSermons();
        setData(sermons);
      } catch (e: any) {
        setError(e.message || 'Gagal load sermon');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <header className="relative border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Jadwal & QR Sermon
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-50">
              Kelola Jadwal Ibadah & Check-in
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Buat jadwal baru dan cetak QR code untuk absensi jemaat di pintu
              gereja.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sermons/new"
              className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              + Jadwal Sermon
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-6">
        {loading && (
          <p className="text-sm text-slate-400">Memuat data sermon...</p>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && !error && data.length === 0 && (
          <p className="text-sm text-slate-400">
            Belum ada jadwal sermon. Klik &quot;+ Jadwal Sermon&quot; untuk
            menambahkan.
          </p>
        )}

        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => {
            const url = `${WEB_BASE_URL}/checkin?sermon_id=${s.id}`;
            const title = s.judul || `Sermon #${s.id}`;
            const tanggalLabel = s.tanggal
              ? new Date(s.tanggal).toLocaleString('id-ID', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : null;

            return (
              <article
                key={s.id}
                className="relative overflow-hidden rounded-2xl bg-slate-900/70 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40 flex flex-col"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-500" />

                <div className="p-4 pb-3 flex-1 flex flex-col items-center">
                  <h2 className="mt-2 text-sm font-semibold text-slate-50 text-center">
                    {title}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    ID: {s.id}
                    {tanggalLabel ? ` • ${tanggalLabel}` : ''}
                  </p>
                  {s.lokasi && (
                    <p className="text-[11px] text-slate-400 mt-0.5 text-center">
                      Lokasi: {s.lokasi}
                    </p>
                  )}

                 <div className="mt-4 bg-white p-3 rounded-xl border border-slate-700 shadow-inner">
                 <QRCode value={url} size={160} bgColor="#ffffff" fgColor="#000000" />
                    </div>


                  <p className="mt-3 text-[11px] text-slate-300 break-all text-center">
                    {url}
                  </p>
                </div>

                <div className="px-4 pb-3 pt-2 border-t border-slate-800/80 bg-slate-950/70">
                  <p className="text-[11px] text-slate-400 text-center">
                    Cetak dan tempel QR ini di pintu gereja. Jemaat cukup scan
                    dan login untuk tercatat hadir.
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
