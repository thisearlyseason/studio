
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, X, Bell } from 'lucide-react';
import { useTeam } from '@/components/providers/team-provider';
import { toast } from '@/hooks/use-toast';

export function AlertOverlay() {
  const { alerts, activeTeam } = useTeam();
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [viewedAlerts, setViewedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (alerts.length > 0) {
      const latestAlert = alerts[0];
      
      // If we haven't seen this alert in this session, show it
      if (!viewedAlerts.has(latestAlert.id)) {
        setCurrentAlertId(latestAlert.id);
        setIsAlertOpen(true);
        setViewedAlerts(prev => new Set(prev).add(latestAlert.id));
        
        // Also show a toast notification
        toast({
          title: "New Team Alert!",
          description: latestAlert.title,
          variant: "default",
        });
      }
    }
  }, [alerts, viewedAlerts]);

  const latestAlert = alerts.find(a => a.id === currentAlertId);

  if (!latestAlert) return null;

  return (
    <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-primary rounded-3xl overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Megaphone className="h-32 w-32 -rotate-12" />
        </div>
        <DialogHeader className="pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary animate-bounce">
              <Bell className="h-6 w-6" />
            </div>
            <div className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">High Priority Alert</div>
          </div>
          <DialogTitle className="text-2xl font-black leading-tight tracking-tight">
            {latestAlert.title}
          </DialogTitle>
          <DialogDescription className="text-base font-medium pt-2 text-foreground/80 leading-relaxed">
            {latestAlert.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button 
            className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20" 
            onClick={() => setIsAlertOpen(false)}
          >
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateAlertButton() {
  const { createAlert, user, activeTeam } = useTeam();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin = activeTeam?.membersMap?.[user?.id || ''] === 'Admin';

  if (!isAdmin) return null;

  const handleCreate = () => {
    if (!title || !message) return;
    createAlert(title, message);
    setIsCreateOpen(false);
    setTitle('');
    setMessage('');
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-primary/20 text-primary hover:bg-primary/5">
          <Megaphone className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Broadcast Team Alert</DialogTitle>
          <DialogDescription>
            This will trigger a popup for every team member. Use only for urgent news.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Alert Headline</Label>
            <Input 
              placeholder="e.g. Practice Moved Indoors" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label>Detailed Message</Label>
            <Textarea 
              placeholder="Provide more context..." 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              className="rounded-xl min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            className="w-full rounded-2xl h-12 text-base font-bold" 
            onClick={handleCreate}
            disabled={!title || !message}
          >
            Send Alert Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
