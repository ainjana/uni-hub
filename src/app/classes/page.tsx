'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  Star,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'my-teaching'>('all');

  useEffect(() => {
    fetchClasses();
  }, [searchTerm, skillFilter, filterMode]);

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (searchTerm) q.set('search', searchTerm);
      if (skillFilter !== 'All') q.set('skill', skillFilter);
      if (filterMode === 'my-teaching') q.set('my', 'teaching');

      const res = await fetch(`/api/classes?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setClasses(data.classes || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const skillsList = [
    'All',
    'Java',
    'Python',
    'React & Next.js',
    'Data Structures & Algorithms',
    'UI/UX Design (Figma)',
    'Machine Learning',
    'System Design',
  ];

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ PEER-TO-PEER ACADEMIC SESSIONS ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              LEARN FROM VERIFIED STUDENTS
            </h1>
            <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
              Master practical coding, algorithmic problem solving, and architecture design through focused classes taught by high-reputation peer mentors.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/mentors"
              className="flex items-center gap-2 border border-borderLight bg-surfaceElevated px-4 py-2.5 font-mono text-xs text-textPrimary hover:border-accentLime/60 transition-colors"
            >
              <span>[ AI MENTOR MATCH ]</span>
            </Link>
            <Link
              href="/classes/teach"
              className="flex items-center gap-2 border border-accentLime bg-accentLime px-4 py-2.5 font-mono text-xs font-bold text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>[ TEACH A SKILL CLASS (+50 KARMA) ]</span>
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="border border-borderSubtle bg-surface p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search classes, concepts, topics..."
              className="w-full border border-borderSubtle bg-surfaceElevated pl-9 pr-3 py-2 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
              <span className="text-textMuted mr-1">[ SKILL ]:</span>
              {skillsList.slice(0, 5).map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSkillFilter(skill)}
                  className={`px-2 py-1 transition-colors ${
                    skillFilter === skill
                      ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  [ {skill} ]
                </button>
              ))}
            </div>

            <button
              onClick={() => setFilterMode(filterMode === 'all' ? 'my-teaching' : 'all')}
              className={`px-3 py-1 font-mono text-xs border ${
                filterMode === 'my-teaching'
                  ? 'border-accentLime bg-accentLime/10 text-accentLime'
                  : 'border-borderSubtle text-textMuted hover:text-white'
              }`}
            >
              [ {filterMode === 'my-teaching' ? 'SHOWING MY CLASSES' : 'MY HOSTED'} ]
            </button>
          </div>
        </div>

        {/* Classes Grid */}
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-accentLime">
            [ LOADING DISCOVERY REPOSITORY... ]
          </div>
        ) : classes.length === 0 ? (
          <div className="border border-dashed border-borderLight bg-surface p-12 text-center space-y-4">
            <BookOpen className="mx-auto h-10 w-10 text-textMuted" />
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">
              NO SESSIONS FOUND
            </h3>
            <p className="font-mono text-xs text-textMuted max-w-md mx-auto">
              No classes currently match your criteria. Why not host a class on a skill you know well?
            </p>
            <Link
              href="/classes/teach"
              className="inline-block border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover"
            >
              [ HOST A PEER CLASS ]
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const teacher = cls.teacher;
              const prof = teacher?.profile;
              const dateObj = new Date(cls.dateTime);

              return (
                <div
                  key={cls.id}
                  className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-borderLight transition-all"
                >
                  <div className="space-y-4">
                    {/* Top Status Tags */}
                    <div className="flex justify-between items-start">
                      <span className="border border-accentLime/40 bg-accentLime/10 px-2 py-0.5 font-mono text-[10px] text-accentLime font-bold">
                        [ {cls.seatsAvailable} / {cls.seatsTotal} SEATS AVAILABLE ]
                      </span>
                      <span className="font-mono text-[11px] text-textMuted uppercase">
                        {cls.isOnline ? '[ ONLINE LINK ]' : '[ IN-PERSON ]'}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <span className="font-mono text-xs text-accentLime block mb-1">
                        Skill: {cls.skill?.name}
                      </span>
                      <h3 className="font-sans text-lg font-bold text-textPrimary leading-snug">
                        {cls.title}
                      </h3>
                      <p className="mt-2 text-xs text-textSecondary line-clamp-3 leading-relaxed">
                        {cls.description}
                      </p>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-1.5 border-t border-borderSubtle/60 pt-3 font-mono text-xs text-textMuted">
                      <div className="flex items-center gap-2 text-textPrimary">
                        <Calendar className="h-3.5 w-3.5 text-accentLime" />
                        <span>
                          {dateObj.toLocaleDateString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-textMuted" />
                        <span>
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.durationMinutes} mins)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Information Card */}
                  <div className="mt-6 pt-4 border-t border-borderSubtle flex items-center justify-between">
                    <Link
                      href={`/profile/${teacher?.id}`}
                      className="flex items-center gap-2.5 group"
                    >
                      <div className="h-8 w-8 rounded-full bg-accentLime/20 text-accentLime font-mono text-xs font-bold flex items-center justify-center">
                        {prof?.fullName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-textPrimary group-hover:text-accentLime transition-colors">
                            {prof?.fullName}
                          </span>
                          <ShieldCheck className="h-3 w-3 text-accentLime" />
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[10px] text-textMuted">
                          <span>{prof?.rating?.toFixed(1)} ★</span>
                          <span>·</span>
                          <span>{prof?.totalKarma} KARMA</span>
                        </div>
                      </div>
                    </Link>

                    <Link
                      href={`/classes/${cls.id}`}
                      className="border border-borderLight bg-surfaceElevated px-3 py-1.5 font-mono text-xs text-accentLime hover:border-accentLime transition-colors"
                    >
                      [ DETAILS ]
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
