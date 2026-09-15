'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileScan,
  Upload,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Edit2,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { NoticeAnalysisResult, NoticeExtractedEvent } from '@/types';

export default function ScannerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<NoticeAnalysisResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  // Editable events state for review before confirmation
  const [editableEvents, setEditableEvents] = useState<NoticeExtractedEvent[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState<string | null>(null);

  const sampleNotices = [
    {
      title: 'Stanford CS Midterm & Project Schedule',
      content: `STANFORD UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE
AUTUMN 2026 ACADEMIC NOTICE

Attention CS 161 (Algorithms) & CS 110 (Principles of Computer Systems) Students:

1. MIDTERM EXAMINATION:
Course: CS 161 - Design & Analysis of Algorithms
Date: October 22, 2026
Time: 14:00 - 16:00 PST
Location: Hewlett Teaching Center, Auditorium 200
Format: Closed-book. One double-sided 8.5x11 inch handwritten formula sheet permitted. Calculators prohibited.

2. RAFT CONSENSUS MILESTONE 2:
Course: CS 244B - Distributed Systems
Submission Deadline: October 28, 2026 at 23:59 PST via Gradescope.
Requirement: Leader election tests and log replication RPC tests must pass with 100% automated test harness parity.

3. ANNUAL TREEHACKS 2026 TEAM REGISTRATION:
Date: November 05, 2026
Location: Huang Engineering Center
All engineering semesters eligible.`,
    },
    {
      title: 'MIT EECS Laboratory Timetable & Lab Checkoff',
      content: `MASSACHUSETTS INSTITUTE OF TECHNOLOGY
EECS DEPARTMENT - FALL TERM 2026

LAB CHECKOFF NOTICE FOR SEMESTERS 3, 5, 7:
Event: 6.004 Computation Structures Lab 3 Checkoff
Date: October 25, 2026
Time: 10:00 AM - 13:00 EST
Location: Stata Center (Building 32) Room 080
Required Materials: Bring programmed FPGA board and student MIT ID card.
Pre-lab writeups must be submitted 24 hours prior to slot.`,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !textInput.trim()) {
      alert('Please select a document file or paste notice text.');
      return;
    }

    setIsAnalyzing(true);
    setConfirmedSuccess(null);
    setAnalysisResult(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (textInput.trim()) {
      formData.append('text', textInput.trim());
    }

    try {
      const res = await fetch('/api/ai/scan-notice', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysisResult(data.extraction);
        setEditableEvents(data.extraction.events || []);
        setUploadedFileName(data.fileName);
        setUploadedFileUrl(data.fileUrl || '');
      } else {
        alert(data.error || 'Failed to analyze notice');
      }
    } catch {
      alert('Error during document analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEventChange = (index: number, field: keyof NoticeExtractedEvent, value: any) => {
    setEditableEvents((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteEvent = (index: number) => {
    setEditableEvents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddEvent = () => {
    const today = new Date().toISOString().split('T')[0];
    setEditableEvents((prev) => [
      ...prev,
      {
        title: 'New Academic Event',
        date: today,
        time: '12:00 PM',
        location: 'Campus Hall',
        category: 'Event',
        description: 'Extracted academic requirement.',
        relevanceScore: 0.9,
        relevanceReason: 'User verified addition.',
        relevantCourses: [],
        relevantSemesters: [],
      },
    ]);
  };

  const handleConfirmAndSave = async () => {
    if (editableEvents.length === 0) {
      alert('Please confirm at least one event to add to your timeline.');
      return;
    }

    setIsConfirming(true);
    try {
      const res = await fetch('/api/ai/confirm-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadedFileName || 'Campus Notice',
          fileName: uploadedFileName,
          fileUrl: uploadedFileUrl,
          rawText: textInput,
          docType: analysisResult?.docType || 'GeneralNotice',
          summary: analysisResult?.summary || '',
          events: editableEvents,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setConfirmedSuccess(data.message);
      } else {
        alert(data.error || 'Failed to save events');
      }
    } catch {
      alert('Error saving confirmed events');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
                [ AI INTELLIGENCE MODULE ]
              </span>
              <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
                CAMPUS NOTICE & TIMETABLE SCANNER
              </h1>
              <p className="mt-1 font-mono text-xs text-textSecondary max-w-2xl">
                Upload university PDF notices, exam sheets, or academic calendars. AI extracts dates, venues, deadlines, and courses, and gives you a chance to review/edit before adding directly to your personal timeline.
              </p>
            </div>
            <div className="border border-accentLime/40 bg-accentLime/10 px-3 py-2 font-mono text-xs text-accentLime flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>+15 KARMA ON VERIFIED SCAN</span>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {confirmedSuccess && (
          <div className="border border-accentLime bg-accentLime/15 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-accentLime shrink-0" />
              <div>
                <h3 className="font-sans text-sm font-bold uppercase text-textPrimary">
                  TIMELINE UPDATED SUCCESSFULLY
                </h3>
                <p className="font-mono text-xs text-accentLime">{confirmedSuccess}</p>
              </div>
            </div>
            <Link
              href="/timeline"
              className="border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors"
            >
              [ VIEW TIMELINE ]
            </Link>
          </div>
        )}

        {/* Upload & Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-borderLight bg-surface p-8 text-center flex flex-col items-center justify-center min-h-[260px] hover:border-accentLime/60 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="h-12 w-12 rounded-full border border-borderSubtle bg-surfaceElevated flex items-center justify-center text-accentLime mb-4">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">
              {file ? file.name : 'DRAG & DROP NOTICE / PDF / IMAGE'}
            </h3>
            <p className="mt-1 font-mono text-xs text-textMuted max-w-xs">
              Supports PDF, PNG, JPEG timetables, exam notices, and calendars up to 15MB.
            </p>
            {file && (
              <span className="mt-3 border border-accentLime/40 bg-accentLime/10 px-2.5 py-1 font-mono text-[11px] text-accentLime">
                [ READY FOR AI EXTRACTION ]
              </span>
            )}
          </div>

          {/* Text Paste / Sample Notices Area */}
          <div className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-mono text-xs uppercase text-textSecondary">
                  OR PASTE NOTICE TEXT DIRECTLY
                </label>
                <span className="font-mono text-[10px] text-textMuted">TEXT ANALYZER</span>
              </div>
              <textarea
                rows={6}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste notice announcement, exam timings, classroom schedule..."
                className="w-full border border-borderSubtle bg-surfaceElevated p-3 font-mono text-xs text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
              />
            </div>

            {/* Quick Sample Notice Loaders */}
            <div className="mt-4 pt-3 border-t border-borderSubtle">
              <p className="font-mono text-[11px] text-textMuted uppercase mb-2">
                [ QUICK TEST SAMPLES ]
              </p>
              <div className="flex flex-wrap gap-2">
                {sampleNotices.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTextInput(s.content);
                      setFile(null);
                    }}
                    className="border border-borderLight bg-surfaceElevated px-2.5 py-1 font-mono text-[11px] text-textSecondary hover:text-accentLime hover:border-accentLime transition-colors"
                  >
                    Load: {s.title.split(' ')[0]} {s.title.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scan Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || (!file && !textInput.trim())}
            className="flex items-center gap-2 border border-accentLime bg-accentLime px-6 py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAnalyzing ? '[ AI EXTRACTING INFORMATION... ]' : '[ RUN AI NOTICE SCANNER ]'}</span>
          </button>
        </div>

        {/* Extraction Review & Confirmation Modal / Card */}
        {analysisResult && (
          <div className="border border-borderLight bg-surface p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderSubtle pb-4">
              <div>
                <span className="font-mono text-xs uppercase text-accentLime font-bold">
                  [ STEP 2: REVIEW & EDIT EXTRACTED EVENTS ]
                </span>
                <h2 className="font-sans text-xl font-black uppercase text-textPrimary">
                  CONFIRM DETAILS BEFORE PERSISTING
                </h2>
                <p className="font-mono text-xs text-textMuted mt-1">
                  AI detected {analysisResult.docType} with {(analysisResult.confidence * 100).toFixed(0)}% confidence.
                  Overall Relevance: {(analysisResult.overallRelevance * 100).toFixed(0)}%.
                </p>
              </div>
              <button
                onClick={handleAddEvent}
                className="flex items-center gap-1.5 border border-borderLight bg-surfaceElevated px-3 py-1.5 font-mono text-xs text-textPrimary hover:border-accentLime"
              >
                <Plus className="h-3.5 w-3.5 text-accentLime" />
                <span>[ ADD CUSTOM EVENT ]</span>
              </button>
            </div>

            {/* Document Summary */}
            <div className="border border-borderSubtle bg-surfaceElevated p-4 font-mono text-xs">
              <span className="text-accentLime uppercase font-bold">[ AI EXECUTIVE SUMMARY ]: </span>
              <span className="text-textSecondary">{analysisResult.summary}</span>
            </div>

            {/* Editable Events Table/Cards */}
            <div className="space-y-4">
              {editableEvents.map((ev, index) => (
                <div
                  key={index}
                  className="border border-borderLight bg-surfaceElevated p-4 sm:p-5 space-y-4 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-accentLime">
                      EVENT #{index + 1} · RELEVANCE: {(ev.relevanceScore * 100).toFixed(0)}%
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(index)}
                      className="text-textMuted hover:text-red-400 p-1"
                      title="Remove event"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-textMuted uppercase mb-1">EVENT TITLE</label>
                      <input
                        type="text"
                        value={ev.title}
                        onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-textMuted uppercase mb-1">CATEGORY</label>
                      <select
                        value={ev.category}
                        onChange={(e) => handleEventChange(index, 'category', e.target.value)}
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      >
                        {['Exam', 'Class', 'Deadline', 'Workshop', 'Notice', 'Event'].map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-textMuted uppercase mb-1">DATE (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        value={ev.date}
                        onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-textMuted uppercase mb-1">TIME</label>
                      <input
                        type="text"
                        value={ev.time || ''}
                        onChange={(e) => handleEventChange(index, 'time', e.target.value)}
                        placeholder="e.g. 14:00 - 16:00"
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-textMuted uppercase mb-1">LOCATION / VENUE</label>
                      <input
                        type="text"
                        value={ev.location || ''}
                        onChange={(e) => handleEventChange(index, 'location', e.target.value)}
                        placeholder="e.g. Hewlett Room 200"
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-3">
                      <label className="block text-textMuted uppercase mb-1">DESCRIPTION & PREPARATION</label>
                      <input
                        type="text"
                        value={ev.description}
                        onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                        className="w-full border border-borderSubtle bg-surface px-3 py-2 text-textPrimary focus:border-accentLime focus:outline-none"
                      />
                    </div>
                  </div>

                  {ev.relevanceReason && (
                    <p className="font-mono text-[11px] text-textMuted">
                      <span className="text-accentLime">Collegiate Context: </span>
                      {ev.relevanceReason}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Confirm & Save Button */}
            <div className="pt-4 border-t border-borderSubtle flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="font-mono text-xs text-textMuted">
                Review complete? Confirmed events will populate your master schedule immediately.
              </p>
              <button
                onClick={handleConfirmAndSave}
                disabled={isConfirming || editableEvents.length === 0}
                className="w-full sm:w-auto border border-accentLime bg-accentLime px-6 py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime disabled:opacity-50"
              >
                {isConfirming
                  ? '[ CONFIRMING & ADDING TO TIMELINE... ]'
                  : `[ CONFIRM ${editableEvents.length} EVENTS & EARN +15 KARMA ]`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
