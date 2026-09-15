export type UserRole = 'STUDENT' | 'ADMIN';

export type SessionStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type RegistrationStatus = 'REGISTERED' | 'ATTENDED' | 'CANCELLED';

export type RequestUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type RequestStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';

export type ResourceVisibility = 'PUBLIC' | 'COLLEGE_ONLY' | 'PRIVATE';

export type ResourceType = 'Notes' | 'PDF' | 'Code' | 'Cheatsheet' | 'Link';

export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type ProjectStatus = 'RECRUITING' | 'IN_PROGRESS' | 'COMPLETED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type EventCategory = 'Exam' | 'Class' | 'Deadline' | 'Workshop' | 'Notice' | 'Event';

export type KarmaCategory =
  | 'Teaching'
  | 'Learning'
  | 'Helping'
  | 'ResourceShare'
  | 'ChallengeReward';

export interface UserSessionPayload {
  userId: string;
  email: string;
  fullName: string;
  collegeId: string;
  collegeName: string;
  isVerified: boolean;
  role: UserRole;
  avatarUrl?: string | null;
  totalKarma?: number;
}

export interface NoticeExtractedEvent {
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  category: EventCategory;
  description: string;
  relevanceScore: number;
  relevanceReason: string;
  relevantCourses: string[];
  relevantSemesters: number[];
}

export interface NoticeAnalysisResult {
  docType: string;
  summary: string;
  confidence: number;
  overallRelevance: number;
  events: NoticeExtractedEvent[];
  deadlines: Array<{
    title: string;
    dueDate: string;
    description: string;
  }>;
  requirements: string[];
}

export interface MentorMatch {
  mentorId: string;
  fullName: string;
  avatarUrl?: string | null;
  course: string;
  semester: number;
  collegeName: string;
  rating: number;
  ratingCount: number;
  totalKarma: number;
  skills: string[];
  matchScore: number; // 0 to 100
  matchReason: string;
  strengths: string[];
  availability: string;
}
