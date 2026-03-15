
"use client";

import React, { useState, useMemo } from 'react';
import { useTeam, FundraisingOpportunity, DonationEntry } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  PiggyBank, 
  Plus, 
  DollarSign, 
  Target, 
  Users, 
  Clock, 
  Loader2, 
  Trash2, 
  Globe,
  Link as LinkIcon,
  Share2,
  Copy,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  ExternalLink
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
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function DonationAuditLedger({ fundId }: { fundId: string }) {
  const { activeTeam, db, confirmExternalDonation } = useTeam();
  const q = useMemoFirebase(() => (db && activeTeam?.id) ? query(collection(db, 'teams', activeTeam.id, 'fundraising', fundId, 'donations'), orderBy('createdAt', 'desc')) : null, [db, activeTeam?.id, fundId]);
  const { data: donations } = useCollection<DonationEntry>(q);

  if (!donations || donations.length === 0) return <p className="text-[10px] text-center opacity-20 py-10 uppercase font-black">No donations recorded.</p>;

  return (
    <div className="space-y-3">
      {donations.map(don => (
        <div key={don.id} className="p-4 bg-muted/20 rounded-2xl border flex items-center justify-between group">
          <div className="min-w-0">
            <p className="font-black text-xs uppercase truncate">{don.donorName}</p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase">{don.method} • {format(new Date(don.createdAt), 'MMM d')}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-black text-sm text-primary">${don.amount.toLocaleString()}</span>
            {don.status === 'pending' ? (
              <Button size="sm" className="h-8 px-3 rounded-lg font-black text-[8px] uppercase" onClick={() => confirmExternalDonation(fundId, don.id, don.amount)}>Confirm</Button>
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FundraisingPage() {
  const { activeTeam, user, isStaff, addFundraisingOpportunity, signUpForFundraising, deleteFundraisingOpportunity, isPro, purchasePro } = useTeam();
  const db = useFirestore();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newFund, setNewFund] = useState({ title: '', description: '', goal: '1000', deadline: '', isShareable: false, externalLink: '', eTransferDetails: '' });

  const fundsQuery = useMemoFirebase(() => (activeTeam && db) ? query(collection(db, 'teams', activeTeam.id, 'fundraising'), orderBy('deadline', 'asc')) : null, [activeTeam?.id, db]);
  const { data: campaigns, isLoading } = useCollection<FundraisingOpportunity>(fundsQuery);

  const isLimitReached = !isPro && (campaigns?.length || 0) >= 2;

  const handleAddCampaign = async () => {
    if (!newFund.title || !newFund.goal) return;
    setIsProcessing(true);
    await addFundraisingOpportunity({
      ...newFund,
      goalAmount: parseFloat(newFund.goal)
    });
    setIsAddOpen(false);
    setIsProcessing(false);
    setNewFund({ title: '', description: '', goal: '1000', deadline: '', isShareable: false, externalLink: '', eTransferDetails: '' });
    toast({ title: "Campaign Launched" });
  };

  const handleCopyLink = (fundId: string) => {
    const url = `${window.location.origin}/public/donate/${activeTeam?.id}/${fundId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Donation Link Copied" });
  };

  if (isLoading) return <div className="py-20 text-center animate-pulse"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1"><Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[9px] h-6 px-3">Squad Capital</Badge><h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Fundraising</h1></div>
        {isStaff && (
          <Button onClick={() => isLimitReached ? null : setIsAddOpen(true)} className={cn("h-14 px-8 rounded-2xl text-lg font-black shadow-xl", isLimitReached ? "bg-muted text-muted-foreground cursor-not-allowed" : "shadow-primary/20")}>
            {isLimitReached ? <AlertCircle className="h-5 w-5 mr-2 text-red-600" /> : <Plus className="h-5 w-5 mr-2" />}
            Launch Campaign
          </Button>
        )}
      </div>

      {isLimitReached && (
        <div className="bg-red-50 p-6 rounded-[2.5rem] border-2 border-dashed border-red-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4"><div className="bg-red-100 p-3 rounded-2xl text-red-600"><AlertCircle className="h-6 w-6" /></div><div><p className="font-black uppercase text-sm">Campaign Limit Reached</p><p className="text-xs font-medium text-red-600/80">Starter plans are limited to 2 active fundraisers.</p></div></div>
          <Button onClick={purchasePro} size="sm" className="bg-black text-white h-10 px-6 font-black uppercase text-[10px] rounded-xl">Unlock Pro Analytics</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {campaigns?.map((fund) => {
          const progress = (fund.currentAmount / fund.goalAmount) * 100;
          return (
            <Card key={fund.id} className="rounded-[3rem] border-none shadow-xl overflow-hidden bg-white flex flex-col group">
              <div className="h-2 bg-primary w-full" />
              <CardContent className="p-8 lg:p-10 space-y-8 flex-1">
                <div className="flex justify-between items-start">
                  <div className="bg-primary/5 p-5 rounded-[1.5rem] text-primary shadow-inner"><PiggyBank className="h-10 w-10" /></div>
                  <div className="flex gap-1">
                    {fund.isShareable && (<Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleCopyLink(fund.id)}><Share2 className="h-4 w-4" /></Button>)}
                    <Badge variant="secondary" className="bg-black text-white border-none font-black text-[10px] h-7 px-4 shadow-lg flex items-center gap-2"><Target className="h-3 w-3" /> ${fund.goalAmount.toLocaleString()}</Badge>
                  </div>
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{fund.title}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-end"><div className="space-y-0.5"><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Total</p><p className="text-3xl font-black text-primary">${fund.currentAmount.toLocaleString()}</p></div><Badge variant="outline" className="border-primary/20 text-primary font-black text-[10px] h-6">{Math.round(progress)}%</Badge></div>
                  <Progress value={progress} className="h-3 rounded-full" />
                </div>
                {isStaff && (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 rounded-xl h-12 font-black uppercase text-[10px] border-2" onClick={() => { setSelectedFundId(fund.id); setIsAuditOpen(true); }}><DollarSign className="h-4 w-4 mr-2" /> Audit Funds</Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl text-destructive" onClick={() => deleteFundraisingOpportunity(fund.id)}><Trash2 className="h-5 w-5" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-[3rem] sm:max-w-xl p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="h-2 bg-primary w-full" />
          <div className="p-8 lg:p-12 space-y-8">
            <DialogHeader><DialogTitle className="text-3xl font-black uppercase tracking-tight">Campaign Strategy</DialogTitle></DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Title</Label><Input value={newFund.title} onChange={e => setNewFund({...newFund, title: e.target.value})} className="h-12 border-2" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Goal ($)</Label><Input type="number" value={newFund.goal} onChange={e => setNewFund({...newFund, goal: e.target.value})} className="h-12 border-2" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest ml-1">Deadline</Label><Input type="date" value={newFund.deadline} onChange={e => setNewFund({...newFund, deadline: e.target.value})} className="h-12 border-2" /></div>
              </div>
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border">
                  <div><p className="text-xs font-black uppercase">Public Sharing</p><p className="text-[8px] font-bold text-muted-foreground uppercase">Enable external donation portal</p></div>
                  <Switch checked={newFund.isShareable} onCheckedChange={v => setNewFund({...newFund, isShareable: v})} />
                </div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">External Payment Link (Opt)</Label><Input placeholder="Stripe, PayPal, etc." value={newFund.externalLink} onChange={e => setNewFund({...newFund, externalLink: e.target.value})} className="h-12 border-2" /></div>
                <div className="space-y-2"><Label className="text-[10px] font-black uppercase ml-1">E-Transfer Details (Opt)</Label><Textarea placeholder="Email and instructions..." value={newFund.eTransferDetails} onChange={e => setNewFund({...newFund, eTransferDetails: e.target.value})} className="min-h-[80px] border-2" /></div>
              </div>
            </div>
            <DialogFooter><Button className="w-full h-16 rounded-[2rem] text-lg font-black shadow-xl" onClick={handleAddCampaign} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : "Authorize Campaign"}</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
        <DialogContent className="rounded-[3rem] p-8 max-w-lg">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase">Campaign Audit</DialogTitle></DialogHeader>
          <div className="py-6">{selectedFundId && <DonationAuditLedger fundId={selectedFundId} />}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
