'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  ShieldCheck,
  User,
  Clock,
  Circle,
  ArrowLeft,
} from 'lucide-react';

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, []);

  // Poll active conversation messages every 3s
  useEffect(() => {
    if (!activeConvId) return;
    fetchMessages(activeConvId);

    const interval = setInterval(() => {
      fetchMessages(activeConvId);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !activeConvId) {
          setActiveConvId(data.conversations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    setIsSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          text: textToSend,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        fetchConversations(); // update last message preview
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="min-h-[88vh] bg-[#0A0C0E] py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl border border-borderSubtle bg-surface shadow-2xl h-[78vh] flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Conversations List */}
        <div className="w-full md:w-80 border-r border-borderSubtle flex flex-col bg-surfaceElevated shrink-0">
          <div className="p-4 border-b border-borderSubtle flex items-center justify-between">
            <span className="font-mono text-xs text-accentLime uppercase font-bold">
              [ DIRECT MESSAGES ]
            </span>
            <span className="font-mono text-[10px] text-textMuted uppercase">
              1-TO-1 ENCRYPTED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-borderSubtle">
            {conversations.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-textMuted">
                No active conversations yet. Reach out to peer mentors or connect with students!
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                const peerProfile = conv.peer?.profile;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-surface border-l-2 border-accentLime' : 'hover:bg-surface/50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-accentLime/20 text-accentLime font-mono text-sm font-bold flex items-center justify-center shrink-0">
                      {peerProfile?.fullName?.charAt(0) || 'S'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-textPrimary truncate">
                          {peerProfile?.fullName}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="h-4 min-w-4 rounded-full bg-accentLime text-background font-mono text-[10px] font-bold flex items-center justify-center px-1">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-textMuted truncate">
                        {conv.lastMessage?.text || 'Started a conversation'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Message Thread */}
        <div className="flex-1 flex flex-col bg-surface">
          {activeConversation ? (
            <>
              {/* Conversation Top Header */}
              <div className="p-4 border-b border-borderSubtle flex items-center justify-between bg-surfaceElevated">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-accentLime/20 text-accentLime font-mono text-xs font-bold flex items-center justify-center">
                    {activeConversation.peer?.profile?.fullName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-textPrimary">
                        {activeConversation.peer?.profile?.fullName}
                      </h3>
                      <ShieldCheck className="h-3 w-3 text-accentLime" />
                    </div>
                    <p className="font-mono text-[10px] text-textMuted">
                      {activeConversation.peer?.college?.name} · {activeConversation.peer?.profile?.course}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/profile/${activeConversation.peer?.id}`}
                  className="border border-borderLight px-2.5 py-1 font-mono text-[11px] text-accentLime hover:border-accentLime"
                >
                  [ VIEW PROFILE ]
                </Link>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="py-12 text-center font-mono text-xs text-textMuted">
                    Start the conversation! Coordinate classes, questions, or project collaborations.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === currentUser?.id;
                    const dateStr = new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 text-xs leading-relaxed ${
                            isMe
                              ? 'bg-accentLime text-background font-medium rounded-sm shadow-glow-lime'
                              : 'border border-borderLight bg-surfaceElevated text-textPrimary rounded-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.text}</p>
                        </div>
                        <span className="mt-1 font-mono text-[10px] text-textMuted">
                          {dateStr}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-borderSubtle bg-surfaceElevated flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message to collegiate peer..."
                  className="flex-1 border border-borderSubtle bg-surface px-4 py-2.5 font-mono text-xs text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="border border-accentLime bg-accentLime px-4 py-2.5 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">[ SEND ]</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center font-mono text-xs text-textMuted">
              Select a conversation to begin direct messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
