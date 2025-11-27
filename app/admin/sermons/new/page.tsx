'use client';

import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSermon } from '../../../../lib/api';

export default function NewSermonPage() {
  const router = useRouter();
  const [judul, setJudul] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tanggal, setTanggal] = useState(''); // pakai input datetime-local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!judul || !lokasi || !tanggal) {
      setError('Semua field wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // input datetime-local menghasilkan string "YYYY-MM-DDTHH:mm"
      await createSermon({
        judul,
        lokasi,
        tanggal,
      });

      // setelah berhasil, kembali ke daftar sermon (QR otomatis muncul di sana)
      router.replace('/admin/sermons');
    } catch (err: any) {
      setError(err.message || 'Gagal membuat sermon');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Buat Jadwal Sermon
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tambahkan jadwal baru, kemudian sistem akan otomatis membuat QR untuk absensi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/admin/sermons')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            ‹ Kembali ke daftar
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Judul Sermon
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={judul}
                onChange={e => setJudul(e.target.value)}
                placeholder="Ibadah Minggu Pagi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Lokasi
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                value={lokasi}
                onChange={e => setLokasi(e.target.value)}
                placeholder="Gedung Gereja Utama"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/sermons')}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan Sermon'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
