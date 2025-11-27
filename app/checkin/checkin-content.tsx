// app/checkin/checkin-content.tsx
'use client';

import { useSearchParams } from 'next/navigation';
// import komponen/hook lain yang sebelumnya ada di page.tsx

export function CheckinContent() {
  const searchParams = useSearchParams();

  const qr = searchParams.get('qr'); // contoh kalau kamu pakai query ?qr=...
  // pindahkan semua state, fetch, dan JSX lama di sini.
  // Misalnya:

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        <h1 className="text-2xl font-semibold mb-4">Check-in Sermon</h1>
        <p className="text-sm text-slate-300">
          QR: {qr || 'Tidak ada QR di URL'}
        </p>
        {/* ... sisa tampilan dan logika absensi seperti di versi lokalmu ... */}
      </div>
    </main>
  );
}
