
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Team = {
  id: string;
  name: string;
  code: string;
};

type Member = {
  id: string;
  teamId: string;
  name: string;
  role: 'Admin' | 'Member';
  position: string;
  jersey: string;
  avatar: string;
};

type Chat = {
  id: string;
  teamId: string;
  name: string;
  memberIds: string[];
  lastMessage?: string;
  time?: string;
  unread?: number;
};

type Message = {
  id: string;
  chatId: string;
  author: string;
  content?: string;
  type: 'text' | 'poll';
  createdAt: string;
  poll?: {
    id: string;
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    userVoted?: number;
    isClosed: boolean;
  };
};

const MOCK_TEAMS: Team[] = [
  { id: '1', name: 'Eagles Soccer Club', code: 'EAGL01' },
  { id: '2', name: 'Wildcats Basketball', code: 'CAT99X' }
];

const INITIAL_MEMBERS: Member[] = [
  { id: '1', teamId: '1', name: 'James Miller', role: 'Admin', position: 'Head Coach', jersey: 'COACH', avatar: 'https://picsum.photos/seed/coach/150/150' },
  { id: '2', teamId: '1', name: 'Alex Smith', role: 'Member', position: 'Striker', jersey: '10', avatar: 'https://picsum.photos/seed/alex/150/150' },
  { id: '3', teamId: '1', name: 'Sarah Connor', role: 'Member', position: 'Midfield', jersey: '08', avatar: 'https://picsum.photos/seed/sarah/150/150' },
  { id: '4', teamId: '2', name: 'Mike Ross', role: 'Member', position: 'Point Guard', jersey: '04', avatar: 'https://picsum.photos/seed/mike/150/150' },
  { id: '5', teamId: '2', name: 'Donna Paulsen', role: 'Admin', position: 'Manager', jersey: 'MGR', avatar: 'https://picsum.photos/seed/donna/150/150' },
];

const INITIAL_CHATS: Chat[] = [
  { id: 'c1', teamId: '1', name: 'General Discussion', memberIds: ['1', '2', '3'], lastMessage: 'Training tomorrow is at 7am sharp!', time: '2m ago', unread: 3 },
  { id: 'c2', teamId: '1', name: 'Offense Strategy', memberIds: ['1', '2'], lastMessage: 'Check out this play idea...', time: '1h ago', unread: 0 },
];

const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', chatId: 'c1', author: 'Coach', content: "Hey team, let's vote on the dinner spot for Friday.", type: 'text', createdAt: '10:00 AM' },
  { 
    id: 'm2', 
    chatId: 'c1',
    author: 'Coach', 
    type: 'poll', 
    poll: {
      id: 'p1',
      question: 'Friday Night Team Dinner?',
      options: [
        { text: 'Luigi\'s Pizza', votes: 8 },
        { text: 'Burger Barn', votes: 4 },
        { text: 'Sushi Express', votes: 2 }
      ],
      totalVotes: 14,
      userVoted: 0,
      isClosed: false
    },
    createdAt: '10:01 AM'
  }
];

interface TeamContextType {
  activeTeam: Team;
  setActiveTeam: (team: Team) => void;
  teams: Team[];
  members: Member[];
  updateMember: (id: string, updates: Partial<Member>) => void;
  chats: Chat[];
  createChat: (name: string, memberIds: string[]) => string;
  messages: Message[];
  addMessage: (chatId: string, author: string, content: string, type: 'text' | 'poll', poll?: any) => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [activeTeam, setActiveTeam] = useState<Team>(MOCK_TEAMS[0]);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const createChat = (name: string, memberIds: string[]) => {
    const id = `c${Date.now()}`;
    const newChat: Chat = {
      id,
      teamId: activeTeam.id,
      name,
      memberIds,
      time: 'Just now',
      unread: 0
    };
    setChats(prev => [...prev, newChat]);
    return id;
  };

  const addMessage = (chatId: string, author: string, content: string, type: 'text' | 'poll', poll?: any) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      chatId,
      author,
      content,
      type,
      poll,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, lastMessage: content || 'Poll created', time: 'Just now' } : c));
  };

  return (
    <TeamContext.Provider value={{ 
      activeTeam, 
      setActiveTeam, 
      teams: MOCK_TEAMS, 
      members, 
      updateMember,
      chats,
      createChat,
      messages,
      addMessage
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
