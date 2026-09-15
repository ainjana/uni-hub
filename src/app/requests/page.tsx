'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  Zap,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  X,
} from 'lucide-react';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    skillName: 'Data Structures & Algorithms',
    urgency: 'MEDIUM',
    availability: '',
  });

  useEffect(() => {
    fetchRequests();
  }, [urgencyFilter, statusFilter, searchTerm]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (urgencyFilter !== 'All') q.set('urgency', urgencyFilter);
      if (statusFilter !== 'All') q.set('status', statusFilter);
      if (searchTerm) q.set('search', searchTerm);

      const res = await fetch(`/api/requests?${q.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewRequest({
          title: '',
          description: '',
          skillName: 'Data Structures & Algorithms',
          urgency: 'MEDIUM',
          availability: '',
        });
        fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to post request');
      }
    } catch {
      alert('Error creating request');
    }
  };

  const urgencies = ['All', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ PEER ASSISTANCE FEED ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              STUDENT HELP & SKILL INQUIRIES
            </h1>
            <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
              Stuck on a complex algorithm, concurrency bug, or systems assignment? Ask your fellow university students. Helpers earn verified Karma.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 border border-accentLime bg-accentLime px-4 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>[ CREATE HELP REQUEST ]</span>
          </button>
        </div>

        {/* Filters */}
        <div className="border border-borderSubtle bg-surface p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search help inquiries by topic or keywords..."
              className="w-full border border-borderSubtle bg-surfaceElevated pl-9 pr-3 py-2 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 font-mono text-xs">
              <span className="text-textMuted mr-1">[ URGENCY ]:</span>
              {urgencies.map((u) => (
                <button
                  key={u}
                  onClick={() => setUrgencyFilter(u)}
                  className={`px-2 py-1 ${
                    urgencyFilter === u
                      ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                      : 'text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  [ {u} ]
                </button>
              ))}
            </div>

            <div className="flex items-center border border-borderSubtle bg-surfaceElevated p-0.5 font-mono text-xs">
              {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 uppercase ${
                    statusFilter === st
                      ? 'bg-surface text-accentLime font-bold border border-borderLight'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests Feed */}
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-accentLime">
            [ LOADING HELP INQUIRIES... ]
          </div>
        ) : requests.length === 0 ? (
          <div className="border border-dashed border-borderLight bg-surface p-12 text-center space-y-4 font-mono text-xs text-textMuted">
            No inquiries matched your criteria. You can create a new help request above.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const isUrgent = req.urgency === 'URGENT' || req.urgency === 'HIGH';
              return (
                <div
                  key={req.id}
                  className="border border-borderSubtle bg-surface p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-borderLight transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold ${
                          isUrgent
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-accentLime/20 text-accentLime border border-accentLime/40'
                        }`}
                      >
                        [ {req.urgency} URGENCY ]
                      </span>
                      <span className="border border-borderLight px-2 py-0.5 font-mono text-[10px] text-textMuted">
                        Topic: {req.skillName}
                      </span>
                      <span className="font-mono text-xs text-textMuted">
                        Status: [{req.status}]
                      </span>
                    </div>

                    <h3 className="font-sans text-base sm:text-lg font-bold text-textPrimary">
                      {req.title}
                    </h3>
                    <p className="text-xs text-textSecondary max-w-3xl leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs text-textMuted">
                      <span>
                        Author: {req.author?.profile?.fullName} ({req.author?.college?.name})
                      </span>
                      {req.availability && (
                        <span>· Availability: {req.availability}</span>
                      )}
                      <span>· {req.responses?.length || 0} Peer Offers</span>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <Link
                      href={`/requests/${req.id}`}
                      className="border border-accentLime bg-accentLime/10 px-4 py-2 font-mono text-xs font-bold text-accentLime hover:bg-accentLime hover:text-background transition-colors block text-center"
                    >
                      [ VIEW & RESPOND (+30 KARMA) ]
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Request Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg border border-borderLight bg-surfaceElevated p-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-borderSubtle pb-3 mb-4">
                <span className="font-mono text-xs text-accentLime">
                  [ NEW SKILL / HELP INQUIRY ]
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-textMuted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    INQUIRY TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="e.g. Need help debugging Red-Black tree deletion edge cases"
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-textMuted uppercase mb-1 font-bold">
                      DOMAIN / TOPIC
                    </label>
                    <input
                      type="text"
                      required
                      value={newRequest.skillName}
                      onChange={(e) => setNewRequest({ ...newRequest, skillName: e.target.value })}
                      placeholder="e.g. Java, Python, Figma"
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-textMuted uppercase mb-1 font-bold">
                      URGENCY LEVEL
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    YOUR AVAILABILITY (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={newRequest.availability}
                    onChange={(e) => setNewRequest({ ...newRequest, availability: e.target.value })}
                    placeholder="e.g. Today after 5 PM PST, or anytime tomorrow"
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    DESCRIPTION & ERROR DETAILS
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                    placeholder="Describe the issue, assignment problem set, or what you are trying to understand..."
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="border border-borderSubtle px-3 py-2 text-textMuted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="border border-accentLime bg-accentLime px-4 py-2 font-bold uppercase text-background hover:bg-accentLimeHover"
                  >
                    [ POST TO HELP FEED ]
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
