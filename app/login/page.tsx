// app/login/page.tsx
import { Suspense } from 'react';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          Memuat halaman login...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
