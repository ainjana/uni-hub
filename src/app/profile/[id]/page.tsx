'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Star,
  Users,
  BookOpen,
  Calendar,
  MessageSquare,
  UserPlus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  Sparkles,
  Save,
  X,
  Plus,
} from 'lucide-react';

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'classes' | 'resources' | 'reviews'>('classes');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editSemester, setEditSemester] = useState<number>(1);
  const [editSkills, setEditSkills] = useState<{ name: string; proficiency: string; isTeaching: boolean }[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Connect request state
  const [connectStatus, setConnectStatus] = useState<'idle' | 'sent'>('idle');

  useEffect(() => {
    fetchProfile();
    fetchCurrentUser();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/profile/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStudent(data.student);
        if (data.student?.profile) {
          setEditBio(data.student.profile.bio || '');
          setEditCourse(data.student.profile.course || '');
          setEditSemester(data.student.profile.semester || 1);
          setEditSkills(
            data.student.profile.skills?.map((s: any) => ({
              name: s.skill?.name || '',
              proficiency: s.proficiency || 'INTERMEDIATE',
              isTeaching: !!s.isTeaching,
            })) || []
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await fetch(`/api/profile/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: editBio,
          course: editCourse,
          semester: editSemester,
          skills: editSkills,
        }),
      });

      if (res.ok) {
        setSaveMessage('Profile credentials updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        setSaveMessage('Failed to update profile.');
      }
    } catch {
      setSaveMessage('Network error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setEditSkills([
      ...editSkills,
      { name: newSkillName.trim(), proficiency: 'INTERMEDIATE', isTeaching: true },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillIndex: number) => {
    setEditSkills(editSkills.filter((_, i) => i !== skillIndex));
  };

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: params.id }),
      });
      if (res.ok) {
        setConnectStatus('sent');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-[#0A0C0E]">
        <div className="h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin mb-3" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-[#0A0C0E] py-16 px-4 text-center">
        <h2 className="font-sans text-2xl font-bold uppercase text-textPrimary">STUDENT NOT FOUND</h2>
        <p className="mt-2 text-xs font-mono text-textSecondary">
          The requested collegiate profile does not exist or has been removed.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block border border-accentLime bg-accentLime px-5 py-2.5 font-mono text-xs font-bold uppercase text-background"
        >
          [ BACK TO DASHBOARD ]
        </Link>
      </div>
    );
  }

  const isOwner = currentUserId === student.id;
  const p = student.profile;

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Profile Identity Card */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              {/* Monogram Avatar */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-accentLime bg-surfaceElevated text-accentLime font-mono text-3xl font-black">
                {p?.fullName?.charAt(0) || 'U'}
              </div>

              {/* Student Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-sans text-2xl sm:text-3xl font-black uppercase text-textPrimary">
                    {p?.fullName || 'Student'}
                  </h1>

                  {student.isVerified && (
                    <span className="inline-flex items-center gap-1 border border-accentLime/60 bg-accentLime/10 px-2 py-0.5 font-mono text-[11px] text-accentLime">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      VERIFIED .EDU
                    </span>
                  )}

                  <span className="border border-borderSubtle bg-surfaceElevated px-2 py-0.5 font-mono text-[11px] text-textSecondary">
                    [{student.college?.name || 'University'}]
                  </span>
                </div>

                <p className="font-mono text-xs text-textSecondary">
                  {p?.course || 'Undergraduate'} · SEMESTER {p?.semester || 1}
                </p>

                <p className="text-xs font-mono text-textPrimary max-w-2xl leading-relaxed">
                  {p?.bio || 'Collegiate scholar participating in peer academic exchanges.'}
                </p>
              </div>
            </div>

            {/* Reputation Metric Chips & Action */}
            <div className="flex flex-wrap md:flex-col items-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="border border-borderSubtle bg-surfaceElevated px-3 py-2 text-right">
                  <span className="block font-mono text-[9px] text-textMuted uppercase">TOTAL KARMA</span>
                  <div className="flex items-center gap-1 font-mono text-base font-bold text-accentLime">
                    <Zap className="h-4 w-4 fill-accentLime text-accentLime" />
                    <span>{p?.totalKarma || 0}</span>
                  </div>
                </div>

                <div className="border border-borderSubtle bg-surfaceElevated px-3 py-2 text-right">
                  <span className="block font-mono text-[9px] text-textMuted uppercase">PEER RATING</span>
                  <div className="flex items-center gap-1 font-mono text-base font-bold text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span>{p?.rating ? p.rating.toFixed(1) : '5.0'}</span>
                  </div>
                </div>
              </div>

              {isOwner ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isEditing ? '[ CLOSE EDITING ]' : '[ EDIT PORTFOLIO ]'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleConnect}
                    disabled={connectStatus === 'sent'}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-borderLight bg-surfaceElevated px-4 py-2 font-mono text-xs font-bold text-accentLime hover:border-accentLime disabled:opacity-50"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{connectStatus === 'sent' ? '[ REQUESTED ]' : '[ CONNECT ]'}</span>
                  </button>

                  <Link
                    href="/chat"
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 border border-accentLime bg-accentLime px-4 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>[ MESSAGE ]</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inline Edit Form for Profile Owner */}
        {isEditing && (
          <div className="border border-accentLime/50 bg-surface p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-borderSubtle pb-4">
              <span className="font-mono text-xs text-accentLime uppercase font-bold flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                [ EDITING STUDENT CREDENTIALS ]
              </span>
              <span className="font-mono text-xs text-textMuted">CHANGES PERSIST TO VERIFIED LEDGER</span>
            </div>

            {saveMessage && (
              <div className="border border-accentLime bg-accentLime/10 p-3 text-xs font-mono text-accentLime">
                {saveMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    Major / Course of Study
                  </label>
                  <input
                    type="text"
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    Current Semester (1 - 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editSemester}
                    onChange={(e) => setEditSemester(parseInt(e.target.value, 10))}
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                  Collegiate Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border border-borderSubtle bg-surfaceElevated p-3 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                />
              </div>

              {/* Skills Editor */}
              <div className="space-y-3 pt-2">
                <label className="block font-mono text-xs text-accentLime uppercase font-bold">
                  SKILLS & PEER TEACHING OFFERINGS
                </label>

                <div className="flex flex-wrap gap-2">
                  {editSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="border border-borderSubtle bg-surfaceElevated px-3 py-1.5 flex items-center gap-2 font-mono text-xs"
                    >
                      <span className="text-textPrimary font-semibold">{sk.name}</span>
                      <span className="text-[10px] text-accentLime">[{sk.proficiency}]</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-textMuted hover:text-red-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Add new skill (e.g. Distributed Systems, Rust, PyTorch)"
                    className="flex-1 border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="border border-borderLight bg-surface px-4 py-2 font-mono text-xs text-accentLime hover:border-accentLime"
                  >
                    + ADD
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-borderSubtle">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="border border-borderSubtle px-4 py-2 font-mono text-xs text-textSecondary hover:text-textPrimary"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border border-accentLime bg-accentLime px-6 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover disabled:opacity-50"
                >
                  {isSaving ? '[ SAVING... ]' : '[ SAVE PORTFOLIO ]'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Skills Matrix Pill Row */}
        <div className="border border-borderSubtle bg-surface p-6">
          <span className="font-mono text-xs uppercase text-textMuted tracking-wider block mb-4">
            VERIFIED SKILL PROFICIENCIES ({p?.skills?.length || 0})
          </span>
          <div className="flex flex-wrap gap-2.5">
            {p?.skills?.map((s: any, idx: number) => (
              <div
                key={idx}
                className="border border-borderSubtle bg-surfaceElevated px-3.5 py-1.5 flex items-center gap-2 font-mono text-xs hover:border-accentLime/40 transition-colors"
              >
                <span className="text-textPrimary font-semibold">{s.skill.name}</span>
                <span className="text-[10px] text-accentLime">[{s.proficiency}]</span>
                {s.isTeaching && (
                  <span className="border border-accentLime/40 bg-accentLime/10 px-1 py-0.2 text-[9px] text-accentLime font-bold">
                    TEACHING
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Tabs: Classes, Resources, Reviews */}
        <div className="space-y-6">
          <div className="flex border-b border-borderSubtle">
            {[
              { key: 'classes', label: `CLASSES TAUGHT (${student.taughtClasses?.length || 0})` },
              { key: 'resources', label: `SHARED RESOURCES (${student.resources?.length || 0})` },
              { key: 'reviews', label: `PEER REVIEWS (${student.receivedReviews?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-mono text-xs font-bold uppercase transition-colors relative ${
                  activeTab === tab.key
                    ? 'text-accentLime border-b-2 border-accentLime bg-surface'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                [{tab.label}]
              </button>
            ))}
          </div>

          {/* TAB 1: CLASSES TAUGHT */}
          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.taughtClasses?.length === 0 ? (
                <div className="col-span-2 border border-borderSubtle bg-surface p-8 text-center text-xs font-mono text-textMuted">
                  No classes hosted by this student yet.
                </div>
              ) : (
                student.taughtClasses.map((cls: any) => (
                  <div
                    key={cls.id}
                    className="border border-borderSubtle bg-surface p-5 space-y-3 hover:border-accentLime/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-accentLime border border-accentLime/30 px-2 py-0.5">
                        [{cls.skill?.name || 'General'}]
                      </span>
                      <span className="text-textMuted">
                        {new Date(cls.dateTime).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-sans text-base font-bold uppercase text-textPrimary">
                      {cls.title}
                    </h3>
                    <p className="text-xs font-mono text-textSecondary line-clamp-2">
                      {cls.description}
                    </p>

                    <Link
                      href={`/classes/${cls.id}`}
                      className="inline-block font-mono text-xs text-accentLime hover:underline pt-2"
                    >
                      [ VIEW WORKSHOP SESSION ] →
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: RESOURCES */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {student.resources?.length === 0 ? (
                <div className="col-span-2 border border-borderSubtle bg-surface p-8 text-center text-xs font-mono text-textMuted">
                  No academic revision files or notes uploaded yet.
                </div>
              ) : (
                student.resources.map((res: any) => (
                  <div
                    key={res.id}
                    className="border border-borderSubtle bg-surface p-5 space-y-2 hover:border-accentLime/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-accentLime">[{res.category}]</span>
                      <span className="text-textMuted">▲ {res.upvotes} UPVOTES</span>
                    </div>
                    <h3 className="font-sans text-base font-bold uppercase text-textPrimary">
                      {res.title}
                    </h3>
                    <span className="font-mono text-[10px] text-textMuted block">
                      FORMAT: {res.fileType?.toUpperCase()} · SHARED ON{' '}
                      {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {student.receivedReviews?.length === 0 ? (
                <div className="border border-borderSubtle bg-surface p-8 text-center text-xs font-mono text-textMuted">
                  No peer tutoring reviews received yet.
                </div>
              ) : (
                student.receivedReviews.map((rev: any) => (
                  <div
                    key={rev.id}
                    className="border border-borderSubtle bg-surface p-5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-textPrimary">
                          {rev.reviewer?.profile?.fullName || 'Anonymous Peer'}
                        </span>
                        <span className="text-textMuted">for {rev.session?.title || 'Workshop'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-textSecondary italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <span className="font-mono text-[10px] text-textMuted block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
