'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Filter,
  Plus,
  Trash2,
  FileScan,
  AlertCircle,
  X,
} from 'lucide-react';

export default function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'completed' | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // New Event Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Exam',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, [categoryFilter, statusFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (categoryFilter !== 'All') query.set('category', categoryFilter);
      if (statusFilter !== 'all') query.set('status', statusFilter);

      const res = await fetch(`/api/timeline?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, currentCompleted: boolean) => {
    try {
      const res = await fetch(`/api/timeline/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentCompleted }),
      });
      if (res.ok) {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, isCompleted: !currentCompleted } : e))
        );
      }
    } catch {
      alert('Error updating event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this event from your timeline?')) return;
    try {
      const res = await fetch(`/api/timeline/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      alert('Error deleting event');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setNewEvent({
          title: '',
          category: 'Exam',
          date: new Date().toISOString().split('T')[0],
          time: '',
          location: '',
          description: '',
        });
        fetchEvents();
      }
    } catch {
      alert('Error creating event');
    }
  };

  const categories = ['All', 'Exam', 'Class', 'Deadline', 'Workshop', 'Notice', 'Event'];

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ CENTRALIZED ACADEMIC CALENDAR ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              PERSONAL STUDENT TIMELINE
            </h1>
            <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
              All your exams, classes, workshops, and critical deadlines in a single high-clarity agenda. Sourced automatically via AI Scanner and peer registrations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 border border-borderLight bg-surfaceElevated px-3 py-2 font-mono text-xs text-textPrimary hover:border-accentLime/60 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-accentLime" />
              <span>[ ADD EVENT ]</span>
            </button>
            <Link
              href="/scanner"
              className="flex items-center gap-2 border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
            >
              <FileScan className="h-3.5 w-3.5" />
              <span>[ SCAN NOTICE ]</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="border border-borderSubtle bg-surface p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="font-mono text-xs text-textMuted mr-2">[ CATEGORY ]:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 font-mono text-xs transition-colors ${
                  categoryFilter === cat
                    ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                [ {cat.toUpperCase()} ]
              </button>
            ))}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center border border-borderSubtle bg-surfaceElevated p-0.5">
            {(['all', 'upcoming', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-mono text-xs uppercase ${
                  statusFilter === st
                    ? 'bg-surface text-accentLime font-bold border border-borderLight'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Event Feed */}
        {isLoading ? (
          <div className="py-16 text-center font-mono text-xs text-accentLime">
            [ LOADING TIMELINE AGENDA... ]
          </div>
        ) : events.length === 0 ? (
          <div className="border border-dashed border-borderLight bg-surface p-12 text-center space-y-4">
            <Calendar className="mx-auto h-10 w-10 text-textMuted" />
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">
              NO TIMELINE EVENTS FOUND
            </h3>
            <p className="font-mono text-xs text-textMuted max-w-md mx-auto">
              No events matched your current category or status filter. Scan a university notice or register for peer classes to build your calendar.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link
                href="/scanner"
                className="border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover"
              >
                [ SCAN ACADEMIC NOTICE ]
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const isExam = ev.category === 'Exam';
              const isDeadline = ev.category === 'Deadline';
              return (
                <div
                  key={ev.id}
                  className={`border p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    ev.isCompleted
                      ? 'border-borderSubtle bg-surface/50 opacity-60'
                      : 'border-borderSubtle bg-surface hover:border-borderLight'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Completion Toggle Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(ev.id, ev.isCompleted)}
                      className="mt-1 text-textMuted hover:text-accentLime transition-colors"
                      title={ev.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {ev.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-accentLime" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 font-mono text-[10px] font-bold ${
                            isExam
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : isDeadline
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                              : 'bg-accentLime/20 text-accentLime border border-accentLime/40'
                          }`}
                        >
                          [ {ev.category.toUpperCase()} ]
                        </span>
                        <span className="font-mono text-xs text-textMuted">
                          Source: [{ev.source}]
                        </span>
                        {ev.relevanceScore < 1 && (
                          <span className="font-mono text-[10px] text-accentLime">
                            Relevance: {(ev.relevanceScore * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      <h3
                        className={`font-sans text-base font-bold text-textPrimary ${
                          ev.isCompleted ? 'line-through text-textMuted' : ''
                        }`}
                      >
                        {ev.title}
                      </h3>

                      {ev.description && (
                        <p className="text-xs text-textSecondary max-w-2xl leading-relaxed">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Metadata & Delete */}
                  <div className="flex items-center gap-6 font-mono text-xs text-textMuted self-end md:self-auto">
                    <div className="text-right space-y-0.5">
                      <div className="flex items-center gap-1.5 text-textPrimary font-semibold">
                        <Calendar className="h-3.5 w-3.5 text-accentLime" />
                        <span>{ev.date}</span>
                      </div>
                      {ev.time && (
                        <div className="flex items-center gap-1.5 text-textMuted text-[11px]">
                          <Clock className="h-3 w-3" />
                          <span>{ev.time}</span>
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-1.5 text-textMuted text-[11px]">
                          <MapPin className="h-3 w-3" />
                          <span>{ev.location}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="text-textMuted hover:text-red-400 p-1"
                      title="Remove event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Custom Event Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md border border-borderLight bg-surfaceElevated p-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-borderSubtle pb-3 mb-4">
                <span className="font-mono text-xs text-accentLime">[ NEW TIMELINE ENTRY ]</span>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-textMuted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-textMuted uppercase mb-1">EVENT TITLE</label>
                  <input
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g. Distributed Systems Lab Checkoff"
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-textMuted uppercase mb-1">CATEGORY</label>
                    <select
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    >
                      {['Exam', 'Class', 'Deadline', 'Workshop', 'Notice', 'Event'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-textMuted uppercase mb-1">DATE</label>
                    <input
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-textMuted uppercase mb-1">TIME (OPTIONAL)</label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      placeholder="e.g. 14:00 - 15:30"
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-textMuted uppercase mb-1">LOCATION</label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="e.g. Online or Room 102"
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1">DESCRIPTION</label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Preparation notes, required materials..."
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="border border-borderSubtle px-3 py-2 text-textMuted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="border border-accentLime bg-accentLime px-4 py-2 font-bold text-background hover:bg-accentLimeHover"
                  >
                    [ SAVE ENTRY ]
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
