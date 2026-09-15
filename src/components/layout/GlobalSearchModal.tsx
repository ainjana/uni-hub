'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, X, User, BookOpen, FileText, HelpCircle, Briefcase, Users, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl border border-borderLight bg-surfaceElevated shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-borderLight px-4 py-3 bg-surface">
          <Search className="h-5 w-5 text-accentLime mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, skills, classes, notes, projects, communities..."
            className="w-full bg-transparent font-mono text-sm text-textPrimary placeholder:text-textMuted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-textMuted hover:text-textPrimary mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="border border-borderSubtle px-2 py-0.5 font-mono text-xs text-textMuted hover:text-textPrimary"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
          {isLoading && (
            <div className="py-8 text-center font-mono text-xs text-accentLime">
              [ QUERYING UNIVERSITY HUB REGISTRY... ]
            </div>
          )}

          {!isLoading && !results && (
            <div className="py-8 text-center text-xs font-mono text-textMuted">
              Type at least 2 characters to search across verified students, classes, notes, and communities.
            </div>
          )}

          {!isLoading && results && (
            <>
              {/* Students */}
              {results.students?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase text-accentLime mb-2">
                    <User className="h-3.5 w-3.5" />
                    [ VERIFIED STUDENTS ({results.students.length}) ]
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.students.map((s: any) => (
                      <Link
                        key={s.id}
                        href={`/profile/${s.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between border border-borderSubtle bg-surface p-2.5 hover:border-accentLime/60 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-textPrimary">{s.profile?.fullName}</p>
                          <p className="text-[10px] font-mono text-textMuted truncate">
                            {s.profile?.course} · {s.college?.name}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-accentLime">[ VIEW ]</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes */}
              {results.classes?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase text-accentLime mb-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    [ CLASSES & WORKSHOPS ({results.classes.length}) ]
                  </h4>
                  <div className="space-y-2">
                    {results.classes.map((c: any) => (
                      <Link
                        key={c.id}
                        href={`/classes/${c.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between border border-borderSubtle bg-surface p-2.5 hover:border-accentLime/60 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-textPrimary">{c.title}</p>
                          <p className="text-[10px] font-mono text-textMuted">
                            Skill: {c.skill?.name} · Host: {c.teacher?.profile?.fullName}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-accentLime">
                          [ {c.seatsAvailable} SEATS LEFT ]
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {results.resources?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase text-accentLime mb-2">
                    <FileText className="h-3.5 w-3.5" />
                    [ STUDY RESOURCES & NOTES ({results.resources.length}) ]
                  </h4>
                  <div className="space-y-2">
                    {results.resources.map((r: any) => (
                      <Link
                        key={r.id}
                        href="/resources"
                        onClick={onClose}
                        className="flex items-center justify-between border border-borderSubtle bg-surface p-2.5 hover:border-accentLime/60 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-textPrimary">{r.title}</p>
                          <p className="text-[10px] font-mono text-textMuted">
                            {r.resourceType} · {r.skillName} · by {r.author?.profile?.fullName}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-accentLime">[ DOWNLOAD ]</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Requests */}
              {results.requests?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase text-accentLime mb-2">
                    <HelpCircle className="h-3.5 w-3.5" />
                    [ HELP REQUESTS ({results.requests.length}) ]
                  </h4>
                  <div className="space-y-2">
                    {results.requests.map((req: any) => (
                      <Link
                        key={req.id}
                        href={`/requests/${req.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between border border-borderSubtle bg-surface p-2.5 hover:border-accentLime/60 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-textPrimary">{req.title}</p>
                          <p className="text-[10px] font-mono text-textMuted">
                            Urgency: {req.urgency} · Topic: {req.skillName}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] text-accentLime">[ OFFER HELP ]</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {results.communities?.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-1.5 font-mono text-xs uppercase text-accentLime mb-2">
                    <Users className="h-3.5 w-3.5" />
                    [ COMMUNITIES ({results.communities.length}) ]
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.communities.map((comm: any) => (
                      <Link
                        key={comm.id}
                        href={`/communities/${comm.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-between border border-borderSubtle bg-surface p-2.5 hover:border-accentLime/60 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-textPrimary">{comm.name}</p>
                          <p className="text-[10px] font-mono text-textMuted">{comm.topic}</p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-accentLime" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
