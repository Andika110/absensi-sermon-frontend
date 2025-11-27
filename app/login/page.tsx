// app/login/page.tsx
import { Suspense } from 'react';
import { LoginContent } from './login-content';

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Memuat halaman login...</p>}>
      <LoginContent />
    </Suspense>
  );
}
