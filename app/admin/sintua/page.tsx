'use client';

import React, { useEffect, useState, FormEvent } from 'react';
import {
  SintuaItem,
  getSintuaz,
  createSintua,
  createUserForSintua,
  updateSintua,
  deleteSintua,
  updateUser,
} from '../../../lib/api';

export default function AdminSintuaPage() {
  const [data, setData] = useState<SintuaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addNama, setAddNama] = useState('');
  const [addKontak, setAddKontak] = useState('');
  const [addSektor, setAddSektor] = useState('');
  const [addJabatan, setAddJabatan] = useState('');

  const [creatingUserId, setCreatingUserId] = useState<number | null>(null);
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState<'sintua' | 'admin'>('sintua');

  const [editing, setEditing] = useState<SintuaItem | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editKontak, setEditKontak] = useState('');
  const [editSektor, setEditSektor] = useState('');
  const [editJabatan, setEditJabatan] = useState('');

  const [editingUserFor, setEditingUserFor] = useState<SintuaItem | null>(null);
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'sintua' | 'admin'>('sintua');

  async function load() {
    try {
      setLoading(true);
      const items = await getSintuaz();
      setData(items);
    } catch (e: any) {
      setError(e.message || 'Gagal load data sintua');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddSintua(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!addNama || !addSektor || !addJabatan) {
      setError('Nama, sektor, dan jabatan wajib diisi');
      return;
    }
    try {
      await createSintua({
        nama: addNama,
        kontak: addKontak || undefined,
        sektor: addSektor,
        jabatan: addJabatan,
      });
      setShowAddForm(false);
      setAddNama('');
      setAddKontak('');
      setAddSektor('');
      setAddJabatan('');
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal membuat sintua');
    }
  }

  function startEdit(s: SintuaItem) {
    setEditing(s);
    setEditNama(s.nama);
    setEditKontak(s.kontak || '');
    setEditSektor(s.sektor);
    setEditJabatan(s.jabatan);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    try {
      await updateSintua(editing.id, {
        nama: editNama,
        kontak: editKontak,
        sektor: editSektor,
        jabatan: editJabatan,
      });
      setEditing(null);
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal mengupdate sintua');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Yakin ingin menghapus sintua ini?')) return;
    setError(null);
    try {
      await deleteSintua(id);
      await load();
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus sintua');
    }
  }

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault();
    if (creatingUserId == null) return;
    setError(null);
    if (!userUsername || !userPassword) {
      setError('Username dan password akun wajib diisi');
      return;
    }
    try {
      await createUserForSintua({
        username: userUsername,
        password: userPassword,
        role: userRole,
        sintua_id: creatingUserId,
      });
      setCreatingUserId(null);
      setUserUsername('');
      setUserPassword('');
      setUserRole('sintua');
      await load();
      alert('Akun login berhasil dibuat untuk sintua ini.');
    } catch (e: any) {
      setError(e.message || 'Gagal membuat akun login');
    }
  }

  async function handleEditUserSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingUserFor || !editingUserFor.User) return;
    setError(null);
    try {
      await updateUser(editingUserFor.User.id, {
        username: editUserUsername || undefined,
        password: editUserPassword || undefined,
        role: editUserRole,
      });
      setEditingUserFor(null);
      setEditUserUsername('');
      setEditUserPassword('');
      await load();
      alert('Akun berhasil diperbarui.');
    } catch (e: any) {
      setError(e.message || 'Gagal mengupdate akun');
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_#22c55e22,_transparent_55%),radial-gradient(circle_at_bottom,_#0ea5e933,_transparent_60%)]" />

      <header className="relative border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Data Sintua
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-50">
              Kelola Sintua & Akun Login
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Tambahkan sintua baru dan buat atau kelola akun login yang terhubung ke setiap sintua.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
          >
            {showAddForm ? 'Tutup Form' : '+ Tambah Sintua'}
          </button>
        </div>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-6 space-y-4">
        {error && (
          <p className="text-sm text-red-200 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddSintua}
            className="rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40 p-4 space-y-4"
          >
            <h2 className="text-sm font-semibold text-slate-50">
              Tambah Sintua Baru
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={addNama}
                  onChange={(e) => setAddNama(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kontak (opsional)
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={addKontak}
                  onChange={(e) => setAddKontak(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sektor
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={addSektor}
                  onChange={(e) => setAddSektor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Jabatan
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={addJabatan}
                  onChange={(e) => setAddJabatan(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Simpan
              </button>
            </div>
          </form>
        )}

        {/* tabel sintua */}
        <div className="overflow-x-auto rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  #
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  Nama
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  Sektor
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  Jabatan
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  Kontak
                </th>
                <th className="px-3 py-2 sm:px-4 sm:py-3 text-left font-semibold text-slate-300">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-slate-400"
                  >
                    Memuat data sintua...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-4 text-center text-slate-400"
                  >
                    Belum ada data sintua.
                  </td>
                </tr>
              ) : (
                data.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={
                      idx % 2 === 0
                        ? 'bg-slate-900/60'
                        : 'bg-slate-900/40'
                    }
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-100">
                      {s.nama}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {s.sektor}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {s.jabatan}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 text-slate-300">
                      {s.kontak || '-'}
                    </td>
                    <td className="px-3 py-2 sm:px-4 sm:py-2 space-y-1">
                      {s.User ? (
                        <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-300">
                          <span>
                            Akun:{' '}
                            <span className="font-semibold">
                              {s.User.username}
                            </span>
                          </span>
                          <button
                            onClick={() => {
                              setEditingUserFor(s);
                              setEditUserUsername(s.User!.username);
                              setEditUserPassword('');
                              setEditUserRole(
                                s.User!.role as 'sintua' | 'admin',
                              );
                            }}
                            className="rounded-lg bg-slate-800 px-2 py-0.5 text-[10px] text-slate-100 hover:bg-slate-700"
                          >
                            Edit Akun
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setCreatingUserId(s.id)}
                          className="rounded-lg bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400 block"
                        >
                          Buat Akun Login
                        </button>
                      )}

                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg bg-red-500/80 px-2 py-1 text-[11px] text-slate-50 hover:bg-red-400"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* form buat akun login */}
        {creatingUserId != null && (
          <form
            onSubmit={handleCreateUser}
            className="rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40 p-4 space-y-3 max-w-md"
          >
            <h2 className="text-sm font-semibold text-slate-50">
              Buat Akun Login untuk Sintua #{creatingUserId}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={userRole}
                  onChange={(e) =>
                    setUserRole(e.target.value as 'sintua' | 'admin')
                  }
                >
                  <option value="sintua">Sintua</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCreatingUserId(null)}
                className="px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        )}

        {/* form edit sintua */}
        {editing && (
          <form
            onSubmit={handleEditSubmit}
            className="rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40 p-4 space-y-4 max-w-xl"
          >
            <h2 className="text-sm font-semibold text-slate-50">
              Edit Data Sintua: {editing.nama}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nama
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kontak
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editKontak}
                  onChange={(e) => setEditKontak(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Sektor
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editSektor}
                  onChange={(e) => setEditSektor(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Jabatan
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}

        {/* form edit akun user */}
        {editingUserFor && editingUserFor.User && (
          <form
            onSubmit={handleEditUserSubmit}
            className="rounded-2xl bg-slate-900/80 border border-slate-700/70 backdrop-blur-lg shadow-xl shadow-slate-950/40 p-4 space-y-3 max-w-md"
          >
            <h2 className="text-sm font-semibold text-slate-50">
              Edit Akun untuk {editingUserFor.nama}
            </h2>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Username
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editUserUsername}
                  onChange={(e) => setEditUserUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password baru (kosongkan jika tidak ganti)
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  value={editUserRole}
                  onChange={(e) =>
                    setEditUserRole(e.target.value as 'sintua' | 'admin')
                  }
                >
                  <option value="sintua">Sintua</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingUserFor(null)}
                className="px-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs sm:text-sm rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
