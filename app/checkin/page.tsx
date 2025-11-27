// app/checkin/page.tsx
import { Suspense } from 'react';
import { CheckinContent } from './checkin-content';

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          Memuat halaman check-in...
        </div>
      }
    >
      <CheckinContent />
    </Suspense>
  );
}
