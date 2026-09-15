'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Zap } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      verifyToken(urlToken);
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully! +25 Karma awarded.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification token is invalid or expired.');
      }
    } catch {
      setStatus('error');
      setMessage('A network error occurred while verifying your token.');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-borderSubtle bg-surface p-8 sm:p-10 shadow-2xl text-center">
        <div className="flex items-center justify-between border-b border-borderSubtle pb-4 mb-6">
          <span className="font-mono text-xs text-accentLime">[ EMAIL VERIFICATION ]</span>
          <span className="font-mono text-[10px] text-textMuted uppercase">STATUS CHECK</span>
        </div>

        {status === 'loading' && (
          <div className="py-8 space-y-4">
            <div className="mx-auto h-12 w-12 border-2 border-accentLime border-t-transparent animate-spin" />
            <p className="font-mono text-xs text-accentLime">
              [ VERIFYING UNIVERSITY CREDENTIALS... ]
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-6 space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accentLime bg-accentLime/10 text-accentLime">
              <ShieldCheck className="h-10 w-10" />
            </div>

            <div>
              <h2 className="font-sans text-2xl font-black uppercase text-textPrimary">
                COLLEGIATE VERIFIED
              </h2>
              <p className="mt-2 text-xs text-textSecondary font-mono">{message}</p>
            </div>

            <div className="border border-accentLime/40 bg-accentLime/10 p-3 flex items-center justify-center gap-2 text-xs font-mono text-accentLime">
              <Zap className="h-4 w-4 fill-accentLime" />
              <span>+25 WELCOME KARMA ADDED TO YOUR LEDGER</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 border border-accentLime bg-accentLime py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
            >
              <span>[ ENTER PERSONAL DASHBOARD ]</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="py-6 space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10 text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-sans text-xl font-bold uppercase text-red-400">
                VERIFICATION FAILED
              </h2>
              <p className="mt-2 text-xs text-textSecondary font-mono">{message}</p>
            </div>

            <div className="space-y-3 pt-2">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter verification token"
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
              />
              <button
                onClick={() => verifyToken(token)}
                className="w-full border border-borderLight bg-surfaceElevated py-2.5 font-mono text-xs text-accentLime hover:border-accentLime"
              >
                [ RETRY VERIFICATION ]
              </button>
            </div>
          </div>
        )}

        {status === 'idle' && (
          <div className="py-6 space-y-5">
            <h2 className="font-sans text-xl font-bold uppercase text-textPrimary">
              MANUAL VERIFICATION
            </h2>
            <p className="text-xs text-textSecondary font-mono">
              Paste your token below if you did not arrive via direct link.
            </p>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste verification token here"
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
            />
            <button
              onClick={() => verifyToken(token)}
              disabled={!token}
              className="w-full border border-accentLime bg-accentLime py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover disabled:opacity-50"
            >
              [ VERIFY ACCOUNT ]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[85vh] items-center justify-center">
          <div className="h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
