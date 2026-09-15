'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Zap,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Award,
} from 'lucide-react';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [classData, setClassData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    fetchClass();
    fetchUser();
  }, [params.id]);

  const fetchClass = async () => {
    try {
      const res = await fetch(`/api/classes/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setClassData(json.classSession);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const json = await res.json();
        setCurrentUser(json.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsActing(true);
    try {
      const res = await fetch(`/api/classes/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice('Seat successfully reserved! Added to your schedule.');
        fetchClass();
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch {
      alert('Error registering');
    } finally {
      setIsActing(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Cancel your seat registration?')) return;
    setIsActing(true);
    try {
      const res = await fetch(`/api/classes/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice('Registration cancelled.');
        fetchClass();
      } else {
        alert(data.error || 'Cancellation failed');
      }
    } catch {
      alert('Error cancelling');
    } finally {
      setIsActing(false);
    }
  };

  const handleCompleteClass = async () => {
    if (!confirm('Mark class as completed? This will award +50 Karma to you and +20 Karma to all registered attendees.')) return;
    setIsActing(true);
    try {
      const res = await fetch(`/api/classes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message);
        fetchClass();
      } else {
        alert(data.error || 'Failed to complete class');
      }
    } catch {
      alert('Error completing class');
    } finally {
      setIsActing(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: classData.teacherId,
          sessionId: classData.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewSuccess('Review submitted! Contributed to student’s reputation.');
        setReviewComment('');
        fetchClass();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch {
      alert('Error submitting review');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-accentLime">
        [ RETRIEVING CLASS SPECIFICATIONS... ]
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="py-20 text-center font-mono text-xs text-textMuted">
        Class session not found.
      </div>
    );
  }

  const teacher = classData.teacher;
  const prof = teacher?.profile;
  const dateObj = new Date(classData.dateTime);
  const isHost = currentUser?.id === classData.teacherId;
  const myRegistration = classData.registrations.find(
    (r: any) => r.studentId === currentUser?.id && r.status === 'REGISTERED'
  );
  const isCompleted = classData.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Notice alert */}
        {actionNotice && (
          <div className="border border-accentLime bg-accentLime/10 p-3 font-mono text-xs text-accentLime flex justify-between items-center">
            <span>[ STATUS: {actionNotice} ]</span>
            <button onClick={() => setActionNotice('')} className="text-textMuted hover:text-white">✕</button>
          </div>
        )}

        {/* Main Details Box */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-10 space-y-8">
          {/* Top Badges */}
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-borderSubtle pb-4">
            <div className="flex items-center gap-3">
              <span className="border border-accentLime/40 bg-accentLime/10 px-2.5 py-1 font-mono text-xs text-accentLime font-bold">
                [ {classData.skill?.name} ]
              </span>
              <span className="font-mono text-xs text-textMuted">
                STATUS: [{classData.status}]
              </span>
            </div>
            <div className="font-mono text-xs text-accentLime font-bold">
              [ {classData.seatsAvailable} / {classData.seatsTotal} SEATS AVAILABLE ]
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary leading-tight">
              {classData.title}
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-textSecondary leading-relaxed whitespace-pre-line">
              {classData.description}
            </p>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-borderSubtle bg-surfaceElevated p-4 font-mono text-xs">
            <div>
              <span className="text-textMuted uppercase block mb-1">[ DATE & TIME ]</span>
              <div className="flex items-center gap-1.5 text-textPrimary font-bold">
                <Calendar className="h-3.5 w-3.5 text-accentLime" />
                <span>
                  {dateObj.toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-textMuted text-[11px] mt-0.5">
                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({classData.durationMinutes} mins)
              </p>
            </div>

            <div>
              <span className="text-textMuted uppercase block mb-1">[ VENUE / FORMAT ]</span>
              <div className="flex items-center gap-1.5 text-textPrimary font-bold">
                <MapPin className="h-3.5 w-3.5 text-accentLime" />
                <span>{classData.isOnline ? 'Online Video Link' : 'On-Campus Room'}</span>
              </div>
              <p className="text-accentLime text-[11px] mt-0.5 truncate">
                {classData.locationUrl}
              </p>
            </div>

            <div>
              <span className="text-textMuted uppercase block mb-1">[ CAPACITY ]</span>
              <div className="flex items-center gap-1.5 text-textPrimary font-bold">
                <Users className="h-3.5 w-3.5 text-accentLime" />
                <span>{classData.seatsTotal} Total Capacity</span>
              </div>
              <p className="text-textMuted text-[11px] mt-0.5">
                {classData.registrations.length} Students Registered
              </p>
            </div>
          </div>

          {/* Requirements & Resources */}
          <div className="space-y-3 font-mono text-xs">
            {classData.requirements && (
              <div className="border-l-2 border-accentLime pl-3 py-1">
                <span className="text-textMuted uppercase block">[ PREREQUISITES & PREPARATION ]:</span>
                <p className="text-textPrimary mt-0.5">{classData.requirements}</p>
              </div>
            )}
            {classData.resourcesUrl && (
              <div className="border-l-2 border-borderLight pl-3 py-1">
                <span className="text-textMuted uppercase block">[ SUPPORTING MATERIAL ]:</span>
                <a
                  href={classData.resourcesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accentLime hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{classData.resourcesUrl}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Teacher Profile Card */}
          <div className="border-t border-borderSubtle pt-6">
            <h3 className="font-mono text-xs uppercase text-accentLime mb-3">
              [ PEER INSTRUCTOR PROFILE ]
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-borderSubtle bg-surfaceElevated p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-accentLime/20 text-accentLime font-mono text-base font-bold flex items-center justify-center">
                  {prof?.fullName?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-textPrimary">{prof?.fullName}</h4>
                    <ShieldCheck className="h-4 w-4 text-accentLime" />
                    <span className="font-mono text-[10px] text-accentLime">
                      [ {teacher?.college?.name} ]
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary mt-0.5">
                    {prof?.course} · Semester {prof?.semester}
                  </p>
                  <div className="flex items-center gap-3 font-mono text-xs text-textMuted mt-1">
                    <span className="text-accentLime font-bold">{prof?.rating?.toFixed(1)} ★ ({prof?.ratingCount} reviews)</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3 fill-accentLime text-accentLime" />
                      {prof?.totalKarma} Karma
                    </span>
                    <span>·</span>
                    <span>{prof?.studentsHelped} peers helped</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${teacher?.id}`}
                  className="border border-borderLight px-3 py-1.5 font-mono text-xs text-textPrimary hover:border-accentLime"
                >
                  [ VIEW PORTFOLIO ]
                </Link>
                <Link
                  href="/chat"
                  className="border border-borderLight px-3 py-1.5 font-mono text-xs text-accentLime hover:border-accentLime"
                >
                  [ MESSAGE ]
                </Link>
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="border-t border-borderSubtle pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="font-mono text-xs text-textMuted">
              {isCompleted ? (
                <span className="text-accentLime font-bold">[ SESSION COMPLETED ]</span>
              ) : isHost ? (
                <span>You are the host of this learning session.</span>
              ) : myRegistration ? (
                <span className="text-accentLime font-bold">✓ YOU ARE REGISTERED FOR THIS CLASS</span>
              ) : (
                <span>Registration is open until seats fill up.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isHost ? (
                !isCompleted && (
                  <button
                    onClick={handleCompleteClass}
                    disabled={isActing}
                    className="w-full sm:w-auto border border-accentLime bg-accentLime px-6 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover shadow-glow-lime"
                  >
                    [ MARK CLASS COMPLETED & DISBURSE KARMA ]
                  </button>
                )
              ) : myRegistration ? (
                <button
                  onClick={handleCancelRegistration}
                  disabled={isActing}
                  className="w-full sm:w-auto border border-red-500/50 bg-red-500/10 px-4 py-2 font-mono text-xs text-red-400 hover:bg-red-500/20"
                >
                  [ CANCEL SEAT ]
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isActing || classData.seatsAvailable <= 0 || isCompleted}
                  className="w-full sm:w-auto border border-accentLime bg-accentLime px-6 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover shadow-glow-lime disabled:opacity-50"
                >
                  {classData.seatsAvailable <= 0
                    ? '[ FULLY BOOKED ]'
                    : '[ REGISTER FOR SEAT (+20 KARMA) ]'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-4">
            <div>
              <span className="font-mono text-xs uppercase text-accentLime font-bold">
                [ VERIFIED REPUTATION ]
              </span>
              <h3 className="font-sans text-lg font-black uppercase text-textPrimary">
                STUDENT RATINGS & REVIEWS ({classData.reviews?.length || 0})
              </h3>
            </div>
          </div>

          {/* Leave a Review (if participant and completed) */}
          {isCompleted && !isHost && (
            <form onSubmit={handleSubmitReview} className="border border-borderLight bg-surfaceElevated p-4 space-y-4 font-mono text-xs">
              <span className="text-accentLime font-bold uppercase block">[ LEAVE VERIFIED FEEDBACK ]</span>
              {reviewSuccess && (
                <p className="text-accentLime">{reviewSuccess}</p>
              )}
              <div className="flex items-center gap-3">
                <label className="text-textMuted uppercase">RATING:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-base ${
                        reviewRating >= star ? 'text-accentLime' : 'text-textMuted'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={2}
                required
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How was the session clarity, explanation depth, and exercises?..."
                className="w-full border border-borderSubtle bg-surface p-2 text-textPrimary focus:border-accentLime focus:outline-none"
              />
              <button
                type="submit"
                className="border border-accentLime bg-accentLime px-4 py-1.5 font-bold uppercase text-background hover:bg-accentLimeHover"
              >
                [ SUBMIT REVIEW ]
              </button>
            </form>
          )}

          {/* Reviews List */}
          {classData.reviews?.length === 0 ? (
            <p className="font-mono text-xs text-textMuted py-4 text-center">
              No reviews recorded for this session yet.
            </p>
          ) : (
            <div className="space-y-3">
              {classData.reviews.map((r: any) => (
                <div
                  key={r.id}
                  className="border border-borderSubtle bg-surfaceElevated p-4 space-y-1.5"
                >
                  <div className="flex justify-between items-center font-mono text-xs">
                    <span className="font-bold text-textPrimary">
                      {r.reviewer?.profile?.fullName || 'Verified Learner'}
                    </span>
                    <span className="text-accentLime font-bold">
                      {'★'.repeat(r.rating)} ({r.rating}.0)
                    </span>
                  </div>
                  <p className="text-xs text-textSecondary">{r.comment}</p>
                  <p className="font-mono text-[10px] text-textMuted">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
