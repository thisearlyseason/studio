
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, ChevronRight, Hash } from 'lucide-react';
import { useTeam } from '@/components/providers/team-provider';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MOCK_CHATS = [
  {
    id: '1',
    teamId: '1',
    name: 'General Discussion',
    lastMessage: 'Coach: Training tomorrow is at 7am sharp!',
    time: '2m ago',
    unread: 3
  },
  {
    id: '2',
    teamId: '1',
    name: 'Offense Strategy',
    lastMessage: 'Alex: Check out this play idea...',
    time: '1h ago',
    unread: 0
  },
  {
    id: '3',
    teamId: '2',
    name: 'Basketball Tactics',
    lastMessage: 'Sarah: I sent out the carpool info.',
    time: 'Yesterday',
    unread: 0
  }
];

export default function ChatsPage() {
  const { activeTeam } = useTeam();
  const [newChatName, setNewChatName] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const teamChats = MOCK_CHATS.filter(c => c.teamId === activeTeam.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
              <DialogDescription>
                Start a new discussion for {activeTeam.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chat Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Travel Planning, Tactics" 
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsNewChatOpen(false)}>Create Chat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {teamChats.length > 0 ? teamChats.map((chat) => (
          <Link key={chat.id} href={`/chats/${chat.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer group mb-3">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Hash className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-bold truncate">{chat.name}</h3>
                    <span className="text-[10px] text-muted-foreground font-medium">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate pr-6">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 ? (
                  <div className="bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">
                    {chat.unread}
                  </div>
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
              </CardContent>
            </Card>
          </Link>
        )) : (
          <div className="text-center py-12 border-2 border-dashed rounded-2xl">
            <p className="text-muted-foreground italic">No chats found for this team.</p>
          </div>
        )}
      </div>
      
      <div className="bg-secondary/10 rounded-2xl p-6 text-center space-y-3 border border-secondary/20">
        <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <MessageSquare className="h-6 w-6 text-secondary" />
        </div>
        <h3 className="font-bold text-lg">Need to coordinate?</h3>
        <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
          Create group chats for specific positions, game strategies, or event planning.
        </p>
        <Button variant="secondary" className="w-full max-w-[200px]" onClick={() => setIsNewChatOpen(true)}>Start a Discussion</Button>
      </div>
    </div>
  );
}
