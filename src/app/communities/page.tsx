'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Search,
  Sparkles,
  Plus,
  CheckCircle2,
  Share2,
  TrendingUp,
  X,
  Send,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  memberCount: number;
  isJoined?: boolean;
  _count?: {
    posts: number;
    members: number;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    profile: {
      fullName: string;
      avatarUrl?: string;
    } | null;
    college?: {
      name: string;
    };
  };
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      profile: {
        fullName: string;
      } | null;
    };
  }[];
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Active community modal / discussion view
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);

  // New post form
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Comment input
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/communities');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleJoin = async (community: Community) => {
    const action = community.isJoined ? 'LEAVE' : 'JOIN';
    const updatedStatus = !community.isJoined;

    // Optimistic UI update
    setCommunities((prev) =>
      prev.map((c) =>
        c.id === community.id
          ? {
              ...c,
              isJoined: updatedStatus,
              memberCount: updatedStatus ? c.memberCount + 1 : Math.max(0, c.memberCount - 1),
            }
          : c
      )
    );

    try {
      await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId: community.id, action }),
      });
    } catch (e) {
      console.error(e);
      fetchCommunities();
    }
  };

  const handleOpenCommunity = async (comm: Community) => {
    setActiveCommunity(comm);
    setIsPostsLoading(true);
    try {
      const res = await fetch(`/api/communities/${comm.slug}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity || !newPostTitle || !newPostContent) return;

    setIsSubmittingPost(true);
    try {
      const res = await fetch(`/api/communities/${activeCommunity.slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!activeCommunity || !commentText.trim()) return;

    try {
      const res = await fetch(`/api/communities/${activeCommunity.slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: commentText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments: [...p.comments, data.comment] } : p
          )
        );
        setCommentText('');
        setActivePostId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['ALL', 'ENGINEERING', 'ARTIFICIAL INTELLIGENCE', 'DESIGN', 'RESEARCH', 'HACKATHONS'];

  const filteredCommunities = communities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      categoryFilter === 'ALL' || c.category.toUpperCase() === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-[#0A0C0E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="border border-borderSubtle bg-surface p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase text-accentLime font-bold block mb-1">
              [ COLLEGIATE SOCIETIES & INTEREST GUILDS ]
            </span>
            <h1 className="font-sans text-2xl sm:text-4xl font-black uppercase tracking-tight text-textPrimary">
              CAMPUS COMMUNITIES
            </h1>
            <p className="mt-1 text-xs text-textSecondary font-mono max-w-2xl">
              Connect with department societies, research circles, and student chapters across verified academic networks.
            </p>
          </div>

          <div className="border border-accentLime/30 bg-accentLime/10 px-4 py-2 text-xs font-mono text-accentLime flex items-center gap-2">
            <Zap className="h-4 w-4 fill-accentLime" />
            <span>EARN +10 KARMA PER DISCUSSION STARTED</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-textMuted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search academic societies, guilds, or topics..."
              className="w-full border border-borderSubtle bg-surface pl-10 pr-4 py-2.5 text-xs font-mono text-textPrimary placeholder:text-textMuted focus:border-accentLime focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`border px-3.5 py-2 font-mono text-xs whitespace-nowrap transition-colors ${
                  categoryFilter === cat
                    ? 'border-accentLime bg-accentLime/10 text-accentLime font-bold'
                    : 'border-borderSubtle bg-surface text-textSecondary hover:border-borderLight hover:text-textPrimary'
                }`}
              >
                [{cat}]
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin mb-4" />
            <p className="font-mono text-xs text-accentLime">[ RETRIEVING CAMPUS GUILDS... ]</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="border border-borderSubtle bg-surface p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-textMuted mb-3" />
            <h3 className="font-sans text-base font-bold uppercase text-textPrimary">NO COMMUNITIES FOUND</h3>
            <p className="mt-1 text-xs text-textSecondary font-mono">
              Try adjusting your category filter or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div
                key={community.id}
                className="border border-borderSubtle bg-surface p-6 flex flex-col justify-between hover:border-accentLime/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-borderSubtle pb-3 mb-4">
                    <span className="font-mono text-[10px] text-accentLime bg-accentLime/10 border border-accentLime/30 px-2 py-0.5">
                      [{community.category.toUpperCase()}]
                    </span>
                    <span className="font-mono text-[11px] text-textMuted flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {community.memberCount} MEMBERS
                    </span>
                  </div>

                  <h2 className="font-sans text-xl font-bold uppercase text-textPrimary mb-2">
                    {community.name}
                  </h2>
                  <p className="text-xs text-textSecondary font-mono leading-relaxed mb-6 line-clamp-3">
                    {community.description}
                  </p>
                </div>

                <div className="border-t border-borderSubtle pt-4 mt-auto space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-textMuted">
                    <span>{community._count?.posts || 0} Discussions</span>
                    <span>/{community.slug}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleJoin(community)}
                      className={`flex-1 border py-2 font-mono text-xs font-bold transition-colors ${
                        community.isJoined
                          ? 'border-accentLime bg-accentLime/10 text-accentLime hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50'
                          : 'border-accentLime bg-accentLime text-background hover:bg-accentLimeHover'
                      }`}
                    >
                      {community.isJoined ? '[ MEMBER ✓ ]' : '[ JOIN GUILD ]'}
                    </button>

                    <button
                      onClick={() => handleOpenCommunity(community)}
                      className="border border-borderSubtle bg-surfaceElevated px-3 py-2 font-mono text-xs text-textSecondary hover:border-accentLime hover:text-textPrimary transition-colors"
                      title="View Discussions"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Community Discussion Feed Drawer / Modal */}
        {activeCommunity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-3xl border border-borderSubtle bg-surface p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-borderSubtle pb-4">
                <div>
                  <span className="font-mono text-xs text-accentLime uppercase block">
                    [ {activeCommunity.category} GUILD ]
                  </span>
                  <h3 className="font-sans text-2xl font-black uppercase text-textPrimary">
                    {activeCommunity.name}
                  </h3>
                  <p className="font-mono text-xs text-textSecondary mt-1">
                    {activeCommunity.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveCommunity(null)}
                  className="text-textMuted hover:text-textPrimary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Start Discussion Box */}
              <form
                onSubmit={handleCreatePost}
                className="border border-borderSubtle bg-surfaceElevated p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase text-accentLime font-bold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    [ START A NEW TOPIC ]
                  </span>
                  <span className="font-mono text-[10px] text-textMuted">+10 KARMA</span>
                </div>

                <input
                  type="text"
                  required
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Discussion Title / Question..."
                  className="w-full border border-borderSubtle bg-surface px-3 py-2 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                />

                <textarea
                  required
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your ideas, research papers, campus queries, or technical breakdowns..."
                  className="w-full border border-borderSubtle bg-surface p-3 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="border border-accentLime bg-accentLime px-5 py-2 font-mono text-xs font-bold uppercase text-background hover:bg-accentLimeHover disabled:opacity-50"
                  >
                    {isSubmittingPost ? '[ PUBLISHING... ]' : '[ POST TOPIC ]'}
                  </button>
                </div>
              </form>

              {/* Discussions Feed */}
              <div className="space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-wider text-textMuted border-b border-borderSubtle pb-2">
                  COMMUNITY DISCUSSIONS ({posts.length})
                </h4>

                {isPostsLoading ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto h-6 w-6 border-2 border-accentLime border-t-transparent animate-spin mb-2" />
                    <p className="font-mono text-xs text-accentLime">[ LOADING FEED... ]</p>
                  </div>
                ) : posts.length === 0 ? (
                  <p className="text-xs font-mono text-textMuted text-center py-8">
                    No discussions posted in this guild yet. Be the first to start the conversation!
                  </p>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="border border-borderSubtle bg-surfaceElevated p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accentLime">
                            {post.author.profile?.fullName || 'Student'}
                          </span>
                          {post.author.college && (
                            <span className="text-[10px] text-textMuted">
                              [{post.author.college.name}]
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-textMuted">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="font-sans text-base font-bold text-textPrimary uppercase">
                        {post.title}
                      </h5>
                      <p className="text-xs font-mono text-textSecondary leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      {/* Comments section */}
                      <div className="border-t border-borderSubtle pt-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-textMuted">
                          <span>Replies ({post.comments.length})</span>
                          <button
                            onClick={() =>
                              setActivePostId(activePostId === post.id ? null : post.id)
                            }
                            className="text-accentLime hover:underline"
                          >
                            {activePostId === post.id ? '[ Close Reply ]' : '[ Reply ]'}
                          </button>
                        </div>

                        {post.comments.map((comm) => (
                          <div
                            key={comm.id}
                            className="border-l-2 border-accentLime/50 pl-3 py-1 text-xs font-mono"
                          >
                            <span className="font-bold text-textPrimary text-[11px]">
                              {comm.author.profile?.fullName || 'Peer'}:
                            </span>{' '}
                            <span className="text-textSecondary">{comm.content}</span>
                          </div>
                        ))}

                        {activePostId === post.id && (
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Write a constructive reply..."
                              className="flex-1 border border-borderSubtle bg-surface px-3 py-1.5 text-xs font-mono text-textPrimary focus:border-accentLime focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="border border-accentLime bg-accentLime px-4 py-1.5 font-mono text-xs font-bold text-background hover:bg-accentLimeHover"
                            >
                              SEND
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
