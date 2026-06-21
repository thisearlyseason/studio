
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { User, Baby, ArrowRight, Check, ShieldCheck, Trophy, ChevronLeft, GraduationCap, Medal } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

type RegTarget = 'self' | 'child' | 'coach' | 'league_creator' | 'school_ad' | null;

const SIGNUP_OPTIONS: { id: RegTarget; icon: any; label: string; desc: string; badge: string }[] = [
  {
    id: 'self',
    icon: User,
    label: 'Player / Athlete',
    desc: 'I am the player — join or get recruited',
    badge: 'Athlete Hub',
  },
  {
    id: 'child',
    icon: Baby,
    label: 'Parent / Guardian',
    desc: "I manage my child's sports profile",
    badge: 'Parent Hub',
  },
  {
    id: 'coach',
    icon: Trophy,
    label: 'Coach / Team Manager',
    desc: 'I create and run a team',
    badge: 'Coach Hub',
  },
  {
    id: 'school_ad',
    icon: GraduationCap,
    label: 'School / Athletic Director',
    desc: 'I manage a school athletic program',
    badge: 'School Hub',
  },
  {
    id: 'league_creator',
    icon: Medal,
    label: 'League Organizer',
    desc: 'I create and run leagues across teams',
    badge: 'League Hub',
  },
];

export default function SignupPage() {
  const [step, setStep] = useState<'target' | 'account'>('target');
  const [regTarget, setRegTarget] = useState<RegTarget>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const selectedOption = SIGNUP_OPTIONS.find(o => o.id === regTarget);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address (e.g. name@example.com).", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });

      // Map regTarget -> Firestore role
      const roleMap: Record<string, string> = {
        self: 'adult_player',
        child: 'parent',
        coach: 'coach',
        school_ad: 'admin',
        league_creator: 'league_creator',
      };
      const role = roleMap[regTarget as string] || 'adult_player';

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        fullName: name,
        email: cleanEmail,
        role,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://picsum.photos/seed/${user.uid}/150/150`,
        activePlanId: 'starter_squad',
        proTeamLimit: 0,
      });

      // Adult player: create matching player record
      if (regTarget === 'self') {
        await setDoc(doc(db, 'players', `p_${user.uid}`), {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          isMinor: false,
          userId: user.uid,
          hasLogin: true,
          createdAt: new Date().toISOString(),
        });
      }

      toast({ title: "Account Created!", description: `Welcome to The Squad Hub.` });

      // Post-signup redirect by role
      if (role === 'coach' || role === 'admin') {
        router.push('/teams/new');
      } else if (role === 'parent') {
        router.push('/family');
      } else if (role === 'league_creator') {
        router.push('/competition');
      } else {
        router.push('/teams/join');
      }
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/email-already-in-use') {
        toast({ title: "Email Already in Use", description: "Please log in or use a different email.", variant: "destructive" });
      } else if (code === 'auth/invalid-email') {
        toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      } else if (code === 'auth/weak-password') {
        toast({ title: "Weak Password", description: "Password must be at least 6 characters.", variant: "destructive" });
      } else {
        toast({ title: "Signup Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-y-auto overflow-x-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest h-10 px-4 rounded-full border border-white/10 backdrop-blur-sm">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <BrandLogo variant="dark-background" className="h-12 w-40 mb-8 relative z-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-[2.5rem] bg-white/95 backdrop-blur-md shadow-2xl overflow-hidden">
          {/* Brand accent bar */}
          <div className="h-1.5 hero-gradient w-full" />

          {step === 'target' ? (
            <div className="p-8 space-y-6 animate-in fade-in duration-500">
              <div className="text-center space-y-1.5">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Who&apos;s Joining?</CardTitle>
                <CardDescription className="text-[11px] font-semibold text-muted-foreground">
                  Choose your role — you can always update this later
                </CardDescription>
              </div>

              <div className="space-y-2.5">
                {SIGNUP_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = regTarget === opt.id;
                  return (
                    <button
                      key={opt.id as string}
                      onClick={() => setRegTarget(opt.id)}
                      className={cn(
                        "w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center justify-between group",
                        isSelected
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                          : "border-muted bg-white hover:border-primary/30 hover:bg-primary/[0.02]"
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={cn(
                          "p-2.5 rounded-xl transition-colors shrink-0",
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase tracking-tight leading-none mb-0.5">{opt.label}</p>
                          <p className="text-[10px] font-semibold text-muted-foreground leading-none">{opt.desc}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                className="w-full h-12 rounded-2xl text-sm font-black uppercase shadow-xl shadow-primary/20"
                disabled={!regTarget}
                onClick={() => setStep('account')}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-[10px] font-semibold text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-black hover:underline">Log In</Link>
              </p>
            </div>

          ) : (
            <form onSubmit={handleSignup} className="p-8 space-y-5 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Create Account</CardTitle>
                {selectedOption && (
                  <span className="inline-block text-[10px] font-black uppercase text-primary tracking-widest bg-primary/8 py-1 px-3 rounded-full border border-primary/15">
                    {selectedOption.badge}
                  </span>
                )}
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Full Name</Label>
                  <Input
                    required
                    placeholder="John Smith"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-muted font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Email Address</Label>
                  <Input
                    required
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-muted font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">Password</Label>
                  <Input
                    required
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 rounded-xl bg-muted/30 border-muted font-semibold"
                  />
                </div>
              </div>

              <div className="bg-muted/40 p-3.5 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                  By creating an account you confirm you are 18+ and authorized to manage registration data for your organization.
                </p>
              </div>

              <CardFooter className="flex flex-col gap-3 p-0">
                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl font-black uppercase shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep('target')}
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Change Account Type
                </button>
              </CardFooter>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
