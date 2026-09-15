'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface CollegeOption {
  id: string;
  name: string;
  domain: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    collegeId: '',
    course: '',
    semester: 1,
    skills: '',
    interests: '',
  });

  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    token: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges && data.colleges.length > 0) {
          setColleges(data.colleges);
          setFormData((prev) => ({ ...prev, collegeId: data.colleges[0].id }));
          setSelectedCollege(data.colleges[0]);
        }
      })
      .catch(console.error);
  }, []);

  const handleCollegeChange = (id: string) => {
    const coll = colleges.find((c) => c.id === id) || null;
    setSelectedCollege(coll);
    setFormData((prev) => ({ ...prev, collegeId: id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const interestsArray = formData.interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: skillsArray,
          interests: interestsArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setVerificationData({
          token: data.verificationToken,
          url: data.verificationUrl,
        });
      }
    } catch {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl border border-borderSubtle bg-surface p-8 sm:p-10 shadow-2xl">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-borderSubtle pb-4 mb-6">
          <span className="font-mono text-xs text-accentLime">
            [ COLLEGIATE REGISTRATION ]
          </span>
          <span className="font-mono text-[10px] text-textMuted uppercase">
            VERIFIED NETWORK
          </span>
        </div>

        {verificationData ? (
          /* Verification Prompt */
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accentLime/50 bg-accentLime/10 text-accentLime">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div>
              <h2 className="font-sans text-2xl font-black uppercase text-textPrimary">
                VERIFICATION EMAIL SENT
              </h2>
              <p className="mt-2 text-xs text-textSecondary font-mono max-w-md mx-auto">
                We have generated a verification token for your university email:{' '}
                <span className="text-textPrimary font-bold">{formData.email}</span>.
              </p>
            </div>

            <div className="border border-borderLight bg-surfaceElevated p-4 text-left font-mono text-xs space-y-2">
              <p className="text-textMuted text-[11px] uppercase">[ DEVELOPMENT SIMULATION ]</p>
              <p className="text-textSecondary">
                Token: <span className="text-accentLime font-bold">{verificationData.token}</span>
              </p>
              <p className="text-textMuted text-[10px]">
                Click below to simulate email confirmation and unlock your full verified student portfolio.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={verificationData.url}
                className="w-full border border-accentLime bg-accentLime py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
              >
                [ VERIFY EMAIL NOW & ACTIVATE ACCOUNT ]
              </Link>
              <Link
                href="/login"
                className="font-mono text-xs text-textMuted hover:text-textPrimary"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <>
            <div className="mb-6">
              <h2 className="font-sans text-2xl font-black uppercase tracking-tight text-textPrimary">
                JOIN UNIVERSITY HUB
              </h2>
              <p className="mt-1 text-xs text-textSecondary font-mono">
                Connect with verified peers from top universities. Enter your details below.
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-2 border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* College Selection */}
                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    UNIVERSITY CAMPUS
                  </label>
                  <select
                    value={formData.collegeId}
                    onChange={(e) => handleCollegeChange(e.target.value)}
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  >
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id} className="bg-surfaceElevated">
                        {c.name} (@{c.domain})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Maya Lin"
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                  />
                </div>
              </div>

              {/* College Email */}
              <div>
                <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                  COLLEGE EMAIL (.EDU)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={`username@${selectedCollege?.domain || 'stanford.edu'}`}
                  className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
                <p className="mt-1 text-[10px] font-mono text-textMuted">
                  Must end with @{selectedCollege?.domain || 'university.edu'} for collegiate verification.
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
              </div>

              {/* Academic Course & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    MAJOR / COURSE
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    CURRENT SEMESTER
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value, 10) })}
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-surfaceElevated">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills (Comma separated) */}
              <div>
                <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                  TECHNICAL SKILLS (COMMA SEPARATED)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Python, Java, React, Machine Learning, System Design"
                  className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                  LEARNING INTERESTS
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Distributed Systems, Web3"
                  className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 border border-accentLime bg-accentLime py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
              >
                {isLoading ? '[ PROCESSING REGISTRATION... ]' : '[ REGISTER WITH COLLEGE ID ]'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="font-mono text-xs text-textSecondary">
                Already registered?{' '}
                <Link href="/login" className="text-accentLime font-bold hover:underline">
                  [ SIGN IN ]
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
