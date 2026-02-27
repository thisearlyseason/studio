
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  addDoc, 
  orderBy,
  Firestore 
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  avatar: string;
};

export type Team = {
  id: string;
  name: string;
  code: string;
};

export type MemberPosition = 'Coach' | 'Team Lead' | 'Assistant Coach' | 'Squad Leader' | 'Player' | 'Parent' | string;

export type Member = {
  id: string;
  teamId: string;
  name: string;
  role: 'Admin' | 'Member';
  position: MemberPosition;
  jersey: string;
  avatar: string;
};

export type Chat = {
  id: string;
  teamId: string;
  name: string;
  memberIds: string[];
  lastMessage?: string;
  time?: string;
  unread?: number;
};

export type PollOption = {
  text: string;
  votes: number;
};

export type Message = {
  id: string;
  chatId: string;
  author: string;
  content?: string;
  type: 'text' | 'poll';
  createdAt: string;
  poll?: {
    id: string;
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVoted?: number;
    isClosed: boolean;
  };
};

export type Post = {
  id: string;
  teamId: string;
  author: { name: string; avatar: string };
  content: string;
  type: 'user' | 'system';
  imageUrl?: string;
  createdAt: string;
  comments: Comment[];
};

export type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

export type RSVPStatus = 'going' | 'notGoing' | 'maybe';

export type EventRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type TeamEvent = {
  id: string;
  teamId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime?: string;
  location: string;
  description: string;
  recurrence: EventRecurrence;
  rsvps: { going: number; notGoing: number; maybe: number };
  userRsvp?: RSVPStatus;
};

export type TeamFile = {
  id: string;
  teamId: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: Date;
};

interface TeamContextType {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => void;
  activeTeam: Team | null;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  members: Member[];
  updateMember: (id: string, updates: Partial<Member>) => void;
  chats: Chat[];
  createChat: (name: string, memberIds: string[]) => Promise<string>;
  messages: Message[];
  addMessage: (chatId: string, author: string, content: string, type: 'text' | 'poll', poll?: any) => void;
  posts: Post[];
  addPost: (content: string, imageUrl?: string) => void;
  addComment: (postId: string, content: string) => void;
  events: TeamEvent[];
  addEvent: (event: Omit<TeamEvent, 'id' | 'teamId' | 'rsvps'>) => void;
  updateRSVP: (eventId: string, status: RSVPStatus) => void;
  files: TeamFile[];
  addFile: (name: string, type: string, size: string) => void;
  createNewTeam: (name: string, organizerPosition: string) => Promise<void>;
  inviteMember: (name: string, position: MemberPosition) => void;
  isLoading: boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading: isAuthLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch User Profile
  useEffect(() => {
    if (firebaseUser) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            name: data.fullName || firebaseUser.displayName || 'Anonymous',
            email: data.email || firebaseUser.email || '',
            phone: data.phone || '',
            avatar: data.avatarUrl || `https://picsum.photos/seed/${firebaseUser.uid}/150/150`
          });
        }
      };
      fetchProfile();
    }
  }, [firebaseUser, db]);

  // Fetch Teams
  const teamsQuery = useMemoFirebase(() => {
    if (!firebaseUser || !db) return null;
    return collection(db, 'teams'); // In production, this would be a membership query
  }, [firebaseUser?.uid, db]);
  const { data: teamsData } = useCollection(teamsQuery);
  const teams = (teamsData || []).map(t => ({ id: t.id, name: t.teamName, code: t.teamCode }));

  useEffect(() => {
    if (teams.length > 0 && !activeTeam) {
      setActiveTeam(teams[0]);
    }
  }, [teams, activeTeam]);

  // Fetch Members
  const membersQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return collection(db, 'teams', activeTeam.id, 'members');
  }, [activeTeam?.id, db]);
  const { data: membersData } = useCollection(membersQuery);
  const members: Member[] = (membersData || []).map(m => ({
    id: m.userId,
    teamId: m.teamId,
    name: m.name || 'Member',
    role: m.role,
    position: m.position || 'Player',
    jersey: m.jersey || 'TBD',
    avatar: m.avatar || `https://picsum.photos/seed/${m.userId}/150/150`
  }));

  // Fetch Posts
  const postsQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'feedPosts'), orderBy('createdAt', 'desc'));
  }, [activeTeam?.id, db]);
  const { data: postsData } = useCollection(postsQuery);
  
  // Note: Comments would ideally be fetched per post in the component or via a more complex query.
  // For MVP, we'll keep them as a mock or simple subcollection lookup.
  const posts: Post[] = (postsData || []).map(p => ({
    id: p.id,
    teamId: p.teamId,
    author: p.author || { name: 'Anonymous', avatar: '' },
    content: p.content,
    type: p.type || 'user',
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    comments: [] // To be fetched in a more detailed implementation
  }));

  // Fetch Events
  const eventsQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'events'), orderBy('date', 'asc'));
  }, [activeTeam?.id, db]);
  const { data: eventsData } = useCollection(eventsQuery);
  const events: TeamEvent[] = (eventsData || []).map(e => ({
    id: e.id,
    teamId: e.teamId,
    title: e.title,
    date: new Date(e.date),
    startTime: e.startTime,
    endTime: e.endTime,
    location: e.location,
    description: e.description,
    recurrence: e.recurrence || 'none',
    rsvps: e.rsvps || { going: 0, notGoing: 0, maybe: 0 },
    userRsvp: e.userRsvps?.[firebaseUser?.uid || '']
  }));

  // Methods
  const updateUser = (updates: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    const docRef = doc(db, 'users', firebaseUser.uid);
    updateDoc(docRef, {
      fullName: updates.name,
      email: updates.email,
      phone: updates.phone
    }).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
    });
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    if (!activeTeam) return;
    const docRef = doc(db, 'teams', activeTeam.id, 'members', id);
    updateDoc(docRef, updates).catch(err => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
    });
  };

  const createChat = async (name: string, memberIds: string[]) => {
    if (!activeTeam || !firebaseUser) return '';
    const colRef = collection(db, 'teams', activeTeam.id, 'groupChats');
    const newChat = {
      teamId: activeTeam.id,
      name,
      createdBy: firebaseUser.uid,
      memberIds: [firebaseUser.uid, ...memberIds],
      createdAt: new Date().toISOString(),
      isDeleted: false
    };
    const docRef = await addDoc(colRef, newChat);
    return docRef.id;
  };

  const addMessage = (chatId: string, author: string, content: string, type: 'text' | 'poll', poll?: any) => {
    if (!activeTeam) return;
    const colRef = collection(db, 'teams', activeTeam.id, 'groupChats', chatId, 'messages');
    addDoc(colRef, {
      chatId,
      authorId: firebaseUser?.uid,
      authorName: author,
      content,
      type,
      pollData: poll || null,
      createdAt: new Date().toISOString()
    });
  };

  const addPost = (content: string, imageUrl?: string) => {
    if (!activeTeam || !userProfile || !firebaseUser) return;
    const colRef = collection(db, 'teams', activeTeam.id, 'feedPosts');
    addDoc(colRef, {
      teamId: activeTeam.id,
      author: { name: userProfile.name, avatar: userProfile.avatar },
      authorId: firebaseUser.uid,
      content,
      type: 'user',
      imageUrl: imageUrl || '',
      createdAt: new Date().toISOString()
    });
  };

  const addComment = (postId: string, content: string) => {
    if (!activeTeam || !userProfile || !firebaseUser) return;
    const colRef = collection(db, 'teams', activeTeam.id, 'feedPosts', postId, 'comments');
    addDoc(colRef, {
      postId,
      authorId: firebaseUser.uid,
      authorName: userProfile.name,
      content,
      createdAt: new Date().toISOString()
    });
  };

  const addEvent = (eventData: Omit<TeamEvent, 'id' | 'teamId' | 'rsvps'>) => {
    if (!activeTeam || !firebaseUser) return;
    const colRef = collection(db, 'teams', activeTeam.id, 'events');
    addDoc(colRef, {
      ...eventData,
      teamId: activeTeam.id,
      date: eventData.date.toISOString(),
      createdBy: firebaseUser.uid,
      createdAt: new Date().toISOString(),
      rsvps: { going: 1, notGoing: 0, maybe: 0 },
      userRsvps: { [firebaseUser.uid]: 'going' }
    });
  };

  const updateRSVP = (eventId: string, status: RSVPStatus) => {
    if (!activeTeam || !firebaseUser) return;
    const docRef = doc(db, 'teams', activeTeam.id, 'events', eventId);
    // In production, use transaction to update counts
    updateDoc(docRef, {
      [`userRsvps.${firebaseUser.uid}`]: status
    });
  };

  const addFile = (name: string, type: string, size: string) => {
    if (!activeTeam || !userProfile || !firebaseUser) return;
    const colRef = collection(db, 'teams', activeTeam.id, 'files');
    addDoc(colRef, {
      teamId: activeTeam.id,
      fileName: name,
      fileType: type,
      fileSize: size,
      uploadedBy: firebaseUser.uid,
      uploaderName: userProfile.name,
      createdAt: new Date().toISOString()
    });
  };

  const createNewTeam = async (name: string, organizerPosition: string) => {
    if (!firebaseUser) return;
    const teamId = `team_${Date.now()}`;
    const teamCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await setDoc(doc(db, 'teams', teamId), {
      id: teamId,
      teamName: name,
      sport: 'General',
      teamCode: teamCode,
      createdBy: firebaseUser.uid,
      createdAt: new Date().toISOString(),
      members: { [firebaseUser.uid]: 'Admin' }
    });

    await setDoc(doc(db, 'teams', teamId, 'members', firebaseUser.uid), {
      userId: firebaseUser.uid,
      teamId: teamId,
      role: 'Admin',
      position: organizerPosition || 'Coach',
      name: userProfile?.name || 'Organizer',
      joinedAt: new Date().toISOString()
    });

    setActiveTeam({ id: teamId, name, code: teamCode });
  };

  const inviteMember = (name: string, position: MemberPosition) => {
    if (!activeTeam) return;
    const teamId = activeTeam.id;
    const mockUserId = `invited_${Date.now()}`;
    setDoc(doc(db, 'teams', teamId, 'members', mockUserId), {
      userId: mockUserId,
      teamId: teamId,
      role: 'Member',
      position,
      name,
      joinedAt: new Date().toISOString()
    });
  };

  const chats: Chat[] = []; // Similar useCollection logic would go here
  const messages: Message[] = []; // Similar useCollection logic would go here
  const files: TeamFile[] = []; // Similar useCollection logic would go here

  return (
    <TeamContext.Provider value={{ 
      user: userProfile,
      updateUser,
      activeTeam, 
      setActiveTeam, 
      teams, 
      members, 
      updateMember,
      chats,
      createChat,
      messages,
      addMessage,
      posts,
      addPost,
      addComment,
      events,
      addEvent,
      updateRSVP,
      files,
      addFile,
      createNewTeam,
      inviteMember,
      isLoading: isAuthLoading
    }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
