'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    skillName: 'Data Structures & Algorithms',
    resourceType: 'PDF',
    visibility: 'PUBLIC',
    price: 0,
    linkUrl: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchResources();
  }, [searchTerm, skillFilter, typeFilter]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const q = new URLSearchParams();
      if (searchTerm) q.set('search', searchTerm);
      if (skillFilter !== 'All') q.set('skill', skillFilter);
      if (typeFilter !== 'All') q.set('type', typeFilter);

      const res = await fetch(`/api/resources?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setResources(json.resources || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('skillName', uploadData.skillName);
    formData.append('resourceType', uploadData.resourceType);
    formData.append('visibility', uploadData.visibility);
    formData.append('price', uploadData.price.toString());
    if (uploadFile) formData.append('file', uploadFile);
    if (uploadData.linkUrl) formData.append('linkUrl', uploadData.linkUrl);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setIsUploadOpen(false);
        setActionMessage(data.message || 'Resource uploaded successfully (+25 Karma)!');
        fetchResources();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Error uploading resource');
    } finally {
      setIsUploading(false);
    }
  };

  const resourceTypes = ['All', 'Notes', 'PDF', 'Code', 'Cheatsheet', 'Link'];

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ ACADEMIC KNOWLEDGE COMMONS ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              STUDY RESOURCES & NOTES REPOSITORY
            </h1>
            <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
              Access peer-verified lecture notes, curated LaTeX cheatsheets, Jupyter walkthroughs, and code repositories shared by students across universities.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 border border-accentLime bg-accentLime px-4 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>[ SHARE RESOURCE (+25 KARMA) ]</span>
          </button>
        </div>

        {actionMessage && (
          <div className="border border-accentLime bg-accentLime/10 p-3 font-mono text-xs text-accentLime flex justify-between items-center">
            <span>[ {actionMessage} ]</span>
            <button onClick={() => setActionMessage('')} className="text-textMuted hover:text-white">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="border border-borderSubtle bg-surface p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources, topics, authors..."
              className="w-full border border-borderSubtle bg-surfaceElevated pl-9 pr-3 py-2 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-textMuted mr-1">[ FORMAT ]:</span>
            {resourceTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 ${
                  typeFilter === t
                    ? 'border border-accentLime bg-accentLime/10 text-accentLime font-bold'
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
              >
                [ {t.toUpperCase()} ]
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs text-accentLime">
            [ QUERYING KNOWLEDGE COMMONS... ]
          </div>
        ) : resources.length === 0 ? (
          <div className="border border-dashed border-borderLight bg-surface p-12 text-center space-y-4 font-mono text-xs text-textMuted">
            No study materials matched your filters. Be the first to share your notes!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-borderLight transition-all"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="border border-accentLime/40 bg-accentLime/10 px-2 py-0.5 font-mono text-[10px] text-accentLime font-bold">
                      [ {res.resourceType.toUpperCase()} ]
                    </span>
                    <span className="font-mono text-[11px] text-textMuted">
                      {res.price === 0 ? 'FREE' : `$${res.price.toFixed(2)}`}
                    </span>
                  </div>

                  <div>
                    <span className="font-mono text-xs text-accentLime block mb-1">
                      {res.skillName}
                    </span>
                    <h3 className="font-sans text-base font-bold text-textPrimary leading-snug">
                      {res.title}
                    </h3>
                    <p className="mt-2 text-xs text-textSecondary line-clamp-3 leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-borderSubtle flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-accentLime/20 text-accentLime flex items-center justify-center font-bold text-[10px]">
                      {res.author?.profile?.fullName?.charAt(0) || 'A'}
                    </div>
                    <span className="text-textMuted text-[11px] truncate max-w-[120px]">
                      {res.author?.profile?.fullName}
                    </span>
                  </div>

                  <a
                    href={res.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-borderLight bg-surfaceElevated px-3 py-1.5 text-accentLime hover:border-accentLime flex items-center gap-1.5"
                  >
                    <span>[ ACCESS ]</span>
                    <Download className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg border border-borderLight bg-surfaceElevated p-6 shadow-2xl">
              <div className="flex justify-between items-center border-b border-borderSubtle pb-3 mb-4">
                <span className="font-mono text-xs text-accentLime">
                  [ SHARE STUDY RESOURCE ]
                </span>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="text-textMuted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    RESOURCE TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. CS161 Complete Dynamic Programming Cheatsheet"
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-textMuted uppercase mb-1 font-bold">
                      SKILL / TOPIC
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadData.skillName}
                      onChange={(e) => setUploadData({ ...uploadData, skillName: e.target.value })}
                      placeholder="e.g. Java, Python, DSA"
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-textMuted uppercase mb-1 font-bold">
                      RESOURCE TYPE
                    </label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) => setUploadData({ ...uploadData, resourceType: e.target.value })}
                      className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                    >
                      {['Notes', 'PDF', 'Code', 'Cheatsheet', 'Link'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    UPLOAD FILE (PDF, ZIP, CODE)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textMuted focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    OR EXTERNAL LINK (GITHUB / DRIVE)
                  </label>
                  <input
                    type="url"
                    value={uploadData.linkUrl}
                    onChange={(e) => setUploadData({ ...uploadData, linkUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-textMuted uppercase mb-1 font-bold">
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Describe the topics covered, problem sets, and key insights..."
                    className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="border border-borderSubtle px-3 py-2 text-textMuted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || (!uploadFile && !uploadData.linkUrl)}
                    className="border border-accentLime bg-accentLime px-4 py-2 font-bold uppercase text-background hover:bg-accentLimeHover disabled:opacity-50"
                  >
                    {isUploading ? '[ UPLOADING... ]' : '[ PUBLISH RESOURCE (+25 KARMA) ]'}
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
