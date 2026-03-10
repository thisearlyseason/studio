
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Plus, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Users, 
  Link as LinkIcon, 
  Trash2, 
  Edit3, 
  Copy,
  Trophy,
  CalendarDays,
  Lock,
  Sparkles,
  ChevronLeft,
  Loader2,
  CalendarPlus,
  ShieldCheck,
  Share2,
  Check,
  Zap,
  X,
  ShieldAlert,
  Signature,
  Wand2,
  Timer,
  FileText,
  ExternalLink,
  Globe,
  Settings,
  LayoutGrid,
  Circle
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTeam, TeamEvent, TournamentGame, EventType } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isSameDay, isPast, addMinutes, addDays, parse } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { generateGoogleCalendarLink, downloadICS } from '@/lib/calendar-utils';
import { Switch } from '@/components/ui/switch';

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  game: 'bg-primary text-white border-primary',
  practice: 'bg-emerald-600 text-white border-emerald-600',
  meeting: 'bg-amber-500 text-white border-amber-500',
  tournament: 'bg-black text-white border-black',
  other: 'bg-slate-600 text-white border-slate-600',
};

const formatDateRange = (start: string | Date, end?: string | Date) => {
  const startDate = new Date(start);
  if (!end) return format(startDate, 'MMM dd');
  const endDate = new Date(end);
  if (isSameDay(startDate, endDate)) return format(startDate, 'MMM dd');
  if (startDate.getMonth() === endDate.getMonth()) return `${format(startDate, 'MMM d')}-${format(endDate, 'd')}`;
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
};

function calculateTournamentStandings(teams: string[], games: TournamentGame[]) {
  const standings = teams.reduce((acc, team) => {
    acc[team] = { name: team, wins: 0, losses: 0, ties: 0, points: 0 };
    return acc;
  }, {} as Record<string, any>);
  games.forEach(game => {
    if (!game.isCompleted) return;
    const t1 = game.team1; const t2 = game.team2;
    if (!standings[t1]) standings[t1] = { name: t1, wins: 0, losses: 0, ties: 0, points: 0 };
    if (!standings[t2]) standings[t2] = { name: t2, wins: 0, losses: 0, ties: 0, points: 0 };
    if (game.score1 > game.score2) { standings[t1].wins += 1; standings[t1].points += 1; standings[t2].losses += 1; standings[t2].points -= 1; }
    else if (game.score2 > game.score1) { standings[t2].wins += 1; standings[t2].points += 1; standings[t1].losses += 1; standings[t1].points -= 1; }
    else { standings[t1].ties += 1; standings[t2].ties += 1; }
  });
  return Object.values(standings).sort((a, b) => b.points - a.points || b.wins - a.wins);
}

function EventHubContent({ eventId, teamId, updateRSVP, formatTime, isAdmin, onEdit, onDelete, hasAttendance, purchasePro }: any) {
  const { members = [], user, updateEvent, submitEventWaiver, signTeamTournamentWaiver, addCoOrganizerByEmail, removeCoOrganizer, isPro, activeTeam, isParent, isPlayer, hasFeature } = useTeam();
  const db = useFirestore();
  const router = useRouter();

  const eventDocRef = useMemoFirebase(() => db ? doc(db, 'teams', teamId, 'events', eventId) : null, [db, teamId, eventId]);
  const { data: event, isLoading: isEventLoading } = useDoc<TeamEvent>(eventDocRef);

  const regQuery = useMemoFirebase(() => {
    if (!db || !eventId || !teamId) return null;
    return query(collection(db, 'teams', teamId, 'events', eventId, 'registrations'), orderBy('createdAt', 'desc'));
  }, [db, eventId, teamId]);
  const { data: rawRegistrations } = useCollection<any>(regQuery);
  const registrations = rawRegistrations || [];

  const [editingGame, setEditingGame] = useState<TournamentGame | null>(null);
  const [isWaiverDialogOpen, setIsWaiverDialogOpen] = useState(false);
  const [isTeamAgreementOpen, setIsTeamAgreementOpen] = useState(false);
  const [isGenConfirmOpen, setIsGenConfirmOpen] = useState(false);
  const [coOrganizerEmail, setCoOrganizerEmail] = useState('');
  const [origin, setOrigin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { if (typeof window !== 'undefined') setOrigin(window.location.origin); }, []);

  const tournamentStandings = useMemo(() => (event?.isTournament && event.tournamentTeams) ? calculateTournamentStandings(event.tournamentTeams, event.tournamentGames || []) : [], [event]);
  
  const groupedGames = useMemo(() => {
    if (!event?.tournamentGames) return {};
    const groups: Record<string, TournamentGame[]> = {};
    [...event.tournamentGames].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(game => {
      const key = game.pool ? `Pool ${game.pool}` : format(new Date(game.date), 'EEEE, MMM d');
      if (!groups[key]) groups[key] = [];
      groups[key].push(game);
    });
    return groups;
  }, [event?.tournamentGames]);

  if (isEventLoading || !event) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" /></div>;

  const currentStatus = event.userRsvps?.[user?.id || ''];
  const hasUserSignedIndividualWaiver = !!event.specialWaiverResponses?.[user?.id || '']?.agreed;
  const myParticipatingTeamName = event.tournamentTeams?.find(tn => tn.toLowerCase() === activeTeam?.name.toLowerCase());
  const isWaiverSignedForMyTeam = myParticipatingTeamName ? !!event.teamAgreements?.[myParticipatingTeamName]?.agreed : false;

  const attendanceData = [...Object.entries(event.userRsvps || {}).map(([uid, status]) => {
    const member = members.find(m => m.userId === uid);
    return { id: uid, name: member?.name || 'Teammate', avatar: member?.avatar, role: member?.position || 'Member', status };
  }), ...registrations.map(reg => ({ id: reg.id, name: reg.name, avatar: undefined, role: 'Public Registrant', status: 'going' }))];

  const canUseTournaments = hasFeature('elite_tournament');

  if (event.isTournament && !canUseTournaments) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="bg-primary/5 p-8 rounded-[3rem] shadow-inner">
          <Trophy className="h-16 w-16 text-primary opacity-20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase">Tournament Hub Locked</h2>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Upgrade this team to Pro to unlock this feature.</p>
        </div>
        <Button onClick={purchasePro} className="h-12 px-10 rounded-xl font-black uppercase">Unlock Pro Hub</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-full">
      <div className="w-full lg:w-1/3 flex flex-col text-white bg-black lg:border-r border-white/10 shrink-0">
        <div className="p-6 lg:p-8 flex justify-between items-start">
          <Badge className={cn("uppercase font-black tracking-widest text-[9px] h-6 px-3", event.isTournamentPaid ? "bg-primary text-white border-none" : "bg-white text-black border-none")}>
            {event.isTournament ? (event.isTournamentPaid ? "Elite Hub" : "Tournament Hub") : (event.eventType || 'other').toUpperCase()}
          </Badge>
          <DialogClose asChild><X className="h-5 w-5 text-white/40 cursor-pointer hover:text-white" /></DialogClose>
        </div>
        <div className="flex-1 px-6 lg:px-8 space-y-8 pb-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-4xl font-black tracking-tighter leading-tight uppercase">{event.title}</h2>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Official Coordination Hub</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-3 font-bold text-sm"><CalendarDays className={cn("h-4 w-4", event.isTournamentPaid ? "text-primary" : "text-white/40")} /><span>{formatDateRange(event.date, event.endDate)}</span></div>
                <div className="flex items-center gap-3 font-bold text-sm"><Clock className={cn("h-4 w-4", event.isTournamentPaid ? "text-primary" : "text-white/40")} /><span>{event.startTime}</span></div>
                <div className="flex items-center gap-3 font-bold text-sm"><MapPin className={cn("h-4 w-4", event.isTournamentPaid ? "text-primary" : "text-white/40")} /><span className="truncate">{event.location}</span></div>
              </div>
              {event.requiresSpecialWaiver && !hasUserSignedIndividualWaiver && (<Button onClick={() => setIsWaiverDialogOpen(true)} className="w-full rounded-xl h-14 font-black text-sm uppercase gap-3 bg-red-600 text-white shadow-xl">Sign Required Waiver</Button>)}
              {myParticipatingTeamName && !isWaiverSignedForMyTeam && (<Button onClick={() => setIsTeamAgreementOpen(true)} className={cn("w-full rounded-xl h-14 font-black text-sm uppercase gap-3 text-white shadow-xl", event.isTournamentPaid ? "bg-primary" : "bg-white text-black")}>Sign for {myParticipatingTeamName}</Button>)}
            </div>
          </div>
          {event.isTournament && tournamentStandings.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-white/40 tracking-[0.2em] px-1">Leaderboard</h4>
              <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden">
                {tournamentStandings.map((team, i) => (
                  <div key={team.name} className="flex justify-between items-center px-5 py-4 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3 min-w-0"><span className="text-[10px] font-black text-white/60 w-4">{i + 1}</span><span className="text-xs font-black uppercase truncate pr-2">{team.name}</span></div>
                    <Badge className={cn("border-none font-black text-[9px] px-2 h-5 shrink-0", event.isTournamentPaid ? "bg-primary text-white" : "bg-white text-black")}>{team.points} PTS</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {isAdmin && (<div className="p-6 border-t border-white/10 flex gap-3 mt-auto"><Button variant="secondary" className="flex-1 rounded-xl h-12 font-black uppercase text-[10px] bg-white/10 text-white hover:bg-white/20" onClick={() => onEdit(event)}><Edit3 className="h-4 w-4 mr-2" /> Edit Hub</Button><Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-white hover:bg-red-500/20" onClick={() => onDelete(event.id)}><Trash2 className="h-4 w-4" /></Button></div>)}
      </div>
      <div className="flex-1 flex flex-col bg-background">
        <Tabs defaultValue={event.isTournament ? "bracket" : "roster"} className="flex-1">
          <div className="px-6 lg:px-10 py-6 border-b bg-muted/30 sticky top-0 z-20 backdrop-blur-md">
            <TabsList className="bg-white/50 h-14 p-1.5 rounded-2xl shadow-inner border w-full lg:w-fit">
              {event.isTournament && (<TabsTrigger value="bracket" className="rounded-xl font-black text-[10px] lg:text-xs uppercase px-4 lg:px-8 flex-1 lg:flex-none data-[state=active]:bg-black data-[state=active]:text-white">Schedule</TabsTrigger>)}
              <TabsTrigger value="roster" className="rounded-xl font-black text-[10px] lg:text-xs uppercase px-4 lg:px-8 flex-1 lg:flex-none data-[state=active]:bg-black data-[state=active]:text-white">Roster</TabsTrigger>
              {isAdmin && (<TabsTrigger value="manage" className="rounded-xl font-black text-[10px] lg:text-xs uppercase px-4 lg:px-8 flex-1 lg:flex-none data-[state=active]:bg-primary data-[state=active]:text-white">Manage Hub</TabsTrigger>)}
            </TabsList>
          </div>
          <div className="p-6 lg:p-10 pb-32">
            <TabsContent value="roster" className="mt-0 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceData.filter(a => a.status === 'going').map(person => (
                  <div key={person.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border shadow-sm">
                    <Avatar className="h-12 w-12 rounded-xl border shadow-sm"><AvatarFallback className="font-black bg-muted text-xs">{person.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1"><p className="font-black text-sm uppercase truncate leading-none mb-1">{person.name}</p><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{person.role}</p></div>
                    <div className="bg-green-500 h-2 w-2 rounded-full" />
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        {!isParent && !event.isTournament && (
          <div className="p-6 border-t bg-muted/20 shrink-0 z-20 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="text-center sm:text-left space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Activity Response</p>
                <p className="text-xs font-medium text-foreground/60 italic">Your status updates the squad roster.</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" className={cn("flex-1 sm:w-28 h-12 rounded-xl font-black text-[10px] uppercase", currentStatus === 'notGoing' ? "bg-red-600 text-white border-red-600" : "bg-white border-2")} onClick={() => updateRSVP(event.id, 'notGoing')}>Decline</Button>
                <Button variant="outline" className={cn("flex-1 sm:w-28 h-12 rounded-xl font-black text-[10px] uppercase", currentStatus === 'maybe' ? "bg-amber-500 text-white border-amber-500" : "bg-white border-2")} onClick={() => updateRSVP(event.id, 'maybe')}>Maybe</Button>
                <Button variant="outline" className={cn("flex-1 sm:w-40 h-12 rounded-xl font-black text-xs uppercase", currentStatus === 'going' ? "bg-green-600 text-white border-green-600" : "bg-white border-2")} onClick={() => updateRSVP(event.id, 'going')}><CheckCircle2 className="h-4 w-4 mr-2" /> I'm Going</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetailDialog({ event, updateRSVP, formatTime, isAdmin, onEdit, onDelete, hasAttendance, purchasePro, children }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-7xl p-0 sm:rounded-[2.5rem] h-[100dvh] sm:h-[90vh] border-none shadow-2xl overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{event.title} Hub</DialogTitle>
        {isOpen && (
          <EventHubContent 
            eventId={event.id} 
            teamId={event.teamId} 
            updateRSVP={updateRSVP} 
            formatTime={formatTime} 
            isAdmin={isAdmin} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            hasAttendance={hasAttendance} 
            purchasePro={purchasePro} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function EventsPage() {
  const { activeTeam, addEvent, updateEvent, deleteEvent, updateRSVP, formatTime, isSuperAdmin, purchasePro, isStaff, user, hasFeature, isPro } = useTeam();
  const db = useFirestore();
  const [filterMode, setFilterMode] = useState<'live' | 'past'>('live');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [isEliteTournament, setIsEliteTournament] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TeamEvent | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('game');
  const [requiresWaiver, setRequiresWaiver] = useState(false);
  const [waiverText, setWaiverText] = useState('');
  const [teamWaiverText, setTeamWaiverText] = useState('');

  const eventsQuery = useMemoFirebase(() => { if (!activeTeam?.id || !db) return null; return query(collection(db, 'teams', activeTeam.id, 'events'), orderBy('date', 'asc')); }, [activeTeam?.id, db]);
  const { data: rawEvents } = useCollection<TeamEvent>(eventsQuery);
  const allEvents = rawEvents || [];
  
  const filteredEvents = useMemo(() => {
    const now = new Date();
    if (filterMode === 'live') {
      return allEvents.filter(e => {
        const d = new Date(e.date);
        return !isPast(d) || isSameDay(d, now);
      });
    }
    return allEvents.filter(e => {
      const d = new Date(e.date);
      return isPast(d) && !isSameDay(d, now);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, filterMode]);

  const isAdmin = activeTeam?.role === 'Admin' || isSuperAdmin;

  const handleEdit = (event: TeamEvent) => { 
    setEditingEvent(event); 
    setIsTournamentMode(!!event.isTournament); 
    setIsEliteTournament(!!event.isTournamentPaid); 
    setNewTitle(event.title); 
    setEventType(event.eventType || (event.isTournament ? 'tournament' : 'game'));
    const d = new Date(event.date);
    setNewDate(format(d, 'yyyy-MM-dd')); 
    if (event.endDate) setNewEndDate(format(new Date(event.endDate), 'yyyy-MM-dd')); 
    setNewTime(event.startTime); 
    setNewLocation(event.location); 
    setNewDescription(event.description); 
    setRequiresWaiver(!!event.requiresSpecialWaiver); 
    setWaiverText(event.specialWaiverText || ''); 
    setTeamWaiverText(event.teamWaiverText || ''); 
    setIsCreateOpen(true); 
  };

  const resetForm = () => { setEditingEvent(null); setNewTitle(''); setNewDate(''); setNewEndDate(''); setNewTime(''); setNewLocation(''); setNewDescription(''); setEventType('game'); setRequiresWaiver(false); setWaiverText(''); setTeamWaiverText(''); };
  
  const handleCreateEvent = () => { 
    if (!newTitle || !newDate) return; 
    const dateObj = new Date(`${newDate}T${newTime || '12:00'}`);
    const payload: any = { title: newTitle, eventType: isTournamentMode ? 'tournament' : eventType, date: dateObj.toISOString(), startTime: newTime || 'TBD', location: newLocation, description: newDescription, isTournament: isTournamentMode, isTournamentPaid: isEliteTournament, requiresSpecialWaiver: requiresWaiver, specialWaiverText: waiverText, teamWaiverText, lastUpdated: new Date().toISOString() }; 
    if (isTournamentMode && newEndDate) payload.endDate = new Date(`${newEndDate}T12:00:00`).toISOString();
    if (editingEvent) updateEvent(editingEvent.id, payload); else addEvent(payload); 
    setIsCreateOpen(false); resetForm(); 
  };

  const canUseTournaments = hasFeature('elite_tournament');

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1"><Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[9px] h-6 px-3">Tactical Hub</Badge><h1 className="text-4xl font-black uppercase tracking-tight">Schedule</h1></div>
        {isStaff && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full h-11 px-6 font-black uppercase text-xs shadow-lg" onClick={() => { resetForm(); setIsTournamentMode(false); setIsEliteTournament(false); setIsCreateOpen(true); }}>+ Match</Button>
            <div className="relative group">
              <Button size="sm" className="rounded-full h-11 px-6 font-black uppercase text-xs shadow-lg bg-black text-white" onClick={() => { 
                if (!canUseTournaments) { purchasePro(); return; }
                resetForm(); setIsTournamentMode(true); setIsEliteTournament(false); setIsCreateOpen(true); 
              }}>
                <Trophy className="h-4 w-4 mr-2 text-primary" /> Tournament
                {!isPro && <Lock className="h-3 w-3 ml-2 opacity-40" />}
              </Button>
            </div>
            <Button size="sm" className="rounded-full h-11 px-6 font-black uppercase text-xs shadow-lg bg-primary text-white border-none" onClick={() => {
              if (!canUseTournaments) { purchasePro(); return; }
              resetForm(); setIsTournamentMode(true); setIsEliteTournament(true); setIsCreateOpen(true);
            }}>
              <Sparkles className="h-4 w-4 mr-2" /> Elite Hub
              {!isPro && <Lock className="h-3 w-3 ml-2 opacity-40" />}
            </Button>
          </div>
        )}
      </div>
      
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-5xl p-0 sm:rounded-[2.5rem] h-[100dvh] sm:h-[90vh] border-none shadow-2xl overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">{editingEvent ? "Update" : "Launch"} Event Hub</DialogTitle>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col lg:flex-row min-h-full">
              <div className={cn("w-full lg:w-5/12 flex flex-col shrink-0 lg:border-r", isEliteTournament ? "bg-primary/5" : "bg-muted/30")}>
                <div className="space-y-6 p-6 lg:p-10">
                  <DialogHeader><DialogTitle className="text-2xl lg:text-3xl font-black tracking-tight">{editingEvent ? "Update" : "Launch"} {isTournamentMode ? (isEliteTournament ? "Elite Hub" : "Tournament") : "Match"}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    {!isTournamentMode && (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Event Type</Label>
                        <Select value={eventType} onValueChange={(v: EventType) => setEventType(v)}>
                          <SelectTrigger className="h-12 rounded-xl font-black border-2 bg-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="game">Game / Match</SelectItem>
                            <SelectItem value="practice">Practice Session</SelectItem>
                            <SelectItem value="meeting">Tactical Meeting</SelectItem>
                            <SelectItem value="other">Other Activity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Event Title</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-12 rounded-xl font-black border-2" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Start Date</Label><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full h-12 rounded-xl font-black border-2 bg-background px-3" /></div>
                      {isTournamentMode ? (<div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">End Date</Label><input type="date" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} className="w-full h-12 rounded-xl font-black border-2 bg-background px-3" /></div>) : (<div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Time</Label><input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full h-12 rounded-xl font-black border-2 bg-background px-3" /></div>)}
                    </div>
                    <div className="space-y-1.5"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">General Description</Label><Textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} className="rounded-xl min-h-[80px] border-2 text-xs font-bold" /></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col bg-background min-h-0">
                <div className="p-6 lg:p-10 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl text-primary"><FileText className="h-5 w-5" /></div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Compliance Setup</h3>
                    </div>
                    <div className="space-y-6 bg-muted/20 p-6 rounded-[2rem] border-2 border-dashed">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5"><Label className="text-sm font-black uppercase">Individual Waiver</Label><p className="text-[10px] font-bold text-muted-foreground uppercase">Require signatures from all squad members</p></div>
                        <Switch checked={requiresWaiver} onCheckedChange={setRequiresWaiver} />
                      </div>
                      {requiresWaiver && (<div className="space-y-2 animate-in fade-in duration-300"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Individual Waiver Terms</Label><Textarea placeholder="Paste your liability terms here..." value={waiverText} onChange={e => setWaiverText(e.target.value)} className="min-h-[120px] rounded-xl border-2 bg-white font-medium" /></div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 lg:p-8 bg-background border-t shrink-0 flex justify-center z-30">
            <Button className="w-full max-w-4xl h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 active:scale-95" onClick={handleCreateEvent}>{editingEvent ? "Update" : "Publish"} Event Hub</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-12">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2"><h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Itinerary</h2><div className="flex bg-muted/50 p-1 rounded-xl border"><Button variant={filterMode === 'live' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterMode('live')} className="h-8 rounded-lg font-black text-[10px] uppercase">Live</Button><Button variant={filterMode === 'past' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterMode('past')} className="h-8 rounded-lg font-black text-[10px] uppercase">History</Button></div></div>
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <EventDetailDialog key={event.id} event={event} updateRSVP={updateRSVP} formatTime={formatTime} isAdmin={isAdmin} onEdit={handleEdit} onDelete={deleteEvent} hasAttendance={true} purchasePro={purchasePro}>
                <Card className="hover:border-primary/30 transition-all duration-500 cursor-pointer group rounded-3xl border-none shadow-md ring-1 ring-black/5 overflow-hidden bg-white">
                  <div className="flex items-stretch h-32">
                    <div className={cn("w-20 lg:w-24 flex flex-col items-center justify-center border-r-2 shrink-0 transition-colors duration-500", event.isTournament ? EVENT_TYPE_COLORS.tournament : EVENT_TYPE_COLORS[event.eventType || 'other'])}>
                      <span className="text-[8px] font-black uppercase opacity-60">{format(new Date(event.date), 'MMM')}</span>
                      <span className="text-3xl lg:text-4xl font-black">{format(new Date(event.date), 'dd')}</span>
                    </div>
                    <div className="flex-1 p-4 lg:p-6 flex flex-col justify-center min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex gap-2 mb-1.5">
                            <Badge className={cn("text-[7px] uppercase border-none", event.isTournament ? "bg-black text-white" : "bg-primary text-white")}>{event.isTournament ? (event.isTournamentPaid ? 'Elite Hub' : 'Tournament') : (event.eventType || 'Game')}</Badge>
                            <Badge variant="outline" className="text-[7px] uppercase">{event.startTime}</Badge>
                          </div>
                          <h3 className="text-lg lg:text-xl font-black tracking-tight leading-none truncate">{event.title}</h3>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" /> {event.location}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-primary opacity-20 group-hover:opacity-100 transition-all mt-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              </EventDetailDialog>
            ))}
            {filteredEvents.length === 0 && (<div className="text-center py-20 bg-muted/10 border-2 border-dashed rounded-[2rem] opacity-40"><CalendarDays className="h-10 w-10 mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-widest">No scheduled activities</p></div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
