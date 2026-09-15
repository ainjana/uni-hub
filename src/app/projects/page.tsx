'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2,
  Users,
  Plus,
  Search,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ArrowRight,
  X,
  Send,
} from 'lucide-react';

interface ProjectRole {
  id: string;
  roleName: string;
  skillsRequired: string;
  openSeats: number;
  filledSeats: number;
  applications?: any[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  teamSize: number;
  status: string;
  deadline: string | null;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      avatarUrl?: string;
    } | null;
    college: {
      name: string;
    };
  };
  roles: ProjectRole[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [applyRole, setApplyRole] = useState<{ project: Project; role: ProjectRole } | null>(null);
  const [pitch, setPitch] = useState('');
  const [applyStatus, setApplyStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [applyMessage, setApplyMessage] = useState('');

  // Form states for new project
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTeamSize, setNewTeamSize] = useState('3');
  const [newDeadline, setNewDeadline] = useState('');
  const [newRoles, setNewRoles] = useState<{ roleName: string; skillsRequired: string; openSeats: number }[]>([
    { roleName: 'Frontend Engineer', skillsRequired: 'React, TypeScript, Tailwind', openSeats: 1 },
  ]);
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyRole) return;

    setApplyStatus('loading');
    try {
      const res = await fetch(`/api/projects/${applyRole.project.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId: applyRole.role.id,
          pitch,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyStatus('success');
        setApplyMessage('Application submitted successfully to project lead!');
        setTimeout(() => {
          setApplyRole(null);
          setApplyStatus('idle');
          setPitch('');
          fetchProjects();
        }, 1800);
      } else {
        setApplyStatus('error');
        setApplyMessage(data.error || 'Failed to submit application.');
      }
    } catch {
      setApplyStatus('error');
      setApplyMessage('Network error occurred while applying.');
    }
  };

  const handleAddRoleRow = () => {
    setNewRoles([...newRoles, { roleName: '', skillsRequired: '', openSeats: 1 }]);
  };

  const handleRemoveRoleRow = (index: number) => {
    if (newRoles.length > 1) {
      setNewRoles(newRoles.filter((_, i) => i !== index));
    }
  };

  const handleRoleChange = (index: number, field: string, val: any) => {
    const updated = [...newRoles];
    updated[index] = { ...updated[index], [field]: val };
    setNewRoles(updated);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          teamSize: newTeamSize,
          deadline: newDeadline || null,
          roles: newRoles,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsCreateOpen(false);
        setNewTitle('');
        setNewDescription('');
        setNewDeadline('');
        setNewRoles([{ roleName: 'Frontend Engineer', skillsRequired: 'React, TypeScript, Tailwind', openSeats: 1 }]);
        fetchProjects();
      } else {
        setCreateError(data.error || 'Failed to publish project.');
      }
    } catch {
      setCreateError('Network error occurred while creating project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.roles.some((r) =>
        r.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.skillsRequired.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ CAMPUS VENTURES & COLLABORATIVE LABS ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              PROJECTS & TEAM FINDER
            </h1>
            <p className="mt-1 text-xs text-textSecondary font-mono max-w-2xl">
              Recruit co-founders, research partners, and course capstone teams across verified academic colleges.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 border border-accentLime bg-accentLime px-5 py-3 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors shadow-glow-lime whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>[ POST A PROJECT ]</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by title, stack, or role requirements..."
              className="w-full border border-borderSubtle bg-surface pl-10 pr-4 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['ALL', 'RECRUITING', 'IN_PROGRESS'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`border px-3.5 py-2 font-mono text-xs whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'border-accentLime bg-accentLime/10 text-accentLime font-bold'
                    : 'border-borderSubtle bg-surface text-textSecondary hover:border-borderLight hover:text-textPrimary'
                }`}
              >
                [{status.replace('_', ' ')}]
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-xs text-accentLime">[ RETRIEVING CAMPUS COLLABORATIONS... ]</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="border border-borderSubtle bg-surface p-12 text-center">
            <FolderGit2 className="mx-auto h-12 w-12 text-textMuted mb-3" />
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">NO PROJECTS FOUND</h3>
            <p className="mt-1 text-xs text-textSecondary font-mono">
              Be the first to launch a team collaboration or adjust your search filters.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 inline-flex items-center gap-2 border border-accentLime bg-accentLime/10 px-4 py-2 font-mono text-xs font-bold text-accentLime hover:bg-accentLime/20"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>[ CREATE FIRST PROJECT ]</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/40 transition-colors"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-borderSubtle pb-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-accentLime bg-accentLime/10 px-2 py-0.5 border border-accentLime/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-accentLime" />
                      [{project.status}]
                    </span>
                    <span className="font-mono text-[11px] text-textMuted">
                      TEAM SIZE: {project.teamSize} STUDENTS
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-sans text-xl font-bold uppercase text-textPrimary mb-2">
                    {project.title}
                  </h2>
                  <p className="text-xs text-textSecondary font-mono leading-relaxed mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Open Roles Section */}
                  <div className="space-y-3 mb-6">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-textMuted block">
                      OPEN RECRUITMENT POSITIONS ({project.roles.length})
                    </span>
                    <div className="space-y-2">
                      {project.roles.map((role) => (
                        <div
                          key={role.id}
                          className="border border-borderSubtle/80 bg-surfaceElevated p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs font-bold text-textPrimary">
                                {role.roleName}
                              </span>
                              <span className="font-mono text-[10px] text-accentLime border border-accentLime/30 px-1.5 py-0.2">
                                {role.openSeats - role.filledSeats} SEATS LEFT
                              </span>
                            </div>
                            <span className="font-mono text-[10px] text-textMuted block mt-0.5">
                              Stack: {role.skillsRequired}
                            </span>
                          </div>

                          <button
                            onClick={() => setApplyRole({ project, role })}
                            className="border border-borderLight bg-surface px-3 py-1.5 font-mono text-[11px] text-accentLime hover:border-accentLime hover:bg-accentLime/10 transition-colors whitespace-nowrap self-start sm:self-auto"
                          >
                            [ APPLY ROLE ]
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Creator & Info */}
                <div className="border-t border-borderSubtle pt-4 mt-auto flex items-center justify-between text-xs font-mono text-textSecondary">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center bg-surfaceElevated text-accentLime font-bold text-[10px]">
                      {project.creator.profile?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="text-textPrimary font-semibold block text-[11px]">
                        {project.creator.profile?.fullName || 'Student Lead'}
                      </span>
                      <span className="text-[10px] text-textMuted">
                        {project.creator.college.name}
                      </span>
                    </div>
                  </div>

                  {project.deadline && (
                    <div className="flex items-center gap-1.5 text-textMuted text-[10px]">
                      <Calendar className="h-3 w-3" />
                      <span>DUE: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Apply Modal */}
        {applyRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-borderSubtle pb-4">
                <div>
                  <span className="font-mono text-[10px] text-accentLime block uppercase">
                    [ APPLICATION SUBMISSION ]
                  </span>
                  <h3 className="font-sans text-xl font-bold uppercase text-textPrimary">
                    {applyRole.role.roleName}
                  </h3>
                  <span className="font-mono text-xs text-textMuted">
                    Project: {applyRole.project.title}
                  </span>
                </div>
                <button
                  onClick={() => setApplyRole(null)}
                  className="text-textMuted hover:text-textPrimary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {applyStatus === 'success' ? (
                <div className="py-6 text-center space-y-3">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-accentLime" />
                  <p className="font-mono text-xs text-accentLime">{applyMessage}</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  {applyStatus === 'error' && (
                    <div className="border border-red-500/50 bg-red-500/10 p-3 flex items-center gap-2 text-xs font-mono text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{applyMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-mono text-xs text-textSecondary uppercase mb-1.5">
                      Why are you a fit for this role? (Pitch / Portfolio Links)
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Mention your relevant experience, GitHub repo links, or past course projects..."
                      className="w-full border border-borderSubtle bg-surfaceElevated p-3 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setApplyRole(null)}
                      className="border border-borderSubtle px-4 py-2 font-mono text-xs text-textSecondary hover:text-textPrimary"
                    >
                      [ CANCEL ]
                    </button>
                    <button
                      type="submit"
                      disabled={applyStatus === 'loading'}
                      className="flex items-center gap-2 border border-accentLime bg-accentLime px-5 py-2 font-mono text-xs font-bold text-background hover:bg-accentLimeHover disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{applyStatus === 'loading' ? '[ SUBMITTING... ]' : '[ SEND APPLICATION ]'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Create Project Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-borderSubtle pb-4">
                <div>
                  <span className="font-mono text-xs text-accentLime uppercase">
                    [ NEW LAB VENTURE ]
                  </span>
                  <h3 className="font-sans text-xl font-bold uppercase text-textPrimary">
                    POST COLLABORATIVE PROJECT
                  </h3>
                </div>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="text-textMuted hover:text-textPrimary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {createError && (
                <div className="border border-red-500/50 bg-red-500/10 p-3 text-xs font-mono text-red-400">
                  {createError}
                </div>
              )}

              <form onSubmit={handleCreateProject} className="space-y-5">
                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Autonomous Drone Navigation / MedTech Diagnosis App"
                    className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                    Description & Objectives *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What problem does this project solve? What is the scope and expected timeline?"
                    className="w-full border border-borderSubtle bg-surfaceElevated p-3 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                      Target Team Size
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={newTeamSize}
                      onChange={(e) => setNewTeamSize(e.target.value)}
                      className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-textSecondary uppercase mb-1">
                      Project Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full border border-borderSubtle bg-surfaceElevated px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                    />
                  </div>
                </div>

                {/* Roles Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs text-accentLime uppercase font-bold">
                      [ RECRUITING ROLES & SEATS ]
                    </label>
                    <button
                      type="button"
                      onClick={handleAddRoleRow}
                      className="font-mono text-[11px] text-accentLime hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> + ADD ROLE
                    </button>
                  </div>

                  {newRoles.map((role, idx) => (
                    <div
                      key={idx}
                      className="border border-borderSubtle/70 bg-surfaceElevated p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
                    >
                      <div className="sm:col-span-5">
                        <label className="block font-mono text-[10px] text-textMuted uppercase mb-0.5">
                          Role Title
                        </label>
                        <input
                          type="text"
                          required
                          value={role.roleName}
                          onChange={(e) => handleRoleChange(idx, 'roleName', e.target.value)}
                          placeholder="e.g. Backend Engineer"
                          className="w-full border border-borderSubtle bg-surface px-2.5 py-1.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-5">
                        <label className="block font-mono text-[10px] text-textMuted uppercase mb-0.5">
                          Required Tech / Skills
                        </label>
                        <input
                          type="text"
                          required
                          value={role.skillsRequired}
                          onChange={(e) => handleRoleChange(idx, 'skillsRequired', e.target.value)}
                          placeholder="e.g. Node.js, PostgreSQL"
                          className="w-full border border-borderSubtle bg-surface px-2.5 py-1.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block font-mono text-[10px] text-textMuted uppercase mb-0.5">
                          Seats
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={role.openSeats}
                          onChange={(e) => handleRoleChange(idx, 'openSeats', parseInt(e.target.value, 10))}
                          className="w-full border border-borderSubtle bg-surface px-2 py-1.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveRoleRow(idx)}
                          disabled={newRoles.length === 1}
                          className="p-1.5 text-textMuted hover:text-red-400 disabled:opacity-30"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-borderSubtle">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="border border-borderSubtle px-4 py-2.5 font-mono text-xs text-textSecondary hover:text-textPrimary"
                  >
                    [ CANCEL ]
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="border border-accentLime bg-accentLime px-6 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover disabled:opacity-50"
                  >
                    {isSubmitting ? '[ PUBLISHING... ]' : '[ PUBLISH PROJECT ]'}
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
