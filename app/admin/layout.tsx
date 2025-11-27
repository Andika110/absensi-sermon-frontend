'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = [
  { href: '/admin/attendance', label: 'Rekap Absensi', icon: '📊' },
  { href: '/admin/sermons', label: 'Jadwal Sermon & QR', icon: '📅' },
  { href: '/admin/sintua', label: 'Data Sintua & Akun', icon: '👤' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Sidebar (desktop) */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64 lg:w-72'
        }`}
      >
        <div className="px-3 pt-4 pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <span className="text-slate-950 font-black text-sm">QR</span>
            </div>
            {!collapsed && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                  Admin Panel
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  Absensi Sermon
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="h-7 w-7 inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800 text-xs"
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-2 overflow-y-auto">
          {adminNav.map((item) => {
            const active =
              pathname === item.href ||
              pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors',
                  active
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-900/70 hover:text-slate-50',
                ].join(' ')}
              >
                <span className="text-base w-6 text-center">
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-3 pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          {!collapsed && (
            <>
              <p className="font-medium text-slate-400">
                Login sebagai Admin
              </p>
              <p>Gunakan menu di kiri untuk mengelola data.</p>
            </>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden border-b border-slate-800 bg-slate-950/90 backdrop-blur flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              Admin Panel
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Absensi Sermon
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {adminNav.find((n) => pathname?.startsWith(n.href))?.label ??
              'Dashboard'}
          </span>
        </header>

        <main className="flex-1 min-h-0">{children}</main>
      </div>
    </div>
  );
}
