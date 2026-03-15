
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useTeam, VolunteerOpportunity } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HandHelping, CheckCircle2, Clock, MapPin, Loader2, Info } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function PublicVolunteerSignupPage() {
  const { teamId, oppId } = useParams();
  const db = useFirestore();
  const { publicSignUpForVolunteer } = useTeam();

  const oppRef = useMemoFirebase(() => (db && teamId && oppId) ? doc(db, 'teams', teamId as string, 'volunteers', oppId as string) : null, [db, teamId, oppId]);
  const { data: opp, isLoading } = useDoc<VolunteerOpportunity>(oppRef);

  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!opp || !opp.isShareable) return <div className="min-h-screen flex items-center justify-center p-6"><Card className="max-w-md p-10 text-center font-black uppercase">Opportunity Private</Card></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await publicSignUpForVolunteer(teamId as string, oppId as string, form);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <BrandLogo variant="light-background" className="h-10 w-40 mb-10" />
        <Card className="max-w-md w-full p-10 rounded-[3rem] border-none shadow-2xl bg-white">
          <div className="bg-green-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Signup Received</h2>
          <p className="text-muted-foreground font-bold uppercase text-[10px] mt-4 leading-relaxed">The squad coordinator will reach out to confirm your assignment shortly.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col items-center py-12 px-6">
      <BrandLogo variant="light-background" className="h-10 w-40 mb-12" />
      <div className="max-w-xl w-full space-y-8">
        <header className="space-y-2 text-center">
          <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">Public Support Request</Badge>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-[0.9] pt-2">{opp.title}</h1>
        </header>
        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
          <div className="h-2 bg-primary w-full" />
          <form onSubmit={handleSubmit}>
            <CardHeader className="p-8 lg:p-10 pb-4">
              <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed space-y-4">
                <div className="flex items-center gap-3 text-xs font-black uppercase text-primary"><Calendar className="h-4 w-4" /> {opp.date}</div>
                <div className="flex items-center gap-3 text-xs font-black uppercase text-primary"><MapPin className="h-4 w-4" /> {opp.location}</div>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">"{opp.description}"</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 lg:p-10 space-y-6">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Full Name</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Email</Label><Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="h-12 rounded-xl border-2" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Phone</Label><Input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="h-12 rounded-xl border-2" /></div>
              </div>
            </CardContent>
            <CardFooter className="p-8 lg:p-10 pt-0"><Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Dispatch Signup"}</Button></CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
