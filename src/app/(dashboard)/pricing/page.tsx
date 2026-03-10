
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  Sparkles, 
  Trophy, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  Lock,
  Zap,
  Star,
  Building,
  Shield,
  CircleCheck,
  Megaphone,
  Table as TableIcon,
  LayoutGrid,
  Activity,
  Layout,
  ChevronRight,
  CheckCircle2,
  ShieldAlert,
  Infinity,
  AlertCircle
} from 'lucide-react';
import { useTeam } from '@/components/providers/team-provider';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { user, proQuotaStatus, purchasePro } = useTeam();
  const router = useRouter();

  const PLANS = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      description: 'Essential coordination for growing grassroots teams.',
      proTeams: 'Unlimited Starter Teams',
      features: [
        'Team Chat',
        'Schedule & Itinerary',
        'Score Tracking (Basic)',
        'Basic Roster',
        'Playbook (Basic)'
      ],
      cta: 'Free Forever',
      highlight: false
    },
    {
      id: 'squad_pro',
      name: 'Squad Pro',
      price: '$19.99',
      cycle: '/mo',
      description: 'Unlocks the full strategy engine for 1 professional squad.',
      proTeams: '1 Pro Team Seat',
      features: [
        'Elite Tournament Hub',
        'Financial Ledger & Payments',
        'Attendance Tracking',
        'Document Repository',
        'Performance Analytics',
        'Messaging Automation',
        'Full Roster Details'
      ],
      cta: 'Upgrade Squad',
      highlight: true
    },
    {
      id: 'elite_teams',
      name: 'Elite Teams',
      price: '$99',
      cycle: '/mo',
      description: 'Institutional coordination for multi-squad clubs.',
      proTeams: 'Up to 8 Pro Teams',
      features: [
        'Club Hub Management',
        'Organizational Dashboard',
        'Multi-Squad Analytics',
        'Centralized Roster Audit',
        'Everything in Squad Pro'
      ],
      cta: 'Scale Organization',
      highlight: false
    },
    {
      id: 'elite_league',
      name: 'Elite League',
      price: '$249',
      cycle: '/mo',
      description: 'The master hub for league and tournament operators.',
      proTeams: 'Unlimited Pro Teams',
      features: [
        'League Management Hub',
        'Tournament Operations',
        'Unlimited Recruitment Portals',
        'Official Coordination Ledger',
        'Everything in Elite Teams'
      ],
      cta: 'Master Hub',
      highlight: false
    }
  ];

  const quotaPercentage = proQuotaStatus.limit > 0 ? (proQuotaStatus.current / proQuotaStatus.limit) * 100 : 0;

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center space-y-6">
        <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px] h-auto whitespace-nowrap">Institutional Infrastructure</Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase">Elite <span className="text-primary italic">Strategy.</span></h1>
        <div className="space-y-4 pt-2">
          <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto leading-relaxed">Choose the tier that scales with your ambition. Professional coordination for professional squads.</p>
        </div>
      </div>

      {proQuotaStatus.limit > 0 && (
        <Card className="max-w-xl mx-auto rounded-[2.5rem] border-none shadow-xl ring-1 ring-black/5 bg-white overflow-hidden animate-in slide-in-from-top-4 duration-500">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pro Team Quota</p>
                  <p className="text-xl font-black">{proQuotaStatus.current} / {proQuotaStatus.limit === 99999 ? 'Unlimited' : proQuotaStatus.limit} Seats Used</p>
                </div>
              </div>
              <Badge className="bg-primary text-white font-black text-[10px] px-3 h-6">{user?.subscriptionPlan?.toUpperCase()}</Badge>
            </div>
            <div className="space-y-2">
              <Progress value={proQuotaStatus.limit === 99999 ? 100 : quotaPercentage} className="h-2.5 rounded-full" />
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Utilization</span>
                <span>{proQuotaStatus.limit === 99999 ? 'MAX CAPACITY' : `${proQuotaStatus.remaining} slots left`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-8">
        {PLANS.map((plan) => {
          const isCurrent = user?.subscriptionPlan === plan.id;
          return (
            <Card key={plan.id} className={cn(
              "rounded-[2.5rem] border-none shadow-xl overflow-hidden flex flex-col transition-all duration-500 hover:scale-[1.02] ring-1 ring-black/5 bg-white",
              plan.highlight ? "ring-4 ring-primary shadow-2xl scale-[1.03] z-10" : "opacity-90 hover:opacity-100",
              isCurrent && "ring-4 ring-muted-foreground/20 grayscale-[0.5]"
            )}>
              <div className={cn("h-2 w-full", plan.highlight ? "bg-primary" : "bg-muted")} />
              <CardHeader className="p-8 pb-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className={cn(
                    "font-black uppercase text-[8px] tracking-widest px-3 h-5 flex items-center w-fit",
                    plan.highlight ? "border-primary text-primary" : "border-muted-foreground/20 text-muted-foreground"
                  )}>{plan.id === 'free' ? 'BASIC' : 'ELITE'}</Badge>
                  {isCurrent && <Badge className="bg-muted text-muted-foreground font-black text-[8px] px-2 h-5 border-none uppercase">Current</Badge>}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                    {plan.cycle && <span className="text-[10px] font-black uppercase opacity-60 text-muted-foreground">{plan.cycle}</span>}
                  </div>
                </div>
                <CardDescription className="text-[11px] font-bold text-muted-foreground leading-relaxed">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-8">
                <div className="pt-6 border-t border-muted space-y-6">
                  <div className="bg-muted/30 p-3 rounded-xl border flex items-center gap-2">
                    <Zap className={cn("h-3.5 w-3.5", plan.highlight ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{plan.proTeams}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-[10px] font-bold uppercase leading-tight">
                        <Check className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", plan.highlight ? "text-primary" : "text-muted-foreground")} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button 
                  variant={plan.highlight ? "default" : "outline"} 
                  className={cn(
                    "w-full h-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg transition-all",
                    isCurrent ? "opacity-50 cursor-default" : "active:scale-95"
                  )}
                  onClick={isCurrent ? undefined : purchasePro}
                >
                  {isCurrent ? "Current Plan" : plan.cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="bg-black text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden text-center space-y-6">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12"><Building className="h-64 w-64" /></div>
        <Badge className="bg-primary text-white border-none font-black uppercase tracking-widest text-[10px] px-4 h-7">Support</Badge>
        <h3 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Need a League Quote?</h3>
        <p className="text-white/60 font-medium text-base max-w-2xl mx-auto">
          For professional leagues, regional governing bodies, or multi-sport associations with over 500 teams, we offer customized deployment strategies and white-label coordination ledgers.
        </p>
        <Button variant="secondary" className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase text-xs tracking-widest shadow-xl">Contact Enterprise Hub</Button>
      </div>
      
      <div className="text-center pt-4 space-y-2">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">The Squad Coordination Engine v2.0.0</p>
        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.1em] opacity-30 italic">All prices listed are current promotional rates and are subject to change without notice.</p>
      </div>
    </div>
  );
}
