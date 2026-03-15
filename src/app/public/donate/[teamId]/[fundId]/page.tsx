
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useTeam, FundraisingOpportunity } from '@/components/providers/team-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PiggyBank, CheckCircle2, DollarSign, ExternalLink, Loader2, Info, CreditCard } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

export default function PublicDonationPortalPage() {
  const { teamId, fundId } = useParams();
  const db = useFirestore();
  const { submitPublicDonation } = useTeam();

  const fundRef = useMemoFirebase(() => (db && teamId && fundId) ? doc(db, 'teams', teamId as string, 'fundraising', fundId as string) : null, [db, teamId, fundId]);
  const { data: fund, isLoading } = useDoc<FundraisingOpportunity>(fundRef);

  const [form, setForm] = useState({ name: '', email: '', phone: '', amount: '25', method: 'external' as 'external' | 'e-transfer' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  if (!fund || !fund.isShareable) return <div className="min-h-screen flex items-center justify-center p-6"><Card className="max-w-md p-10 text-center font-black uppercase">Portal Inactive</Card></div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitPublicDonation(teamId as string, fundId as string, form);
    if (form.method === 'external' && fund.externalLink) {
      window.location.href = fund.externalLink;
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted/10 flex flex-col items-center justify-center p-6 text-center">
        <BrandLogo variant="light-background" className="h-10 w-40 mb-10" />
        <Card className="max-w-md w-full p-10 rounded-[3rem] border-none shadow-2xl bg-white">
          <div className="bg-green-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="h-10 w-10 text-green-600" /></div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Pledge Received</h2>
          <p className="text-muted-foreground font-bold uppercase text-[10px] mt-4 mb-8">Official Receipt Pending Confirmation</p>
          <div className="bg-primary/5 p-6 rounded-2xl border-2 border-dashed border-primary/20 text-left space-y-4">
            <p className="text-[10px] font-black uppercase text-primary">Instructions</p>
            <p className="text-sm font-bold leading-relaxed">{fund.eTransferDetails || "Please follow organization instructions to complete your transfer."}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 flex flex-col items-center py-12 px-6">
      <BrandLogo variant="light-background" className="h-10 w-40 mb-12" />
      <div className="max-w-xl w-full space-y-8">
        <header className="space-y-2 text-center">
          <Badge className="bg-primary text-white border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">Official Capital Hub</Badge>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-[0.9] pt-2">{fund.title}</h1>
        </header>
        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white">
          <div className="h-2 bg-primary w-full" />
          <form onSubmit={handleSubmit}>
            <CardHeader className="p-8 lg:p-10 pb-4">
              <p className="text-sm font-medium text-foreground/80 leading-relaxed italic text-center">"{fund.description}"</p>
            </CardHeader>
            <CardContent className="p-8 lg:p-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Donation Amount ($)</Label><Input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="h-16 text-center text-4xl font-black rounded-2xl border-2" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">Full Name</Label><Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="h-12 border-2" /></div>
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase ml-1">Fulfillment Method</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {fund.externalLink && (
                      <Button type="button" variant={form.method === 'external' ? 'default' : 'outline'} className={cn("h-14 rounded-xl font-black text-xs uppercase", form.method === 'external' ? "bg-primary" : "")} onClick={() => setForm({...form, method: 'external'})}><CreditCard className="h-4 w-4 mr-2" /> External Processor (Direct)</Button>
                    )}
                    {fund.eTransferDetails && (
                      <Button type="button" variant={form.method === 'e-transfer' ? 'default' : 'outline'} className={cn("h-14 rounded-xl font-black text-xs uppercase", form.method === 'e-transfer' ? "bg-primary" : "")} onClick={() => setForm({...form, method: 'e-transfer'})}><DollarSign className="h-4 w-4 mr-2" /> E-Transfer / Manual</Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 lg:p-10 pt-0"><Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-xl" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Process Donation"}</Button></CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
