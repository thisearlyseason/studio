
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'link';
import { useRouter } from 'next/navigation';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChatsPage() {
  const { activeTeam, chats, members, createChat } = useTeam();
  const router = useRouter();
  const [newChatName, setNewChatName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeTeam) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
        <div className="h-12 w-12 bg-primary/10 rounded-full mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Opening discussions...</p>
      </div>
    );
  }

  const teamChats = chats.filter(c => c.teamId === activeTeam.id);
  const teamMembers = members.filter(m => m.teamId === activeTeam.id);

  const handleCreateChat = async () => {
    if (!newChatName.trim()) return;
    const chatId = await createChat(newChatName, selectedMembers);
    setIsNewChatOpen(false);
    setNewChatName('');
    setSelectedMembers([]);
    router.push(`/chats/${chatId}`);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

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
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Group Chat</DialogTitle>
              <DialogDescription>
                Start a new discussion for {activeTeam.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chat Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Travel Planning, Tactics" 
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Select Team Members</Label>
                <ScrollArea className="h-48 border rounded-lg p-2">
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => toggleMember(member.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{member.name}</span>
                            <span className="text-[10px] text-muted-foreground">{member.position}</span>
                          </div>
                        </div>
                        <Checkbox checked={selectedMembers.includes(member.id)} onCheckedChange={() => {}} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter>
              <Button 
                className="w-full" 
                onClick={handleCreateChat}
                disabled={!newChatName.trim() || selectedMembers.length === 0}
              >
                Create Chat
              </Button>
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
                  <p className="text-sm text-muted-foreground truncate pr-6">{chat.lastMessage || 'No messages yet'}</p>
                </div>
                {chat.unread && chat.unread > 0 ? (
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
