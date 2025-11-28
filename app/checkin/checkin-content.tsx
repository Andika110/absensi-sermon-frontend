'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSermonById } from '../../lib/api'; // sesuaikan path relatif

type SermonDetail = {
  id: number;
  judul: string | null;
  tanggal: string | null;
  lokasi: string | null;
};

export function CheckinContent() {
  const searchParams = useSearchParams();
  const sermonId = searchParams.get('sermon_id');

  const [sermon, setSermon] = useState<SermonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sermonId) return;
const numericId = Number(sermonId);
getSermonById(numericId)
      .then((data) => setSermon(data))
      .catch((e: any) => setError(e.message || 'Gagal ambil data sermon'))
      .finally(() => setLoading(false));
  }, [sermonId]);

  if (!sermonId) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">
          QR: Tidak ada QR di URL
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-semibold mb-4">Check-in Sermon</h1>

        {loading && (
          <p className="text-sm text-slate-300">Memuat data sermon...</p>
        )}

        {error && (
          <p className="text-sm text-red-300">{error}</p>
        )}

        {sermon && (
          <div className="mt-2 text-sm text-slate-200">
            <p>Judul: {sermon.judul || `Sermon #${sermon.id}`}</p>
            {sermon.tanggal && (
              <p>
                Waktu:{' '}
                {new Date(sermon.tanggal).toLocaleString('id-ID')}
              </p>
            )}
            {sermon.lokasi && <p>Lokasi: {sermon.lokasi}</p>}
          </div>
        )}

        <p className="mt-4 text-sm text-slate-300">
          QR: Sermon ID = {sermonId}
        </p>
      </div>
    </main>
  );
}
