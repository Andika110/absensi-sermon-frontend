'use client';

import { useSearchParams } from 'next/navigation';

export function CheckinContent() {
  const searchParams = useSearchParams();
  const sermonId = searchParams.get('sermon_id');

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
        <p className="text-sm text-slate-300 mb-4">
          QR: Sermon ID = {sermonId}
        </p>
      </div>
    </main>
  );
}
