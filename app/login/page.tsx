'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginUser, AuthState } from '@/app/actions/auth';

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, initialState);

  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md backdrop-blur-2xl bg-white/[0.04] border border-white/[0.1] border-t-white/20 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/25">
              R
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
              RuangRame
            </span>
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-white text-center mb-1">Selamat Datang</h1>
        <p className="text-xs text-slate-400 text-center mb-6">
          Masuk ke akun RuangRame kamu untuk ikut berdiskusi
        </p>

        {state.error && (
          <div className="mb-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 px-4 py-3 text-xs font-medium text-rose-200">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Masukkan username"
              className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-fuchsia-400/60"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Masukkan password"
              className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-fuchsia-400/60"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/25 transition disabled:opacity-50"
          >
            {isPending ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-fuchsia-300 font-semibold hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}