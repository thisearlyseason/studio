
"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Play, 
  Trash2, 
  Dumbbell, 
  ChevronRight,
  Loader2,
  Video,
  Filter,
  CheckCircle2,
  Upload,
  Edit3,
  Info,
  Package,
  HardDrive,
  Lock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useTeam, TeamFile } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, limit } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PlaybookAndGamePlayPage() {
  const { activeTeam, addDrill, deleteDrill, purchasePro, isStaff, addFile, deleteFile, user, isPro, markMediaAsViewed } = useTeam();
  const db = useFirestore();

  const [viewMode, setViewMode] = useState<'drills' | 'gameplay'>('drills');
  const [searchTerm, setSearchTerm] = useState('');
  
  const drillsQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'drills'), orderBy('createdAt', 'desc'), limit(20));
  }, [activeTeam?.id, db]);
  const { data: rawDrills, isLoading: isDrillsLoading } = useCollection(drillsQuery);
  const drills = useMemo(() => rawDrills || [], [rawDrills]);

  const filesQuery = useMemoFirebase(() => {
    if (!activeTeam || !db) return null;
    return query(collection(db, 'teams', activeTeam.id, 'files'), orderBy('date', 'desc'), limit(20));
  }, [activeTeam?.id, db]);
  const { data: rawFiles, isLoading: isFilesLoading } = useCollection<TeamFile>(filesQuery);
  const teamFiles = useMemo(() => rawFiles || [], [rawFiles]);

  const [isAddDrillOpen, setIsAddDrillOpen] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<TeamFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadCat, setUploadCat] = useState('Game Tape');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDrills = useMemo(() => drills.filter(d => d.title.toLowerCase().includes(searchTerm.toLowerCase())), [drills, searchTerm]);
  const filteredFiles = useMemo(() => teamFiles.filter(f => ['Game Tape', 'Practice Session', 'Highlights'].includes(f.category) && f.name.toLowerCase().includes(searchTerm.toLowerCase())), [teamFiles, searchTerm]);

  const handleAddDrill = async () => {
    if (!newTitle || !newDesc) return;
    addDrill({ title: newTitle, description: newDesc, videoUrl: newUrl, createdAt: new Date().toISOString() });
    setIsAddDrillOpen(false);
    setNewTitle(''); setNewDesc(''); setNewUrl('');
    toast({ title: "Drill Published" });
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        addFile(file.name, file.name.split('.').pop() || 'file', file.size, ev.target?.result as string, uploadCat, newDesc);
        setIsUploadOpen(false);
        setNewDesc('');
      };
      reader.readAsDataURL(file);
    }
  };

  if (isDrillsLoading || isFilesLoading) return <div className="py-20 text-center animate-pulse"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /><p className="text-xs font-black uppercase mt-4">Opening Tactical Hub...</p></div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight uppercase">Playbook Hub</h1>
          <p className="text-muted-foreground text-sm font-bold">Execution protocols and match study archives.</p>
        </div>
        <div className="flex bg-muted/50 p-1.5 rounded-2xl border-2 shadow-inner">
          <button onClick={() => setViewMode('drills')} className={cn("px-8 h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all", viewMode === 'drills' ? "bg-white text-primary shadow-md" : "text-muted-foreground")}>Drills</button>
          <button 
            onClick={() => isPro ? setViewMode('gameplay') : purchasePro()} 
            className={cn(
              "px-8 h-11 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2", 
              viewMode === 'gameplay' ? "bg-white text-primary shadow-md" : "text-muted-foreground"
            )}
          >
            {!isPro && <Lock className="h-3 w-3 text-red-600" />}
            Game Play
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ... sidebar ... */}
        <aside className="space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-md ring-1 ring-black/5 p-8 bg-black text-white relative group overflow-hidden">
            <Package className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <Badge className="bg-primary text-white border-none font-black text-[8px] h-5 px-2">SQUAD READY</Badge>
              <h3 className="text-xl font-black uppercase leading-tight">Master Execution</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verify squad comprehension via study audits.</p>
            </div>
          </Card>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {/* ... filters and content ... */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={`Search ${viewMode}...`} className="pl-11 h-14 rounded-2xl bg-muted/50 border-none shadow-inner font-black" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {isStaff && (
              <Button onClick={() => viewMode === 'drills' ? setIsAddDrillOpen(true) : setIsUploadOpen(true)} className="rounded-full h-12 px-8 font-black uppercase text-xs shadow-lg shadow-primary/20 shrink-0">
                <Plus className="h-4 w-4 mr-2" /> Add {viewMode === 'drills' ? 'Drill' : 'Film'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {viewMode === 'drills' ? filteredDrills.map(drill => (
              <Card key={drill.id} className="rounded-[2rem] overflow-hidden border-none shadow-sm ring-1 ring-black/5 cursor-pointer bg-white group hover:shadow-xl transition-all" onClick={() => setSelectedDrill(drill)}>
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Play className="h-10 w-10 text-white fill-current opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100" />
                  </div>
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-black text-sm uppercase truncate">{drill.title}</h3>
                  <p className="text-[10px] font-medium text-muted-foreground line-clamp-2">{drill.description}</p>
                </CardContent>
              </Card>
            )) : filteredFiles.map(file => (
              <Card key={file.id} className="rounded-[2rem] overflow-hidden border-none shadow-sm ring-1 ring-black/5 cursor-pointer bg-white group hover:shadow-xl transition-all" onClick={() => setSelectedFile(file)}>
                <div className="aspect-video bg-black/90 flex items-center justify-center relative">
                  <Play className="h-10 w-10 text-white fill-current opacity-40 group-hover:opacity-100 transition-all" />
                  <Badge className="absolute top-4 left-4 bg-black/50 border-none font-black text-[8px] uppercase">{file.category}</Badge>
                </div>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-black text-sm uppercase truncate">{file.name}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{file.size} • {new Date(file.date).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {/* ... dialogs ... */}
    </div>
  );
}
