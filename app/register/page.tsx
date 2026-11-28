'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { registerUser, AuthState } from '@/app/actions/auth';

const initialState: AuthState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <AuthShell
      judul="Buat akun RuangRame"
      deskripsi="Daftar untuk membuat thread dan ikut berdiskusi."
      bawah={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="text-cobalt font-semibold hover:underline underline-offset-4">
            Masuk di sini
          </Link>
        </>
      }
    >
        {state.error && (
          <div className="mb-4 rounded-lg bg-coral/15 border-2 border-coral px-4 py-3 text-sm font-semibold text-[#b8321f]">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-ink mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Contoh: radit_untar"
              className="w-full rounded-lg bg-white border-2 border-ink px-4 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:shadow-hard-sm transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-ink mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              placeholder="Masukkan password"
              className="w-full rounded-lg bg-white border-2 border-ink px-4 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:shadow-hard-sm transition-shadow"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-hard w-full py-3 rounded-lg bg-cobalt text-white font-bold disabled:opacity-60 disabled:translate-x-0"
          >
            {isPending ? 'Menyimpan akun...' : 'Daftar Sekarang'}
          </button>
        </form>
    </AuthShell>
  );
}