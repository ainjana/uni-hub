import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-borderSubtle bg-[#0A0C0E] text-textSecondary">
      {/* Editorial Quote Statement */}
      <div className="border-b border-borderSubtle/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="max-w-2xl">
              <span className="font-mono text-xs uppercase tracking-widest text-accentLime block mb-3">
                [ CORE PRINCIPLE // 2026 ]
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-textPrimary leading-tight">
                A VERIFIED NETWORK WHERE STUDENTS{' '}
                <span className="text-accentLime bg-accentLime/10 px-1">[ TEACH, LEARN, AND COLLABORATE ]</span>.
                REPUTATION IS BUILT ON GENUINE CONTRIBUTION.
              </h2>
            </div>
            <div className="font-mono text-xs text-textMuted tracking-wider space-y-1">
              <p>[ SYSTEM: UNIVERSITY HUB v1.0 ]</p>
              <p>[ VERIFICATION: .EDU RESTRICTED ]</p>
              <p>[ LEDGER: IMMUTABLE KARMA ]</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-accentLime mb-4">
              [ ACADEMIC HUB ]
            </h4>
            <ul className="space-y-2 font-mono text-xs text-textMuted">
              <li>
                <Link href="/dashboard" className="hover:text-textPrimary transition-colors">
                  Personal Dashboard
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="hover:text-textPrimary transition-colors">
                  Master Timeline
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="hover:text-textPrimary transition-colors">
                  AI Notice Scanner
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-textPrimary transition-colors">
                  Study Materials & Notes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-accentLime mb-4">
              [ PEER LEARNING ]
            </h4>
            <ul className="space-y-2 font-mono text-xs text-textMuted">
              <li>
                <Link href="/classes" className="hover:text-textPrimary transition-colors">
                  Discover Classes
                </Link>
              </li>
              <li>
                <Link href="/classes/teach" className="hover:text-textPrimary transition-colors">
                  Teach a Skill
                </Link>
              </li>
              <li>
                <Link href="/mentors" className="hover:text-textPrimary transition-colors">
                  AI Mentor Match
                </Link>
              </li>
              <li>
                <Link href="/requests" className="hover:text-textPrimary transition-colors">
                  Help Feed
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-accentLime mb-4">
              [ COLLABORATION ]
            </h4>
            <ul className="space-y-2 font-mono text-xs text-textMuted">
              <li>
                <Link href="/connections" className="hover:text-textPrimary transition-colors">
                  Student Networking
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-textPrimary transition-colors">
                  Project Teammates
                </Link>
              </li>
              <li>
                <Link href="/communities" className="hover:text-textPrimary transition-colors">
                  Topic Communities
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-textPrimary transition-colors">
                  Private Messaging
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-accentLime mb-4">
              [ REPUTATION & KARMA ]
            </h4>
            <ul className="space-y-2 font-mono text-xs text-textMuted">
              <li>
                <Link href="/karma/leaderboard" className="hover:text-textPrimary transition-colors">
                  Campus Leaderboards
                </Link>
              </li>
              <li>
                <Link href="/karma/challenges" className="hover:text-textPrimary transition-colors">
                  Active Challenges
                </Link>
              </li>
              <li>
                <Link href="/karma" className="hover:text-textPrimary transition-colors">
                  Karma Ledger
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 pt-8 border-t border-borderSubtle/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-textMuted">
          <p>© 2026 UNIVERSITY HUB. VERIFIED STUDENT NETWORK.</p>
          <p className="tracking-widest text-textSecondary uppercase font-bold">
            CONTRIBUTION · LEARNING · COLLABORATION · CLARITY
          </p>
        </div>
      </div>
    </footer>
  );
}
