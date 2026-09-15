'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo.student@stanford.edu');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md border border-borderSubtle bg-surface p-8 sm:p-10 shadow-2xl relative">
        {/* Top Tag */}
        <div className="flex items-center justify-between mb-6 border-b border-borderSubtle pb-4">
          <span className="font-mono text-xs text-accentLime">[ AUTHENTICATION ]</span>
          <span className="font-mono text-[10px] text-textMuted uppercase">SECURE SESSION</span>
        </div>

        <div className="mb-8">
          <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-textPrimary">
            SIGN IN TO UNIVERSITY HUB
          </h2>
          <p className="mt-1 text-xs text-textSecondary font-mono">
            Enter your verified collegiate credentials to access your dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs text-textSecondary uppercase mb-1.5">
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

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-mono text-xs text-textSecondary uppercase">
                PASSWORD
              </label>
              <Link
                href="/forgot-password"
                className="font-mono text-[11px] text-accentLime hover:underline"
              >
                [ FORGOT? ]
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-textMuted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full border border-borderSubtle bg-surfaceElevated pl-10 pr-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full border border-accentLime bg-accentLime py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
          >
            {isLoading ? '[ AUTHENTICATING... ]' : '[ SIGN IN ]'}
          </button>
        </form>

        {/* Quick Demo Fill Button */}
        <div className="mt-6 pt-6 border-t border-borderSubtle">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full border border-borderLight bg-surfaceElevated py-2.5 font-mono text-xs text-accentLime hover:border-accentLime transition-colors"
          >
            [ AUTO-FILL DEMO ACCOUNT (STANFORD CS) ]
          </button>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-textSecondary">
            Don't have a verified student profile?{' '}
            <Link href="/register" className="text-accentLime font-bold hover:underline">
              [ REGISTER WITH COLLEGE ID ]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
