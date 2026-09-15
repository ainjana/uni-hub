'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HelpCircle,
  Clock,
  ShieldCheck,
  Zap,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [responseMsg, setResponseMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    fetchRequest();
    fetchUser();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/requests/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        setRequest(json.request);
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

  const handleOfferHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: responseMsg }),
      });
      if (res.ok) {
        setResponseMsg('');
        setActionNotice('Help offer sent to author! Status updated to IN PROGRESS.');
        fetchRequest();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit response');
      }
    } catch {
      alert('Error offering help');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!confirm('Mark request as completed? This will award +30 Karma to your helper.')) return;
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setActionNotice(data.message);
        fetchRequest();
      }
    } catch {
      alert('Error completing request');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-accentLime">
        [ LOADING INQUIRY DETAILS... ]
      </div>
    );
  }

  if (!request) {
    return (
      <div className="py-20 text-center font-mono text-xs text-textMuted">
        Inquiry not found.
      </div>
    );
  }

  const isAuthor = currentUser?.id === request.authorId;
  const isCompleted = request.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {actionNotice && (
          <div className="border border-accentLime bg-accentLime/10 p-3 font-mono text-xs text-accentLime flex justify-between items-center">
            <span>[ STATUS: {actionNotice} ]</span>
            <button onClick={() => setActionNotice('')} className="text-textMuted hover:text-white">✕</button>
          </div>
        )}

        {/* Main Request Box */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-borderSubtle pb-4">
            <div className="flex items-center gap-2">
              <span className="border border-accentLime/40 bg-accentLime/10 px-2.5 py-1 font-mono text-xs text-accentLime font-bold">
                [ {request.skillName} ]
              </span>
              <span className="font-mono text-xs text-textMuted uppercase">
                STATUS: [{request.status}]
              </span>
            </div>
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 ${
                request.urgency === 'URGENT' || request.urgency === 'HIGH'
                  ? 'text-red-400 bg-red-500/10'
                  : 'text-accentLime bg-accentLime/10'
              }`}
            >
              [ {request.urgency} URGENCY ]
            </span>
          </div>

          <div>
            <h1 className="font-sans text-2xl sm:text-3xl font-black uppercase tracking-tight text-textPrimary">
              {request.title}
            </h1>
            <p className="mt-4 text-xs sm:text-sm text-textSecondary leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>

          {/* Author Card */}
          <div className="border-t border-borderSubtle pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-accentLime/20 text-accentLime flex items-center justify-center font-bold">
                {request.author?.profile?.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-textPrimary font-bold">
                    {request.author?.profile?.fullName}
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-accentLime" />
                </div>
                <span className="text-textMuted text-[11px]">
                  {request.author?.college?.name} · Sem {request.author?.profile?.semester}
                </span>
              </div>
            </div>

            {isAuthor && !isCompleted && (
              <button
                onClick={handleMarkComplete}
                className="border border-accentLime bg-accentLime px-4 py-2 font-bold uppercase text-background hover:bg-accentLimeHover shadow-glow-lime"
              >
                [ MARK RESOLVED (+30 KARMA TO HELPER) ]
              </button>
            )}
          </div>
        </div>

        {/* Responses Stream */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-borderSubtle pb-4">
            <h3 className="font-mono text-xs uppercase text-accentLime font-bold">
              [ PEER RESPONSES & OFFERS ({request.responses?.length || 0}) ]
            </h3>
          </div>

          {/* Offer Help Form (if not author and not completed) */}
          {!isAuthor && !isCompleted && (
            <form onSubmit={handleOfferHelp} className="border border-borderLight bg-surfaceElevated p-4 space-y-3 font-mono text-xs">
              <span className="text-accentLime font-bold uppercase block">
                [ OFFER ACADEMIC ASSISTANCE (+30 KARMA) ]
              </span>
              <textarea
                rows={3}
                required
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="Explain how you can assist (e.g. 'I implemented this in CS161 last semester, happy to jump on a 15-min call')..."
                className="w-full border border-borderSubtle bg-surface p-2.5 text-textPrimary focus:border-accentLime focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="border border-accentLime bg-accentLime px-4 py-2 font-bold uppercase text-background hover:bg-accentLimeHover"
                >
                  {isSubmitting ? '[ SENDING OFFER... ]' : '[ SEND HELP OFFER ]'}
                </button>
              </div>
            </form>
          )}

          {/* List of responses */}
          {request.responses?.length === 0 ? (
            <p className="font-mono text-xs text-textMuted py-4 text-center">
              No peer offers submitted yet. Be the first to assist!
            </p>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {request.responses.map((resp: any) => (
                <div
                  key={resp.id}
                  className="border border-borderSubtle bg-surfaceElevated p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-textPrimary">
                        {resp.helper?.profile?.fullName}
                      </span>
                      <span className="text-textMuted text-[10px]">
                        [{resp.helper?.college?.name}]
                      </span>
                    </div>
                    <Link
                      href="/chat"
                      className="border border-borderLight px-2.5 py-1 text-accentLime hover:border-accentLime text-[11px]"
                    >
                      [ MESSAGE HELPER ]
                    </Link>
                  </div>
                  <p className="text-textSecondary">{resp.message}</p>
                  <p className="text-[10px] text-textMuted">
                    {new Date(resp.createdAt).toLocaleString()}
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
