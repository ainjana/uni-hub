import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding University Hub Database ---');

  // Clean existing records if any
  await prisma.notification.deleteMany({});
  await prisma.communityComment.deleteMany({});
  await prisma.communityPost.deleteMany({});
  await prisma.communityMember.deleteMany({});
  await prisma.community.deleteMany({});
  await prisma.projectApplication.deleteMany({});
  await prisma.projectRole.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.challengeProgress.deleteMany({});
  await prisma.karmaChallenge.deleteMany({});
  await prisma.karmaTransaction.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.skillRequestResponse.deleteMany({});
  await prisma.skillRequest.deleteMany({});
  await prisma.sessionRegistration.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.noticeExtraction.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.studentInterest.deleteMany({});
  await prisma.studentSkill.deleteMany({});
  await prisma.interest.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.college.deleteMany({});

  // 1. Seed Colleges
  const stanford = await prisma.college.create({
    data: {
      name: 'Stanford University',
      domain: 'stanford.edu',
      city: 'Stanford',
      state: 'CA',
    },
  });

  const mit = await prisma.college.create({
    data: {
      name: 'Massachusetts Institute of Technology',
      domain: 'mit.edu',
      city: 'Cambridge',
      state: 'MA',
    },
  });

  const berkeley = await prisma.college.create({
    data: {
      name: 'University of California, Berkeley',
      domain: 'berkeley.edu',
      city: 'Berkeley',
      state: 'CA',
    },
  });

  const cmu = await prisma.college.create({
    data: {
      name: 'Carnegie Mellon University',
      domain: 'cmu.edu',
      city: 'Pittsburgh',
      state: 'PA',
    },
  });

  console.log('✓ Colleges created');

  // 2. Seed Skills
  const skillsData = [
    { name: 'Python', category: 'Programming' },
    { name: 'Java', category: 'Programming' },
    { name: 'Data Structures & Algorithms', category: 'Algorithms' },
    { name: 'React & Next.js', category: 'Web Development' },
    { name: 'Machine Learning', category: 'AI/Data' },
    { name: 'System Design', category: 'Architecture' },
    { name: 'TypeScript', category: 'Programming' },
    { name: 'UI/UX Design (Figma)', category: 'Design' },
    { name: 'PostgreSQL & Databases', category: 'Databases' },
    { name: 'Computer Networks', category: 'Systems' },
  ];

  const skillMap: Record<string, string> = {};
  for (const s of skillsData) {
    const created = await prisma.skill.create({ data: s });
    skillMap[s.name] = created.id;
  }
  console.log('✓ Skills created');

  // 3. Seed Interests
  const interestsData = [
    'Artificial Intelligence',
    'Open Source Contribution',
    'Competitive Programming',
    'Full-Stack Engineering',
    'Distributed Systems',
    'Product Design',
    'Cloud Computing',
  ];

  const interestMap: Record<string, string> = {};
  for (const i of interestsData) {
    const created = await prisma.interest.create({ data: { name: i } });
    interestMap[i] = created.id;
  }
  console.log('✓ Interests created');

  // Hash password for demo accounts: "password123"
  const passwordHash = await bcrypt.hash('password123', 10);

  // 4. Seed Verified Student Users
  // User 1: Alex Chen (Stanford)
  const alexUser = await prisma.user.create({
    data: {
      email: 'alex.chen@stanford.edu',
      passwordHash,
      isVerified: true,
      collegeId: stanford.id,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Alex Chen',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          bio: 'CS Senior @ Stanford. Passionate about high-throughput distributed systems, Java concurrency, and mentoring peers in technical interviews.',
          course: 'Computer Science',
          semester: 7,
          graduationYear: 2027,
          totalKarma: 480,
          rating: 4.9,
          ratingCount: 28,
          studentsHelped: 42,
        },
      },
    },
    include: { profile: true },
  });

  // User 2: Priya Patel (MIT)
  const priyaUser = await prisma.user.create({
    data: {
      email: 'priya.patel@mit.edu',
      passwordHash,
      isVerified: true,
      collegeId: mit.id,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Priya Patel',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
          bio: 'EECS Junior @ MIT. AI & Deep Learning researcher. Love breaking down complex mathematical algorithms into intuitive concepts.',
          course: 'Electrical Engineering & Computer Science',
          semester: 5,
          graduationYear: 2028,
          totalKarma: 620,
          rating: 5.0,
          ratingCount: 36,
          studentsHelped: 58,
        },
      },
    },
    include: { profile: true },
  });

  // User 3: Marcus Vance (Berkeley)
  const marcusUser = await prisma.user.create({
    data: {
      email: 'marcus.vance@berkeley.edu',
      passwordHash,
      isVerified: true,
      collegeId: berkeley.id,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Marcus Vance',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
          bio: 'EECS Sophomore @ UC Berkeley. Frontend architect, Figma enthusiast, and builder of modern accessible user interfaces.',
          course: 'EECS',
          semester: 3,
          graduationYear: 2029,
          totalKarma: 290,
          rating: 4.85,
          ratingCount: 16,
          studentsHelped: 24,
        },
      },
    },
    include: { profile: true },
  });

  // User 4: Elena Rostova (CMU)
  const elenaUser = await prisma.user.create({
    data: {
      email: 'elena.rostova@cmu.edu',
      passwordHash,
      isVerified: true,
      collegeId: cmu.id,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Elena Rostova',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
          bio: 'Software Engineering @ CMU. Distributed databases, Raft consensus, and cloud infra. Always up for architecture design reviews.',
          course: 'Software Engineering',
          semester: 5,
          graduationYear: 2028,
          totalKarma: 395,
          rating: 4.95,
          ratingCount: 22,
          studentsHelped: 35,
        },
      },
    },
    include: { profile: true },
  });

  // User 5: Demo Student for user testing: demo.student@stanford.edu
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo.student@stanford.edu',
      passwordHash,
      isVerified: true,
      collegeId: stanford.id,
      role: 'STUDENT',
      profile: {
        create: {
          fullName: 'Jordan Miller',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
          bio: 'Junior in Computer Science at Stanford. Currently studying Machine Learning, Computer Systems, and Modern Full-Stack Development.',
          course: 'Computer Science',
          semester: 5,
          graduationYear: 2028,
          totalKarma: 145,
          rating: 4.8,
          ratingCount: 8,
          studentsHelped: 12,
        },
      },
    },
    include: { profile: true },
  });

  console.log('✓ Students created');

  // Attach Skills to Profiles
  if (alexUser.profile) {
    await prisma.studentSkill.createMany({
      data: [
        { profileId: alexUser.profile.id, skillId: skillMap['Java'], proficiency: 'EXPERT', isTeaching: true },
        { profileId: alexUser.profile.id, skillId: skillMap['Data Structures & Algorithms'], proficiency: 'EXPERT', isTeaching: true },
        { profileId: alexUser.profile.id, skillId: skillMap['System Design'], proficiency: 'ADVANCED', isTeaching: true },
      ],
    });
  }

  if (priyaUser.profile) {
    await prisma.studentSkill.createMany({
      data: [
        { profileId: priyaUser.profile.id, skillId: skillMap['Python'], proficiency: 'EXPERT', isTeaching: true },
        { profileId: priyaUser.profile.id, skillId: skillMap['Machine Learning'], proficiency: 'EXPERT', isTeaching: true },
        { profileId: priyaUser.profile.id, skillId: skillMap['Data Structures & Algorithms'], proficiency: 'ADVANCED', isTeaching: true },
      ],
    });
  }

  if (marcusUser.profile) {
    await prisma.studentSkill.createMany({
      data: [
        { profileId: marcusUser.profile.id, skillId: skillMap['React & Next.js'], proficiency: 'EXPERT', isTeaching: true },
        { profileId: marcusUser.profile.id, skillId: skillMap['TypeScript'], proficiency: 'ADVANCED', isTeaching: true },
        { profileId: marcusUser.profile.id, skillId: skillMap['UI/UX Design (Figma)'], proficiency: 'EXPERT', isTeaching: true },
      ],
    });
  }

  if (demoUser.profile) {
    await prisma.studentSkill.createMany({
      data: [
        { profileId: demoUser.profile.id, skillId: skillMap['Python'], proficiency: 'INTERMEDIATE', isTeaching: false },
        { profileId: demoUser.profile.id, skillId: skillMap['TypeScript'], proficiency: 'INTERMEDIATE', isTeaching: true },
        { profileId: demoUser.profile.id, skillId: skillMap['PostgreSQL & Databases'], proficiency: 'BEGINNER', isTeaching: false },
      ],
    });
  }

  // 5. Seed Class Sessions (Teaching)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0);

  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 2);
  nextDay.setHours(18, 0, 0, 0);

  const weekend = new Date();
  weekend.setDate(weekend.getDate() + 4);
  weekend.setHours(14, 0, 0, 0);

  const session1 = await prisma.classSession.create({
    data: {
      teacherId: alexUser.id,
      title: 'Java Concurrency & Thread Synchronization Deep Dive',
      skillId: skillMap['Java'],
      description:
        'Hands-on masterclass covering java.util.concurrent, lock-free data structures, atomics, and practical multi-threaded debug patterns.',
      dateTime: tomorrow,
      durationMinutes: 75,
      seatsTotal: 6,
      seatsAvailable: 3,
      isOnline: true,
      locationUrl: 'https://meet.stanford.edu/hub-concurrency',
      requirements: 'Basic familiarity with Java classes and OOP principles.',
      status: 'UPCOMING',
    },
  });

  const session2 = await prisma.classSession.create({
    data: {
      teacherId: priyaUser.id,
      title: 'Python for Deep Learning: From NumPy Tensors to Transformers',
      skillId: skillMap['Python'],
      description:
        'Interactive code walkthrough building attention mechanisms from scratch using vector math and PyTorch tensors.',
      dateTime: nextDay,
      durationMinutes: 90,
      seatsTotal: 8,
      seatsAvailable: 4,
      isOnline: true,
      locationUrl: 'https://meet.mit.edu/hub-ml-tensors',
      requirements: 'Python basics, matrix multiplication familiarity.',
      status: 'UPCOMING',
    },
  });

  const session3 = await prisma.classSession.create({
    data: {
      teacherId: marcusUser.id,
      title: 'Design Systems in Figma & Modern Tailwind CSS v3/v4',
      skillId: skillMap['UI/UX Design (Figma)'],
      description:
        'Bridging the gap between Figma auto-layout and responsive React Tailwind components. We will design and build an editorial component together.',
      dateTime: weekend,
      durationMinutes: 60,
      seatsTotal: 5,
      seatsAvailable: 2,
      isOnline: true,
      locationUrl: 'https://meet.berkeley.edu/hub-design-tokens',
      requirements: 'Laptop with modern browser and free Figma account.',
      status: 'UPCOMING',
    },
  });

  // Register demo user for Session 1
  await prisma.sessionRegistration.create({
    data: {
      sessionId: session1.id,
      studentId: demoUser.id,
      status: 'REGISTERED',
    },
  });

  console.log('✓ Class sessions created');

  // 6. Seed Help Requests
  const req1 = await prisma.skillRequest.create({
    data: {
      authorId: demoUser.id,
      title: 'Need help debugging Red-Black Tree rotation edge cases in Java',
      description:
        'Working on CS161 problem set. Deletion fixup triggers infinite loop when node has red sibling. Need 20 mins guidance.',
      skillName: 'Data Structures & Algorithms',
      urgency: 'HIGH',
      availability: 'Today after 5 PM PST',
      status: 'OPEN',
    },
  });

  const req2 = await prisma.skillRequest.create({
    data: {
      authorId: marcusUser.id,
      title: 'Looking for peer to review Paxos / Raft consensus diagrams',
      description:
        'Writing summary notes on distributed consensus. Want someone who took distributed systems to check leader election invariants.',
      skillName: 'System Design',
      urgency: 'MEDIUM',
      availability: 'Tomorrow afternoon',
      status: 'OPEN',
    },
  });

  console.log('✓ Skill requests created');

  // 7. Seed Timeline Events for Demo Student
  const examDate = new Date();
  examDate.setDate(examDate.getDate() + 3);
  const examDateStr = examDate.toISOString().split('T')[0];

  const classDate = tomorrow.toISOString().split('T')[0];

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + 5);
  const deadlineDateStr = deadlineDate.toISOString().split('T')[0];

  await prisma.timelineEvent.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'CS 161: Design and Analysis of Algorithms Midterm Exam',
        description: 'Comprehensive exam covering Divide & Conquer, Dynamic Programming, Greedy, and Graph Algorithms.',
        date: examDateStr,
        time: '14:00 - 16:00',
        location: 'Hewlett Teaching Center, Room 200',
        category: 'Exam',
        source: 'NoticeScanner',
        isCompleted: false,
        relevanceScore: 0.98,
      },
      {
        userId: demoUser.id,
        title: 'Java Concurrency & Synchronization Masterclass',
        description: 'Peer teaching session hosted by Alex Chen [Stanford]. Lock-free structures & thread safety.',
        date: classDate,
        time: '16:00 - 17:15',
        location: 'https://meet.stanford.edu/hub-concurrency',
        category: 'Class',
        source: 'ClassRegistration',
        isCompleted: false,
        relevanceScore: 1.0,
      },
      {
        userId: demoUser.id,
        title: 'Distributed Systems Project Milestone 2 Deadline',
        description: 'Submit Raft leader election RPC implementation and pass 100 consecutive test runs.',
        date: deadlineDateStr,
        time: '23:59 PST',
        location: 'Gradescope Submission Portal',
        category: 'Deadline',
        source: 'NoticeScanner',
        isCompleted: false,
        relevanceScore: 0.95,
      },
      {
        userId: demoUser.id,
        title: 'Stanford TreeHacks 2026: Hacker Application Deadline',
        description: 'Submit project tracks and team rosters for California largest collegiate hackathon.',
        date: deadlineDateStr,
        time: '18:00 PST',
        location: 'Huang Engineering Center',
        category: 'Event',
        source: 'NoticeScanner',
        isCompleted: false,
        relevanceScore: 0.9,
      },
    ],
  });

  console.log('✓ Timeline events created');

  // 8. Seed Karma Challenges
  const challenge1 = await prisma.karmaChallenge.create({
    data: {
      title: 'Teach One, Learn One',
      description: 'Host at least one skill-teaching class and register to learn a skill from another student.',
      rewardKarma: 80,
      durationDays: 14,
      targetCount: 2,
      challengeType: 'TEACH_ONE_LEARN_ONE',
    },
  });

  const challenge2 = await prisma.karmaChallenge.create({
    data: {
      title: '7-Day Academic Streak',
      description: 'Actively participate, submit study materials, or assist peers for seven consecutive days.',
      rewardKarma: 100,
      durationDays: 7,
      targetCount: 7,
      challengeType: 'STREAK_LEARNING',
    },
  });

  const challenge3 = await prisma.karmaChallenge.create({
    data: {
      title: 'Help 3 Students This Week',
      description: 'Provide verified academic help or review code/notes for three students in the help feed.',
      rewardKarma: 60,
      durationDays: 7,
      targetCount: 3,
      challengeType: 'HELP_STUDENTS',
    },
  });

  // Track progress for demo user
  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge1.id,
      userId: demoUser.id,
      currentCount: 1,
      isCompleted: false,
    },
  });

  await prisma.challengeProgress.create({
    data: {
      challengeId: challenge3.id,
      userId: demoUser.id,
      currentCount: 1,
      isCompleted: false,
    },
  });

  console.log('✓ Challenges created');

  // 9. Seed Karma Transactions (Ledger)
  await prisma.karmaTransaction.createMany({
    data: [
      {
        userId: demoUser.id,
        amount: 50,
        reason: 'Taught session: Modern TypeScript Type-Level Magic',
        category: 'Teaching',
        createdAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        userId: demoUser.id,
        amount: 20,
        reason: 'Completed learning session: Intro to Vector Embeddings',
        category: 'Learning',
        createdAt: new Date(Date.now() - 4 * 86400000),
      },
      {
        userId: demoUser.id,
        amount: 30,
        reason: 'Helped Marcus resolve Next.js SSR hydration mismatch bug',
        category: 'Helping',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        userId: demoUser.id,
        amount: 45,
        reason: 'Shared verified study guide: CS161 Dynamic Programming Cheatsheet',
        category: 'ResourceShare',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      // Transactions for other students to power leaderboards
      {
        userId: priyaUser.id,
        amount: 150,
        reason: 'Taught 3 masterclasses on PyTorch & Deep Learning',
        category: 'Teaching',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
      {
        userId: alexUser.id,
        amount: 120,
        reason: 'Helped 4 students debug complex concurrency and memory bugs',
        category: 'Helping',
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        userId: marcusUser.id,
        amount: 80,
        reason: 'Created and shared Figma design tokens library',
        category: 'ResourceShare',
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  console.log('✓ Karma ledger seeded');

  // 10. Seed Communities
  const cseCommunity = await prisma.community.create({
    data: {
      name: 'Computer Science & Systems Architecture',
      slug: 'cse-systems',
      description:
        'Deep discussions on operating systems, compilers, distributed protocols, memory allocators, and hardware architectures.',
      topic: 'CSE',
      icon: 'Terminal',
      memberCount: 342,
    },
  });

  const pythonCommunity = await prisma.community.create({
    data: {
      name: 'Python, NumPy & Scientific Computing',
      slug: 'python-scientific',
      description:
        'High-performance Python, vectorization, PyTorch, pandas profiling, and machine learning pipelines.',
      topic: 'Python',
      icon: 'Cpu',
      memberCount: 489,
    },
  });

  const dsaCommunity = await prisma.community.create({
    data: {
      name: 'Algorithms & Competitive Problem Solving',
      slug: 'dsa-competitive',
      description:
        'Discussion of complex graph algorithms, tree decompositions, dynamic programming proofs, and interview preparation.',
      topic: 'DSA',
      icon: 'Binary',
      memberCount: 612,
    },
  });

  const webDevCommunity = await prisma.community.create({
    data: {
      name: 'Modern Web Architecture & UI Engineering',
      slug: 'web-engineering',
      description:
        'Next.js App Router, React Server Components, Tailwind CSS, accessibility, WebSockets, and state machines.',
      topic: 'WebDev',
      icon: 'Globe',
      memberCount: 295,
    },
  });

  // Add members and posts
  await prisma.communityMember.create({
    data: {
      communityId: cseCommunity.id,
      userId: demoUser.id,
    },
  });

  const samplePost = await prisma.communityPost.create({
    data: {
      communityId: cseCommunity.id,
      authorId: alexUser.id,
      title: 'Comparing Raft vs. Multi-Paxos: Why do production systems diverge from academic specifications?',
      content:
        'While implementing Raft in CS244B, I noticed how log compaction, batching, and pipelining complicate the clean theoretical state machine. How are folks handling split-brain invariants during network partitions?',
      upvotes: 24,
    },
  });

  await prisma.communityComment.create({
    data: {
      postId: samplePost.id,
      authorId: elenaUser.id,
      content:
        'Great breakdown. In production systems like CockroachDB and TiKV, multi-raft groups with leases are typically used instead of single-leader Paxos to minimize latency on cross-datacenter commits.',
    },
  });

  console.log('✓ Communities seeded');

  // 11. Seed Projects
  const project1 = await prisma.project.create({
    data: {
      creatorId: alexUser.id,
      title: 'OpenDistributed: High-Performance Distributed Key-Value Store in Rust',
      description:
        'Building an educational, production-grade distributed key-value store with Raft consensus, write-ahead logging (WAL), and LSM-tree storage engine.',
      teamSize: 4,
      status: 'RECRUITING',
      deadline: new Date(Date.now() + 25 * 86400000),
      roles: {
        create: [
          {
            roleName: 'Consensus Engine Developer',
            skillsRequired: 'Rust, Distributed Systems, Raft',
            openSeats: 1,
            filledSeats: 0,
          },
          {
            roleName: 'Storage Engine Specialist',
            skillsRequired: 'LSM Trees, WAL, Low-Level I/O',
            openSeats: 1,
            filledSeats: 0,
          },
        ],
      },
    },
  });

  console.log('✓ Projects seeded');

  // 12. Seed Resources
  await prisma.resource.createMany({
    data: [
      {
        authorId: alexUser.id,
        title: 'CS161 Complete Algorithm Synthesis & DP Formulas Guide',
        description: 'Clean LaTeX compiled summary sheets for interval scheduling, Knapsack variants, Floyd-Warshall, and Network Flows.',
        skillName: 'Data Structures & Algorithms',
        resourceType: 'PDF',
        fileUrl: '/uploads/sample-dp-guide.pdf',
        visibility: 'PUBLIC',
        downloadsCount: 142,
      },
      {
        authorId: priyaUser.id,
        title: 'Vector Math & Attention Mechanism Jupyter Walkthrough',
        description: 'Annotated notebook building Multi-Head Self-Attention step by step with dimensional matrix diagrams.',
        skillName: 'Machine Learning',
        resourceType: 'Code',
        fileUrl: '/uploads/sample-attention.ipynb',
        visibility: 'PUBLIC',
        downloadsCount: 231,
      },
      {
        authorId: marcusUser.id,
        title: 'Editorial AURALEE UI Design Tokens & Tailwind Component Kit',
        description: 'Ready-to-use brutalist-editorial UI templates, bracket notation tokens, and accessible dialog patterns.',
        skillName: 'React & Next.js',
        resourceType: 'Code',
        fileUrl: '/uploads/sample-auralee-kit.zip',
        visibility: 'PUBLIC',
        downloadsCount: 89,
      },
    ],
  });

  console.log('✓ Resources seeded');

  // 13. Seed Connections & Sample Messages
  const conn1 = await prisma.connection.create({
    data: {
      requesterId: alexUser.id,
      receiverId: demoUser.id,
      status: 'ACCEPTED',
    },
  });

  const conv1 = await prisma.conversation.create({
    data: {
      participant1Id: alexUser.id,
      participant2Id: demoUser.id,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: alexUser.id,
        text: 'Hey Jordan! Saw you registered for tomorrow’s Java concurrency masterclass. Looking forward to having you!',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        conversationId: conv1.id,
        senderId: demoUser.id,
        text: 'Thanks Alex! Really excited. I have been debugging some lock contention issues in our lab assignment.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
      {
        conversationId: conv1.id,
        senderId: alexUser.id,
        text: 'Awesome, bring the code snippet to the session and we will walk through it during Q&A.',
        isRead: false,
        createdAt: new Date(Date.now() - 1800000),
      },
    ],
  });

  // 14. Seed Notifications for Demo Student
  await prisma.notification.createMany({
    data: [
      {
        recipientId: demoUser.id,
        title: 'Class Confirmed: Java Concurrency Masterclass',
        message: 'Your seat has been reserved for tomorrow at 4:00 PM PST with Alex Chen.',
        link: `/classes/${session1.id}`,
        type: 'CLASS',
        isRead: false,
      },
      {
        recipientId: demoUser.id,
        title: 'Karma Earned: +45 Points',
        message: 'Your dynamic programming cheatsheet was downloaded and verified by 5 students.',
        link: '/karma',
        type: 'KARMA',
        isRead: false,
      },
      {
        recipientId: demoUser.id,
        title: 'New Message from Alex Chen',
        message: 'Awesome, bring the code snippet to the session and we will walk through it...',
        link: '/chat',
        type: 'CONNECTION',
        isRead: false,
      },
    ],
  });

  console.log('✓ Notifications seeded');
  console.log('--- Database Seeding Complete ---');
  console.log('Demo Login: demo.student@stanford.edu | Password: password123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
