
"use client";

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2, Globe, Building, Navigation, Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';

interface Facility {
  id: string;
  name: string;
  type: 'field' | 'court' | 'venue';
  location: string;
}

export default function OrganizationFacilitiesPage() {
  const { orgId } = useParams();
  const db = useFirestore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', type: 'field', location: '' });

  const facilitiesQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(collection(db, 'organizations', orgId as string, 'facilities'));
  }, [orgId, db]);

  const { data: facilities, isLoading } = useCollection<Facility>(facilitiesQuery);

  const handleAddFacility = async () => {
    if (!newFacility.name || !orgId) return;
    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'organizations', orgId as string, 'facilities'), {
        ...newFacility,
        orgId,
        createdAt: new Date().toISOString()
      });
      setNewFacility({ name: '', type: 'field', location: '' });
      setIsAddOpen(false);
      toast({ title: "Facility Registered" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteFacility = async (id: string) => {
    if (!orgId) return;
    await deleteDoc(doc(db, 'organizations', orgId as string, 'facilities', id));
    toast({ title: "Facility De-enrolled" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tight">Institutional Venues</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Managed Organizational Infrastructure</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-8 rounded-xl font-black uppercase text-xs shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Register Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">New Managed Facility</DialogTitle>
              <DialogDescription className="font-bold text-primary uppercase tracking-widest text-[10px]">Strategic Asset Deployment</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Facility Name</Label>
                <Input placeholder="e.g. Metro West Training Fields" value={newFacility.name} onChange={e => setNewFacility({...newFacility, name: e.target.value})} className="h-12 rounded-xl font-bold border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Infrastructure Type</Label>
                <Select value={newFacility.type} onValueChange={(v: any) => setNewFacility({...newFacility, type: v})}>
                  <SelectTrigger className="h-12 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="field">Outdoor Field</SelectItem>
                    <SelectItem value="court">Indoor Court</SelectItem>
                    <SelectItem value="venue">Multi-use Venue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Geographic Location</Label>
                <Input placeholder="Address or GPS Coordinates" value={newFacility.location} onChange={e => setNewFacility({...newFacility, location: e.target.value})} className="h-12 rounded-xl font-bold border-2" />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20" onClick={handleAddFacility} disabled={isProcessing || !newFacility.name}>
                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Deploy Asset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities?.map((facility) => (
          <Card key={facility.id} className="rounded-[2.5rem] border-none shadow-xl overflow-hidden ring-1 ring-black/5 bg-white flex flex-col group">
            <div className="h-2 bg-primary w-full" />
            <CardContent className="p-8 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="bg-primary/5 p-4 rounded-2xl text-primary shadow-inner">
                  <MapPin className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="bg-black text-white border-none font-black uppercase tracking-widest text-[8px] h-6 px-3 shadow-lg">
                  {facility.type}
                </Badge>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{facility.name}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed flex items-center gap-2">
                  <Navigation className="h-3 w-3" /> {facility.location || 'Tactical location classified'}
                </p>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button variant="outline" className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] border-2 group-hover:border-primary transition-colors" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(facility.location)}`, '_blank')}>
                  <Globe className="h-3.5 w-3.5 mr-2" /> Dispatch Nav
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/5" onClick={() => handleDeleteFacility(facility.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {facilities?.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] bg-muted/10 opacity-40">
            <Building className="h-12 w-12 mx-auto mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">No institutional venues registered.</p>
          </div>
        )}
      </div>
    </div>
  );
}
