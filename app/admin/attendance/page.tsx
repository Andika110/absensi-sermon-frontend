'use client';

import React, { useEffect, useState } from 'react';
import {
  Sermon,
  getSermons,
  getAttendanceBySermon,
  AttendanceItem,
} from '../../../lib/api';
import * as XLSX from 'xlsx';

export default function AdminAttendancePage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [items, setItems] = useState<AttendanceItem[]>([]);
  const [loadingSermon, setLoadingSermon] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Hadir' | 'Tidak'>(
    'all',
  );

  // load daftar sermon
  useEffect(() => {
    async function loadSermons() {
      try {
        const data = await getSermons();
        setSermons(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      } catch (e: any) {
        setError(e.message || 'Gagal load sermon');
      } finally {
        setLoadingSermon(false);
      }
    }
    loadSermons();
  }, []);

  // load attendance ketika sermon berubah
  useEffect(() => {
    if (selectedId == null) return;
    const sermonId = selectedId as number;

    async function loadAttendance() {
      setLoadingAttendance(true);
      setError(null);
      try {
        const data = await getAttendanceBySermon(sermonId);
        setItems(data);
      } catch (e: any) {
        setError(e.message || 'Gagal load absensi');
      } finally {
        setLoadingAttendance(false);
      }
    }
    loadAttendance();
  }, [selectedId]);

  const currentSermon =
    sermons.find((s) => s.id === selectedId) || null;

  const totalHadir = items.filter(
    (i) => i.status_kehadiran === 'Hadir',
  ).length;

  // filter + search
  const filteredItems = items.filter((item) => {
    const matchStatus =
      statusFilter === 'all' || item.status_kehadiran === statusFilter;

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.Sintua?.nama.toLowerCase().includes(q) ||
      (item.Sintua?.sektor || '').toLowerCase().includes(q) ||
      (item.Sintua?.jabatan || '').toLowerCase().includes(q);

    return matchStatus && matchSearch;
  });

  function formatSermonDate(tanggal?: string) {
    if (!tanggal) return '';
    return new Date(tanggal).toLocaleString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // export ke Excel (XLSX)
  function downloadXlsx(filename: string, rows: string[][]) {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Absensi');
    XLSX.writeFile(wb, filename);
  }

  function handleExportXlsx() {
    if (!currentSermon || filteredItems.length === 0) return;

    const header = [
      'No',
      'Nama Sintua',
      'Sektor',
      'Jabatan',
      'Status',
      'Catatan',
    ];
    const rows = filteredItems.map((item, idx) => [
      String(idx + 1),
      item.Sintua?.nama || '',
      item.Sintua?.sektor || '',
      item.Sintua?.jabatan || '',
      item.status_kehadiran || '',
      item.catatan || '',
    ]);
    const allRows = [header, ...rows];

    const title =
      currentSermon.judul || `sermon-${currentSermon.id}`;
    const filename = `rekap-${title
      .replace(/\s+/g, '-')
      .toLowerCase()}.xlsx`;
    downloadXlsx(filename, allRows);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <header className="relative border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Rekap Absensi
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-50">
              Rekap Absensi Sermon
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Pilih jadwal sermon untuk melihat daftar sintua yang hadir, filter, dan export.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] sm:text-xs text-slate-400">
              Pilih sermon:
            </label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              disabled={loadingSermon || sermons.length === 0}
              value={selectedId ?? ''}
              onChange={(e) => {
                const val = Number(e.target.value);
                setSelectedId(
                  Number.isNaN(val) ? null : val,
                );
              }}
            >
              {sermons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.judul || `Sermon #${s.id}`} —{' '}
                  {formatSermonDate(s.tanggal)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {currentSermon && (
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300">
              <span className="font-medium text-slate-50">
                {currentSermon.judul ||
                  `Sermon #${currentSermon.id}`}
              </span>
              <span>• {formatSermonDate(currentSermon.tanggal)}</span>
              {currentSermon.lokasi && (
                <span>• {currentSermon.lokasi}</span>
              )}
              <span className="ml-auto text-emerald-400 font-semibold">
                Hadir: {totalHadir} / {items.length}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Cari nama / sektor / jabatan..."
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs sm:text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'all' | 'Hadir' | 'Tidak',
                )
              }
            >
              <option value="all">Semua status</option>
              <option value="Hadir">Hadir</option>
              <option value="Tidak">Tidak</option>
            </select>

            <button
              type="button"
              onClick={handleExportXlsx}
              disabled={filteredItems.length === 0}
              className="inline-flex items-center rounded-lg bg-emerald-500 text-slate-950 px-3 py-1.5 text-xs sm:text-sm font-medium shadow-md shadow-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400"
            >
              Export XLX
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  #
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  Nama Sintua
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  Sektor
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  Jabatan
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  Status
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-slate-300">
                  Catatan
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingAttendance ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-slate-400"
                  >
                    Memuat data absensi...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-slate-400"
                  >
                    Belum ada data absensi untuk sermon ini.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-slate-900/60'
                        : 'bg-slate-900/40'
                    }
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-100">
                      {item.Sintua?.nama || '-'}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {item.Sintua?.sektor || '-'}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {item.Sintua?.jabatan || '-'}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2">
                      <span
                        className={
                          item.status_kehadiran === 'Hadir'
                            ? 'inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/40'
                            : 'inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200 border border-slate-600'
                        }
                      >
                        {item.status_kehadiran}
                      </span>
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {item.catatan || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
