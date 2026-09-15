'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Zap, Calendar, Clock, MapPin, Users, ArrowRight, AlertCircle } from 'lucide-react';

export default function TeachSkillPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    skillName: 'Python',
    description: '',
    dateTime: '',
    durationMinutes: 60,
    seatsTotal: 5,
    isOnline: true,
    locationUrl: '',
    requirements: '',
    resourcesUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const commonSkills = [
    'Python',
    'Java',
    'Data Structures & Algorithms',
    'React & Next.js',
    'Machine Learning',
    'System Design',
    'TypeScript',
    'UI/UX Design (Figma)',
    'PostgreSQL & Databases',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create class');
      } else {
        router.push(`/classes/${data.classSession.id}`);
      }
    } catch {
      setError('A network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl border border-borderSubtle bg-surface p-8 sm:p-10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-borderSubtle pb-4 mb-6">
          <span className="font-mono text-xs text-accentLime">
            [ PEER TEACHING PORTAL ]
          </span>
          <span className="font-mono text-[10px] text-textMuted uppercase">
            HOST MASTERCLASS
          </span>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-sans text-2xl sm:text-3xl font-black uppercase tracking-tight text-textPrimary">
              TEACH A SKILL TO STUDENTS
            </h1>
            <span className="shrink-0 border border-accentLime/50 bg-accentLime/10 px-3 py-1 font-mono text-xs text-accentLime font-bold flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 fill-accentLime" />
              +50 KARMA UPON COMPLETION
            </span>
          </div>
          <p className="mt-2 font-mono text-xs text-textSecondary leading-relaxed">
            Host a focused workshop or problem-solving walkthrough for your fellow university students. Control your seat limit and requirements.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2 border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-400 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
          {/* Title */}
          <div>
            <label className="block text-textSecondary uppercase mb-1.5 font-bold">
              SESSION TITLE
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Java Concurrency: Lock-Free Queues & Volatile Semantics"
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          {/* Skill Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                PRIMARY SKILL / DOMAIN
              </label>
              <select
                value={formData.skillName}
                onChange={(e) => setFormData({ ...formData, skillName: e.target.value })}
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary focus:border-accentLime focus:outline-none"
              >
                {commonSkills.map((s) => (
                  <option key={s} value={s} className="bg-surfaceElevated">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Skill if needed */}
            <div>
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                OR TYPE CUSTOM SKILL
              </label>
              <input
                type="text"
                placeholder="Or custom skill..."
                onChange={(e) => {
                  if (e.target.value.trim()) {
                    setFormData({ ...formData, skillName: e.target.value.trim() });
                  }
                }}
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-textSecondary uppercase mb-1.5 font-bold">
              DETAILED SYLLABUS & DESCRIPTION
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline what participants will learn, code examples you will walk through, and interactive exercises..."
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                DATE & START TIME
              </label>
              <input
                type="datetime-local"
                required
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary focus:border-accentLime focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                DURATION (MINS)
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={formData.durationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, durationMinutes: parseInt(e.target.value, 10) })
                }
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary focus:border-accentLime focus:outline-none"
              />
            </div>
          </div>

          {/* Seats Total & Online / In-person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                TOTAL SEATS (PREVENTS OVERBOOKING)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formData.seatsTotal}
                onChange={(e) =>
                  setFormData({ ...formData, seatsTotal: parseInt(e.target.value, 10) })
                }
                className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary focus:border-accentLime focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-textMuted">
                Small group sizes (3-8 students) guarantee high interaction and stellar reviews.
              </p>
            </div>

            <div>
              <label className="block text-textSecondary uppercase mb-1.5 font-bold">
                DELIVERY FORMAT
              </label>
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-textPrimary">
                  <input
                    type="radio"
                    name="isOnline"
                    checked={formData.isOnline}
                    onChange={() => setFormData({ ...formData, isOnline: true })}
                    className="accent-[#D5FA3C]"
                  />
                  <span>Online Video Link</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-textPrimary">
                  <input
                    type="radio"
                    name="isOnline"
                    checked={!formData.isOnline}
                    onChange={() => setFormData({ ...formData, isOnline: false })}
                    className="accent-[#D5FA3C]"
                  />
                  <span>On-Campus Room</span>
                </label>
              </div>
            </div>
          </div>

          {/* Location / Meeting URL */}
          <div>
            <label className="block text-textSecondary uppercase mb-1.5 font-bold">
              {formData.isOnline ? 'MEETING LINK / PLATFORM URL' : 'CAMPUS BUILDING & ROOM NUMBER'}
            </label>
            <input
              type="text"
              required
              value={formData.locationUrl}
              onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
              placeholder={
                formData.isOnline
                  ? 'https://meet.google.com/... or Zoom link'
                  : 'e.g. Gates Computer Science Building, Room 208'
              }
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          {/* Requirements & Prerequisites */}
          <div>
            <label className="block text-textSecondary uppercase mb-1.5 font-bold">
              PREREQUISITES / PREPARATION
            </label>
            <input
              type="text"
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="e.g. Bring laptop with Java 21 JDK installed, familiarity with OOP"
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          {/* Supporting Resources URL */}
          <div>
            <label className="block text-textSecondary uppercase mb-1.5 font-bold">
              OPTIONAL SUPPORTING RESOURCE LINK (NOTES / GITHUB REPO)
            </label>
            <input
              type="url"
              value={formData.resourcesUrl}
              onChange={(e) => setFormData({ ...formData, resourcesUrl: e.target.value })}
              placeholder="https://github.com/... or Google Drive link"
              className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2.5 text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-borderSubtle flex justify-between items-center">
            <Link
              href="/classes"
              className="text-textMuted hover:text-textPrimary"
            >
              ← Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="border border-accentLime bg-accentLime px-6 py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
            >
              {isLoading ? '[ PUBLISHING CLASS... ]' : '[ PUBLISH CLASS SESSION ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
