'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Star,
  Zap,
  Users,
  MessageSquare,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { MentorMatch } from '@/types';

export default function MentorsPage() {
  const [query, setQuery] = useState('I want to learn Python for Machine Learning');
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    'I want to learn Python for Machine Learning and neural nets',
    'Need help with Java concurrency and thread synchronization',
    'Looking for a mentor in Data Structures and Algorithms for interview prep',
    'Want to master Figma design tokens and responsive Tailwind CSS',
    'Understanding distributed systems, Raft consensus, and LSM storage engines',
  ];

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/match-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs text-accentLime font-bold">
            <Sparkles className="h-4 w-4" />
            <span>[ AI SEMANTIC MENTOR MATCHING ]</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
            STUDENT MENTOR DISCOVERY
          </h1>
          <p className="mt-2 font-mono text-xs text-textSecondary max-w-2xl leading-relaxed">
            Explain your learning goal in natural language. Our semantic matching engine evaluates skill proficiency, verified peer ratings, teaching track record, and academic alignment to recommend your optimal mentor.
          </p>
        </div>

        {/* Conversational Query Box */}
        <div className="border border-borderSubtle bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-accentLime" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 'I want to master Java concurrency' or 'Looking for help with DSA dynamic programming'"
                className="w-full border border-borderSubtle bg-surfaceElevated pl-10 pr-4 py-3 font-mono text-xs text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={isLoading || !query.trim()}
              className="border border-accentLime bg-accentLime px-6 py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? '[ MATCHING... ]' : '[ MATCH MENTORS ]'}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="pt-2">
            <span className="font-mono text-[11px] text-textMuted uppercase block mb-2">
              [ SUGGESTED LEARNING GOALS ]:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleSearch(p);
                  }}
                  className="border border-borderLight bg-surfaceElevated px-2.5 py-1 font-mono text-[11px] text-textSecondary hover:text-accentLime hover:border-accentLime transition-colors text-left"
                >
                  "{p.length > 40 ? `${p.substring(0, 40)}...` : p}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-3 font-mono text-xs text-textMuted">
            <span>
              [ MATCHED STUDENT MENTORS ({matches.length}) ]
            </span>
            <span>RANKED BY SEMANTIC RELEVANCE + REPUTATION</span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-mono text-xs text-accentLime">
              [ EVALUATING STUDENT MENTORS & SKILL PROFILES... ]
            </div>
          ) : matches.length === 0 ? (
            <div className="border border-dashed border-borderLight bg-surface p-12 text-center font-mono text-xs text-textMuted">
              No mentors matched your exact criteria. Try broadening your learning query.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {matches.map((m) => (
                <div
                  key={m.mentorId}
                  className="border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6 hover:border-borderLight transition-all"
                >
                  {/* Top Bar with Match Score */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-accentLime/20 text-accentLime font-mono text-xl font-bold flex items-center justify-center">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans text-xl font-bold text-textPrimary">
                            {m.fullName}
                          </h3>
                          <ShieldCheck className="h-4 w-4 text-accentLime" />
                          <span className="font-mono text-xs text-accentLime">
                            [ {m.collegeName} ]
                          </span>
                        </div>
                        <p className="font-mono text-xs text-textSecondary mt-0.5">
                          {m.course} · Semester {m.semester}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="border border-accentLime/60 bg-accentLime/10 px-4 py-2 text-right">
                      <div className="font-mono text-lg font-black text-accentLime">
                        {m.matchScore}% MATCH
                      </div>
                      <span className="font-mono text-[10px] text-textMuted uppercase">
                        SEMANTIC FIT
                      </span>
                    </div>
                  </div>

                  {/* Why this is a great match callout */}
                  <div className="border border-borderLight bg-surfaceElevated p-4 font-mono text-xs space-y-2">
                    <span className="text-accentLime uppercase font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      [ WHY THIS MENTOR IS A GREAT MATCH ]:
                    </span>
                    <p className="text-textPrimary leading-relaxed">{m.matchReason}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {m.strengths.map((str, idx) => (
                        <span
                          key={idx}
                          className="border border-accentLime/30 bg-accentLime/5 px-2 py-0.5 text-[10px] text-accentLime"
                        >
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reputation Metrics & Skills */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-borderSubtle font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-textMuted">
                      <span className="text-accentLime font-bold">{m.rating.toFixed(1)} ★ ({m.ratingCount} reviews)</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-textPrimary">
                        <Zap className="h-3 w-3 fill-accentLime text-accentLime" />
                        {m.totalKarma} Karma
                      </span>
                      <span>·</span>
                      <span>Availability: {m.availability}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Link
                        href={`/profile/${m.mentorId}`}
                        className="border border-borderLight bg-surfaceElevated px-4 py-2 font-mono text-xs text-textPrimary hover:border-accentLime text-center"
                      >
                        [ PORTFOLIO ]
                      </Link>
                      <Link
                        href="/chat"
                        className="flex-1 sm:flex-none border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover text-center shadow-glow-lime"
                      >
                        [ MESSAGE MENTOR ]
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
