'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-borderSubtle bg-surface p-8 sm:p-10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-borderSubtle pb-4 mb-6">
          <span className="font-mono text-xs text-accentLime">[ RECOVERY ]</span>
          <span className="font-mono text-[10px] text-textMuted uppercase">PASSWORD RESET</span>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accentLime bg-accentLime/10 text-accentLime">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-bold uppercase text-textPrimary">
                RESET LINK DISPATCHED
              </h2>
              <p className="mt-2 text-xs text-textSecondary font-mono">
                Instructions to reset your password have been routed to{' '}
                <span className="text-textPrimary font-bold">{email}</span>.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-block w-full border border-accentLime bg-accentLime py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover"
            >
              [ RETURN TO SIGN IN ]
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="font-sans text-2xl font-black uppercase text-textPrimary">
                RECOVER CREDENTIALS
              </h2>
              <p className="mt-1 text-xs text-textSecondary font-mono">
                Enter your registered college email to receive a secure password reset link.
              </p>
            </div>

            <div>
              <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                COLLEGE EMAIL (.EDU)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-textMuted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@stanford.edu"
                  className="w-full border border-borderSubtle bg-surfaceElevated pl-10 pr-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full border border-accentLime bg-accentLime py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
            >
              {isLoading ? '[ DISPATCHING... ]' : '[ SEND RESET INSTRUCTIONS ]'}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="font-mono text-xs text-textMuted hover:text-accentLime">
                ← Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
