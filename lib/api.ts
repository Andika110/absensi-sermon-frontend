const BACKEND_BASE_URL =
process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://absensi-sermon-backend-production.up.railway.app/api';

  

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}


export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export async function login(username: string, password: string) {
  const res = await fetch(`${BACKEND_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Login gagal');
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function selfCheckin(sermonId: number) {
  const res = await fetch(`${BACKEND_BASE_URL}/attendance/self-checkin`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      sermon_id: sermonId,
      lat: null, // nanti bisa diisi koordinat asli
      lng: null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Gagal self check-in');
  }
  return res.json(); // objek Attendance
}


export type Sermon = {
  id: number;
  tanggal: string; // ISO string dari backend
  judul: string;
  lokasi: string;
};

export type CreateSermonInput = {
  tanggal: string; // YYYY-MM-DDTHH:mm (nanti kita kirim sebagai ISO)
  judul: string;
  lokasi: string;
};


export async function getSermons(): Promise<Sermon[]> {
  const res = await fetch(`${BACKEND_BASE_URL}/sermon`, {
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error('Tidak punya akses. Login sebagai admin.');
  }
  if (!res.ok) throw new Error('Gagal load sermon');
  return res.json();
}


export async function createSermon(input: CreateSermonInput): Promise<Sermon> {
  const res = await fetch(`${BACKEND_BASE_URL}/sermon`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      tanggal: input.tanggal, // backend pakai DataTypes.DATE
      judul: input.judul,
      lokasi: input.lokasi,
    }),
  });
  if (!res.ok) throw new Error('Gagal membuat sermon');
  return res.json();
}

export type AttendanceItem = {
  id: number;
  sermon_id: number;
  sintua_id: number;
  status_kehadiran: string;
  catatan: string | null;
  createdAt: string;
  updatedAt: string;
  Sintua: {
    id: number;
    nama: string;
    sektor: string;
    jabatan: string;
  };
  Sermon: {
    id: number;
    tanggal: string;
    judul: string;
    lokasi: string;
  };
};

// GET /api/attendance/sermon/:id
export async function getAttendanceBySermon(
  sermonId: number,
): Promise<AttendanceItem[]> {
  const res = await fetch(
    `${BACKEND_BASE_URL}/attendance/sermon/${sermonId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(),
      },
    },
  );
  if (res.status === 401 || res.status === 403) {
    throw new Error('Tidak punya akses. Login sebagai admin.');
  }
  if (!res.ok) throw new Error('Gagal load absensi');
  return res.json();
}

export async function getSermonById(id: number): Promise<Sermon> {
  const res = await fetch(`${BACKEND_BASE_URL}/sermon/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Gagal mengambil data sermon');
  return res.json();
}

export type SintuaItem = {
  id: number;
  nama: string;
  kontak?: string | null;
  sektor: string;
  jabatan: string;
  User?: {
    id: number;
    username: string;
    role: 'sintua' | 'admin';
  } | null;
};

export async function getSintuaz(): Promise<SintuaItem[]> {
  const res = await fetch(`${BACKEND_BASE_URL}/sintua`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Gagal load data sintua');
  return res.json();
}

export async function createSintua(input: {
  nama: string;
  kontak?: string;
  sektor: string;
  jabatan: string;
}): Promise<SintuaItem> {
  const res = await fetch(`${BACKEND_BASE_URL}/sintua`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Gagal membuat sintua');
  return res.json();
}

// buat akun login untuk sintua
export async function createUserForSintua(input: {
  username: string;
  password: string;
  role: 'sintua' | 'admin';
  sintua_id: number;
}) {
  const res = await fetch(`${BACKEND_BASE_URL}/user`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Gagal membuat akun login');
  }
  return res.json();
}

export async function updateSintua(
  id: number,
  input: Partial<Pick<SintuaItem, 'nama' | 'kontak' | 'sektor' | 'jabatan'>>,
): Promise<SintuaItem> {
  const res = await fetch(`${BACKEND_BASE_URL}/sintua/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Gagal mengupdate sintua');
  return res.json();
}

export async function deleteSintua(id: number) {
  const res = await fetch(`${BACKEND_BASE_URL}/sintua/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Gagal menghapus sintua');
  return res.json();
}

export async function updateUser(
  id: number,
  input: { username?: string; password?: string; role?: 'sintua' | 'admin' },
) {
  const res = await fetch(`${BACKEND_BASE_URL}/user/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || 'Gagal mengupdate akun');
  }
  return res.json();
}


