'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export type AuthState = {
  error?: string;
};

export async function registerUser(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  if (username.length < 3) {
    return { error: 'Username minimal 3 karakter.' };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: 'Username sudah dipakai, silakan pilih yang lain.' };
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      password,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('ruangrame_user', newUser.username, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // aktif 7 hari
  });

  redirect('/');
}

export async function loginUser(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== password) {
    return { error: 'Username atau password salah.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('ruangrame_user', user.username, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/');
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('ruangrame_user');
  redirect('/');
}