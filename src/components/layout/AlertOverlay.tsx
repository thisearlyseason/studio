
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Megaphone, Bell, Info, History, Clock, X, Lock, Users, ShieldAlert, GraduationCap, Baby } from 'lucide-react';
import { useTeam, TeamAlert } from '@/components/providers/team-provider';
import { formatDistanceToNow } from 'date-fns';

const SEEN_ALERTS_KEY = 'squad_seen_alerts_ids';

/**
 * Handles the automatic one-time popup for high priority alerts
 * respecting the target audience.
 */
export function AlertOverlay() {
  const { alerts = [], user, isStaff, isPlayer, isParent } = useTeam();
  const [currentAlertId, setCurrentAlertId] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SEEN_ALERTS_KEY);
    if (stored) {
      try {
        setSeenIds(JSON.parse(stored));
      } catch (e) {}
    }
    setHasInitialized(true);
  }, []);

  // Filter alerts based on current user role/audience
  const myAlerts = alerts.filter(alert => {
    if (alert.audience === 'everyone') return true;
    if (alert.audience === 'coaches' && isStaff) return true;
    if (alert.audience === 'players' && isPlayer) return true;
    if (alert.audience === 'parents' && isParent) return true;
    return false;
  });

  useEffect(() => {
    if (!hasInitialized || myAlerts.length === 0) return;

    const unseenAlert = myAlerts.find(a => !seenIds.includes(a.id));
    if (unseenAlert && !isAlertOpen) {
      setCurrentAlertId(unseenAlert.id);
      setIsAlertOpen(true);
    }
  }, [myAlerts, seenIds, isAlertOpen, hasInitialized]);

  const markAsSeen = (id: string) => {
    setSeenIds(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleUnderstood = () => {
    if (currentAlertId) markAsSeen(currentAlertId);
    setIsAlertOpen(false);
  };

  const latestAlert = myAlerts.find(a => a.id === currentAlertId);
  if (!latestAlert) return null;

  return (
    <Dialog open={isAlertOpen} onOpenChange={(open) => {
      if (!open) {
        if (currentAlertId) markAsSeen(currentAlertId);
        setIsAlertOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-md border-t-4 border-t-primary rounded-3xl overflow-hidden">
        <DialogTitle className="sr-only">Priority Broadcast: {latestAlert.title}</DialogTitle>
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
          <Button className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-primary/20" onClick={handleUnderstood}>
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AlertsHistoryDialog({ children }: { children: React.ReactNode }) {
  const { alerts = [], isStaff, isPlayer, isParent } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SEEN_ALERTS_KEY);
    if (stored) {
      try {
        setSeenIds(JSON.parse(stored));
      } catch (e) {}
    }
  }, [isOpen]);

  const myAlerts = alerts.filter(alert => {
    if (alert.audience === 'everyone') return true;
    if (alert.audience === 'coaches' && isStaff) return true;
    if (alert.audience === 'players' && isPlayer) return true;
    if (alert.audience === 'parents' && isParent) return true;
    return false;
  });

  const markAllAsSeen = () => {
    const allIds = myAlerts.map(a => a.id);
    localStorage.setItem(SEEN_ALERTS_KEY, JSON.stringify(allIds));
    setSeenIds(allIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Squad Alert Inbox</DialogTitle>
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Alerts</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-7" onClick={markAllAsSeen}>
              Mark all read
            </Button>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] px-6 pb-6">
          <div className="space-y-4 pt-4">
            {myAlerts.length > 0 ? myAlerts.map((alert) => (
              <div key={alert.id} className="group relative p-4 rounded-2xl bg-muted/30 border-2 border-transparent hover:border-primary/10 transition-all">
                {!seenIds.includes(alert.id) && (
                  <div className="absolute top-4 right-4 h-2 w-2 bg-primary rounded-full animate-pulse" />
                )}
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm border shrink-0">
                    <Megaphone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-black text-sm tracking-tight leading-tight uppercase truncate">{alert.title}</h4>
                      <Badge variant="outline" className="text-[7px] font-black uppercase px-1 h-4 border-primary/20 text-primary">{alert.audience}</Badge>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-1.5 mt-3 opacity-50">
                      <Clock className="h-3 w-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12 opacity-30">
                <Bell className="h-10 w-10 mx-auto mb-2" />
                <p className="text-xs font-black uppercase">No active alerts</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function CreateAlertButton() {
  const { createAlert, activeTeam, isSuperAdmin, purchasePro } = useTeam();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<TeamAlert['audience']>('everyone');

  const isAdmin = activeTeam?.role === 'Admin' || isSuperAdmin;
  const canAlert = activeTeam?.isPro || isSuperAdmin;

  if (!isAdmin) return null;

  if (!canAlert) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-primary/20 text-primary/40 opacity-50 relative" onClick={purchasePro}>
        <Megaphone className="h-4 w-4" />
        <Lock className="absolute -top-1 -right-1 h-3 w-3 bg-black text-white p-0.5 rounded-full border-2 border-background" />
      </Button>
    );
  }

  const handleCreate = () => {
    if (!title || !message) return;
    createAlert(title, message, audience);
    setIsCreateOpen(false);
    setTitle('');
    setMessage('');
    setAudience('everyone');
  };

  return (
    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-10 w-10 md:h-9 md:w-9 rounded-full border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
          <Megaphone className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl overflow-hidden p-0">
        <div className="h-2 bg-primary w-full" />
        <div className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight">Deploy Broadcast</DialogTitle>
            <DialogDescription className="font-bold text-primary uppercase text-[10px] tracking-widest">Targeted High-Priority Messaging</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Target Audience</Label>
              <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
                <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="everyone" className="font-bold uppercase text-[10px]"><div className="flex items-center gap-2"><Users className="h-3 w-3" /> Everyone</div></SelectItem>
                  <SelectItem value="coaches" className="font-bold uppercase text-[10px]"><div className="flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> Coaches & Staff</div></SelectItem>
                  <SelectItem value="players" className="font-bold uppercase text-[10px]"><div className="flex items-center gap-2"><GraduationCap className="h-3 w-3" /> Players Only</div></SelectItem>
                  <SelectItem value="parents" className="font-bold uppercase text-[10px]"><div className="flex items-center gap-2"><Baby className="h-3 w-3" /> Parents Only</div></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Headline</Label>
              <Input placeholder="e.g. Schedule Conflict Resolved" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl h-12 border-2 font-black" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Tactical Brief</Label>
              <Textarea placeholder="Context for the squad..." value={message} onChange={e => setMessage(e.target.value)} className="rounded-xl min-h-[100px] border-2 font-medium" />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={handleCreate} disabled={!title || !message}>Dispatch Alert</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
