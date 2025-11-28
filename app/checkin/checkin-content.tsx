'use client';

import { useSearchParams } from 'next/navigation';

export function CheckinContent() {
  const searchParams = useSearchParams();

  // Ambil ?sermon_id=... dari URL
  const sermonId = searchParams.get('sermon_id');

  const hasSermonId = !!sermonId;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-semibold mb-4">Check-in Sermon</h1>

        <p className="text-sm text-slate-300 mb-4">
          QR:{' '}
          {hasSermonId
            ? `Sermon ID = ${sermonId}`
            : 'Tidak ada QR di URL'}
        </p>

        {hasSermonId && (
          <p className="text-xs text-slate-400">
            Di sini nanti kamu bisa lanjutkan logika:
            ambil data sermon {sermonId}, form login / tombol
            check-in, kirim ke endpoint
            <code className="mx-1">/api/attendance/self-checkin</code>, dll.
          </p>
        )}
      </div>
    </main>
  );
}
