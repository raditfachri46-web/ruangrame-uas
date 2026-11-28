'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { AuthShell } from '@/components/AuthShell';
import { loginUser, AuthState } from '@/app/actions/auth';

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState);

  return (
    <AuthShell
      judul="Masuk ke RuangRame"
      deskripsi="Lanjutkan diskusimu dan balas thread yang kamu ikuti."
      bawah={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="text-cobalt font-semibold hover:underline underline-offset-4">
            Daftar sekarang
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
              placeholder="Masukkan username"
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
              type="password"
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
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
    </AuthShell>
  );
}