// app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Absensi Sermon</h1>
      <p>
        Silakan login untuk melakukan absensi.
      </p>
      <p>
        Buka halaman <Link href="/login">Login</Link> atau gunakan QR Code yang disediakan di gereja.
      </p>
    </main>
  );
}
