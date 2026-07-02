
"use client"; 

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Calendar, 
  MessageSquare, 
  Users, 
  Trophy, 
  CheckCircle2, 
  Mail, 
  MapPin, 
  Phone,
  BarChart3,
  Globe,
  ArrowRight,
  Play,
  Video,
  ClipboardList,
  ShieldCheck,
  Infinity as InfinityIcon,
  AlertCircle,
  Zap,
  User,
  Baby,
  Table as TableIcon,
  Sparkles,
  Loader2,
  Check,
  X,
  Activity,
  CreditCard,
  ShieldAlert,
  Smartphone,
  Layout,
  Terminal,
  MousePointer2,
  Lock,
  BrainCircuit,
  Package,
  DollarSign,
  PenTool,
  Building,
  GraduationCap,
  BookOpen,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import BrandLogo from '@/components/BrandLogo';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const DEMO_OPTIONS = [
  { id: 'starter_squad', name: 'Starter Plan Demo', icon: Users, desc: 'Grassroots essentials' },
  { id: 'squad_pro', name: 'Squad Pro Demo', icon: Zap, desc: 'Professional elite coordination' },
  { id: 'elite_teams', name: 'Elite Org Demo', icon: Trophy, desc: 'Institutional multi-team hub' },
  { id: 'school_demo', name: 'School Demo', icon: GraduationCap, desc: 'Full K-12 Program Hub' },
  { id: 'player_demo', name: 'Player Demo', icon: User, desc: 'Teammate recruiting view' },
  { id: 'parent_demo', name: 'Parent Demo', icon: Baby, desc: 'Guardian safety view' },
  { id: 'league_demo', name: 'FREE League Creator Demo', icon: ShieldCheck, desc: 'Free plan · manage leagues without Pro' }
];

// ── Shared animation helpers ──────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } } };

// ── Pricing Toggle Context ──────────────────────────────────────────────
const PricingCycleContext = React.createContext<{ cycle: 'monthly' | 'annual'; setCycle: (c: 'monthly' | 'annual') => void }>({ cycle: 'monthly', setCycle: () => {} });

function PricingToggle() {
  const { cycle, setCycle } = React.useContext(PricingCycleContext);
  return (
    <div className="flex items-center bg-white/10 p-1.5 rounded-2xl ring-1 ring-white/10 backdrop-blur-sm">
      <button
        onClick={() => setCycle('monthly')}
        className={cn(
          'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
          cycle === 'monthly' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white/80'
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => setCycle('annual')}
        className={cn(
          'px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2',
          cycle === 'annual' ? 'bg-white text-black shadow-sm' : 'text-white/50 hover:text-white/80'
        )}
      >
        Annual
        <span className="bg-primary/20 text-primary font-black text-[8px] px-1.5 py-0.5 rounded-full border border-primary/30">SAVE 20%</span>
      </button>
    </div>
  );
}

function PricingDisplay({ monthly, annual, annualMonthly, color, darkBg }: { monthly: string; annual: string; annualMonthly: string; color: string; darkBg?: boolean }) {
  const { cycle } = React.useContext(PricingCycleContext);
  const opacityClass = darkBg ? 'opacity-60' : 'text-white/40';
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline gap-1">
        <span className={cn('text-4xl font-black tracking-tighter transition-all duration-300', color)}>
          {cycle === 'annual' ? annualMonthly : monthly}
        </span>
        <span className={cn('text-[10px] font-black uppercase', darkBg ? 'opacity-60' : 'text-white/40')}>/mo</span>
      </div>
      {cycle === 'annual' && (
        <p className={cn('text-[9px] font-black uppercase tracking-wider', color, 'opacity-70')}>
          {annual}/yr · billed annually
        </p>
      )}
    </div>
  );
}

// ── Enterprise Contact Form ──────────────────────────────────────────────
function ContactForm({ db }: { db: any }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [org, setOrg] = React.useState('');
  const [inquiry, setInquiry] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !inquiry.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_inquiries'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        organization: org.trim(),
        inquiry: inquiry.trim(),
        createdAt: serverTimestamp(),
        source: 'landing_page_contact',
        status: 'new',
      });
      setSubmitted(true);
      // Notify admin asynchronously
      fetch('/api/public/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', name: name.trim(), email: email.trim(), organization: org.trim(), inquiry: inquiry.trim() }),
      }).catch(() => {});
    } catch (err: any) {
      alert('Submission failed. Please email us at teams@thesquad.pro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight">Message Received</h3>
        <p className="text-sm font-bold text-muted-foreground">Our team will reach out within 24 hours.</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest">Name *</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="h-12 rounded-xl bg-muted/50 border-none" required />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase tracking-widest">Email *</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="h-12 rounded-xl bg-muted/50 border-none" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest">Organization</Label>
        <Input value={org} onChange={e => setOrg(e.target.value)} placeholder="State Varsity League" className="h-12 rounded-xl bg-muted/50 border-none" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase tracking-widest">Inquiry *</Label>
        <Textarea value={inquiry} onChange={e => setInquiry(e.target.value)} placeholder="Define your institutional needs..." className="min-h-[120px] rounded-xl bg-muted/50 border-none resize-none" required />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !name.trim() || !email.trim() || !inquiry.trim()}
        className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSubmitting ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Sending...</> : 'Send Inquiry'}
      </Button>
    </form>
  );
}



function SectionHeader({ badge, title, subtitle }: { badge: string; title: React.ReactNode; subtitle: React.ReactNode }) {
  return (
    <motion.div
      className="text-center space-y-4 mb-24 max-w-3xl mx-auto"
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
    >
      <motion.div variants={fadeUp}>
        <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black px-4 py-1 uppercase tracking-widest text-[10px]">{badge}</Badge>
      </motion.div>
      <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">{title}</motion.h2>
      <motion.div variants={fadeUp} className="text-muted-foreground font-medium text-lg pt-4 leading-relaxed">{subtitle}</motion.div>
    </motion.div>
  );
}

function StaggerGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}
// ──────────────────────────────────────────────────────────────────────────

// ── BETA FLAG: set to false to re-enable public signup ───────────────────
const BETA_MODE = false;
// ─────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isAuthResolvedFailsafe, setIsAuthResolvedFailsafe] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [pricingCycle, setPricingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterLoading(true);
    try {
      const emailVal = newsletterEmail.trim().toLowerCase();
      const nameVal = newsletterName.trim();
      await addDoc(collection(db, 'newsletter_signups'), {
        name: nameVal,
        email: emailVal,
        createdAt: serverTimestamp(),
        source: 'landing_page',
      });
      setNewsletterDone(true);
      toast({ title: "You Got it!", description: "We'll keep you in the loop. 🏆" });

      // Trigger admin notification asynchronously
      fetch('/api/public/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'newsletter',
          name: nameVal,
          email: emailVal,
        }),
      }).catch(err => console.error('Admin notification failed:', err));
    } catch (err: any) {
      toast({ title: 'Oops!', description: err.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    // Failsafe to hide loading spinner even if Auth is slow or hangs
    const timer = setTimeout(() => {
      setIsAuthResolvedFailsafe(true);
    }, 4000); // 4 second threshold
    return () => clearTimeout(timer);
  }, []);

  const sportsVideos = [
    {
      sport: "Baseball",
      src: "https://assets.mixkit.co/videos/853/853-720.mp4",
      poster: "https://images.unsplash.com/photo-1508088062105-17d61307629d?auto=format&fit=crop&q=80&w=1200"
    },
    {
      sport: "Soccer",
      src: "https://assets.mixkit.co/videos/43494/43494-720.mp4",
      poster: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&q=80&w=1200"
    },
    {
      sport: "Football",
      src: "https://assets.mixkit.co/videos/42554/42554-720.mp4",
      poster: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=1200"
    },
    {
      sport: "Golf",
      src: "https://cdn.pixabay.com/video/2018/10/02/18528-293467377_large.mp4",
      poster: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=1200"
    },
    {
      sport: "Hockey",
      src: "https://assets.mixkit.co/videos/48383/48383-720.mp4",
      poster: "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&q=80&w=1200"
    },
  ];

  const videoRefs = React.useRef<(HTMLVideoElement | null)[]>([]);

  const handleVideoEnded = React.useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % sportsVideos.length);
  }, [sportsVideos.length]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const clipTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Play the active video, pause others, and auto-advance after 5 s
  useEffect(() => {
    if (clipTimerRef.current) clearTimeout(clipTimerRef.current);

    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === currentImageIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });

    clipTimerRef.current = setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sportsVideos.length);
    }, 5000);

    return () => { if (clipTimerRef.current) clearTimeout(clipTimerRef.current); };
  }, [currentImageIndex, sportsVideos.length]);

  const handleLaunchDemo = async (planId: string) => {
    setIsDemoLoading(true);
    try {
      // Clear current session first to prevent state pollution
      await signOut(auth);
      // Brief delay to ensure auth state clean
      await new Promise(resolve => setTimeout(resolve, 500));

      // Always wipe stale demo locks/state so the seeder runs fresh
      localStorage.removeItem('squad_seeding_lock');
      localStorage.removeItem('sf_session_team_id');
      sessionStorage.removeItem('squad_demo_start_time');
      
      await signInAnonymously(auth);
      
      // Use window.replace to bypass internal router cache 
      // and ensure DashboardLayout initializes with fresh demo parameters
      window.location.replace(`/dashboard?seed_demo=${planId}`);
    } catch (error: any) {
      toast({
        title: "Demo Launch Failed",
        description: "Verification service unavailable. Try again shortly.",
        variant: "destructive"
      });
      setIsDemoLoading(false);
    }
  };

  if (isUserLoading && !isAuthResolvedFailsafe) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled ? "bg-white/80 backdrop-blur-md py-3 shadow-sm border-border" : "bg-transparent py-5 border-transparent"
      )}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo 
              variant={isScrolled ? "light-background" : "dark-background"} 
              className="h-10 w-40" 
              priority 
            />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest">
            <a href="#features" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Features</a>
            <a href="#roles" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Roles</a>
            <a href="#comparison" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Compare</a>
            <a href="#pricing" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className={cn("font-bold", isScrolled ? "text-foreground" : "text-white hover:bg-white/10")}>
                Log In
              </Button>
            </Link>
            {BETA_MODE ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/30 bg-primary/10 text-primary backdrop-blur-sm">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
                Signup Coming Soon
              </span>
            ) : (
              <Link href="/signup">
                <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">Join Now</Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {!isScrolled && (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-bold text-white text-[10px] uppercase tracking-widest px-2 h-8">
                  Log In
                </Button>
              </Link>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("rounded-xl h-10 w-10", isScrolled ? "text-foreground" : "text-white hover:bg-white/10")}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] border-none p-0 bg-white">
                <SheetHeader className="p-8 pb-4 text-left">
                  <div className="h-1 bg-primary w-12 rounded-full mb-6" />
                  <SheetTitle className="text-3xl font-black uppercase tracking-tighter">Tactical Menu</SheetTitle>
                  <SheetDescription className="text-primary font-black uppercase text-[10px] tracking-widest pt-1">
                    Squad Control Protocols
                  </SheetDescription>
                </SheetHeader>
                <div className="px-8 flex flex-col gap-6 pt-10">
                  <a href="#features" className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors py-2 border-b border-muted">Features</a>
                  <a href="#roles" className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors py-2 border-b border-muted">Roles</a>
                  <a href="#comparison" className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors py-2 border-b border-muted">Market Intel</a>
                  <a href="#pricing" className="text-xl font-black uppercase tracking-tight hover:text-primary transition-colors py-2 border-b border-muted">Pricing</a>
                  <div className="flex flex-col gap-4 mt-12 pt-6">
                    {BETA_MODE ? (
                      <div className="w-full h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>
                        Signup Coming Soon
                      </div>
                    ) : (
                      <Link href="/signup" className="w-full">
                        <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">Join Now</Button>
                      </Link>
                    )}
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs border-2">
                        Log In
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {sportsVideos.map((clip, idx) => (
          <div
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              currentImageIndex === idx ? "opacity-100" : "opacity-0"
            )}
          >
            <video
              ref={(el) => { videoRefs.current[idx] = el; }}
              src={clip.src}
              poster={clip.poster}
              muted
              playsInline
              autoPlay={idx === 0}
              onEnded={handleVideoEnded}
              className="absolute inset-0 w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-black/55 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />
          </div>
        ))}

        {/* Sport indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {sportsVideos.map((clip, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={cn(
                "transition-all duration-300 font-black uppercase tracking-widest text-white rounded-full border",
                currentImageIndex === idx
                  ? "bg-primary border-primary px-4 py-1.5 text-[9px] shadow-lg shadow-primary/30"
                  : "bg-white/10 border-white/20 backdrop-blur-sm px-3 py-1 text-[8px] opacity-60 hover:opacity-100"
              )}
            >
              {clip.sport}
            </button>
          ))}
        </div>


        <motion.div
          className="container relative z-10 px-6 text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Badge — drops from above */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } }
            }}
          >
            <Badge className="bg-primary/20 backdrop-blur-md text-primary-foreground border-primary/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">
              Institutional Team Infrastructure
            </Badge>
          </motion.div>

          {/* H1 Headline — word-by-word masked slide-up */}
          <h1 className="sr-only">Dominate Your Season — The Squad Elite Sports Management Platform</h1>
          <motion.div
            aria-hidden="true"
            className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.88] max-w-5xl mx-auto drop-shadow-2xl"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } } }}
          >
            {/* Line 1 */}
            <div className="overflow-hidden pb-1">
              <motion.span
                className="block"
                variants={{ hidden: { y: '105%', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } } }}
              >
                DOMINATE
              </motion.span>
            </div>
            {/* Line 2 */}
            <div className="overflow-hidden pb-1 flex items-baseline justify-center gap-4 md:gap-6 flex-wrap">
              <motion.span
                className="inline-block"
                variants={{ hidden: { y: '105%', opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } } }}
              >
                YOUR
              </motion.span>
              <motion.span
                className="inline-block text-primary italic"
                variants={{ hidden: { y: '105%', opacity: 0, scale: 0.95 }, visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } } }}
              >
                SEASON.
              </motion.span>
            </div>
          </motion.div>

          {/* Subtitle — blur-to-clear fade */}
          <motion.p
            className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed"
            variants={{ hidden: { opacity: 0, filter: 'blur(8px)', y: 12 }, visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.9, ease: 'easeOut' } } }}
          >
            The all-in-one tactical platform for elite sports organizations. Coordinate rosters, automate brackets, and verify performance.
          </motion.p>

          {/* Buttons — scale up from below */}
          <motion.div
            className="flex flex-col items-center justify-center gap-3 pt-4 w-full max-w-xs mx-auto"
            variants={{ hidden: { opacity: 0, scale: 0.92, y: 16 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } } }}
          >
            {user ? (
              <Link href="/dashboard" className="w-full">
                <Button size="lg" className="h-12 px-8 rounded-full text-sm font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all w-full">
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : BETA_MODE ? (
              <a href="#notify" className="w-full">
                <Button size="lg" className="h-12 px-8 rounded-full text-sm font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all w-full">
                  Get Notified at Launch <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ) : (
              <Link href="/signup" className="w-full">
                <Button size="lg" className="h-12 px-8 rounded-full text-sm font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all w-full">
                  Deploy Your Squad <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
            <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full text-sm font-black bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all w-full">
                  Experience Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
                <DialogTitle className="sr-only">Experience Tactical Demo Hub</DialogTitle>
                <div className="h-2 bg-primary w-full" />
                <div className="p-8 lg:p-12 space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black uppercase tracking-tight">Tactical Perspectives</h2>
                    <p className="text-base font-bold text-primary uppercase tracking-widest">Select your role to begin</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DEMO_OPTIONS.map((demo) => (
                      <Button 
                        key={demo.id} 
                        variant="outline" 
                        className="h-24 rounded-[1.5rem] bg-muted/30 border-2 border-transparent hover:border-primary/20 hover:bg-white hover:text-foreground transition-all flex items-center justify-between px-6 group"
                        onClick={() => handleLaunchDemo(demo.id)}
                        disabled={isDemoLoading}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-white p-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                            <demo.icon className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm uppercase tracking-widest">{demo.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{demo.desc}</p>
                          </div>
                        </div>
                        {isDemoLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      </section>

      {/* ══ FLOATING BETA ACCESS PILL (always visible, right edge) ══ */}
      {BETA_MODE && (
        <motion.div
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200, damping: 25 }}
        >
          <Link
            href="/beta"
            className="group flex flex-col items-center gap-2 bg-black text-white px-3 py-5 rounded-l-2xl shadow-2xl shadow-black/40 border border-white/10 hover:bg-primary hover:text-gray-900 hover:border-primary transition-all duration-300"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-[-90deg] opacity-60 group-hover:opacity-100 transition-all" />
            <span
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              Beta Access
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary group-hover:bg-gray-900" />
            </span>
          </Link>
        </motion.div>
      )}

      {/* ══ GET NOTIFIED AT LAUNCH SECTION ══ */}
      {BETA_MODE && (
        <section id="notify" className="py-28 bg-[#f8f7f4] relative overflow-hidden">
          {/* Subtle texture */}
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(234,179,8,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.04) 0%, transparent 50%)' }} />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* ── Left: Copy ── */}
                <motion.div
                  className="space-y-8"
                  initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
                >
                  <motion.div variants={fadeUp}>
                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                      <span className="w-8 h-[2px] bg-primary rounded-full" />
                      Launching Soon
                    </span>
                  </motion.div>

                  <motion.h2
                    variants={fadeUp}
                    className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter leading-[0.92]"
                  >
                    BE THE FIRST<br />TO<span className="text-primary italic"> KNOW.</span>
                  </motion.h2>

                  <motion.p
                    variants={fadeUp}
                    className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm"
                  >
                    The Squad is going live soon. Leave your info and we'll notify you the moment the doors open — no waiting, no missing out.
                  </motion.p>

                  {/* Promise list */}
                  <motion.ul variants={fadeUp} className="space-y-3">
                    {[
                      'Instant launch-day notification',
                      'Early-bird access before the public',
                      'Zero spam — one email, that\'s it',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </motion.ul>
                </motion.div>

                {/* ── Right: Form card ── */}
                <motion.div
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                >
                  <div className="bg-white rounded-[2rem] shadow-2xl shadow-black/8 p-8 md:p-10 ring-1 ring-black/5 relative overflow-hidden">
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-yellow-400 to-primary/60 rounded-t-[2rem]" />

                    {newsletterDone ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="flex flex-col items-center gap-5 py-8 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
                          className="w-20 h-20 rounded-full bg-primary/10 ring-4 ring-primary/20 flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-10 w-10 text-primary" />
                        </motion.div>
                        <div className="space-y-2">
                          <motion.p
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.22 }}
                            className="text-2xl font-black text-gray-900 uppercase tracking-tight"
                          >
                            You Got it!
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.32 }}
                            className="text-gray-500 font-medium"
                          >
                            You're on the list. We'll hit you when we're live.
                          </motion.p>
                        </div>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleNewsletterSignup} className="space-y-5">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Get launch-day notification</p>
                          <p className="text-xl font-black text-gray-900">Drop your info below.</p>
                        </div>

                        <div className="space-y-3">
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            placeholder="Your Name"
                            value={newsletterName}
                            onChange={(e) => setNewsletterName(e.target.value)}
                            className="w-full h-13 px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 font-semibold text-sm focus:outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="email"
                            placeholder="your@email.com"
                            required
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            className="w-full h-13 px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 font-semibold text-sm focus:outline-none focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        <motion.button
                          type="submit"
                          disabled={newsletterLoading}
                          whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(234,179,8,0.35)' }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full h-13 py-3.5 rounded-xl bg-gray-900 text-white font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {newsletterLoading
                            ? <Loader2 className="h-5 w-5 animate-spin" />
                            : <><Mail className="h-4 w-4" /> Notify Me at Launch</>
                          }
                        </motion.button>

                        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          No spam · Unsubscribe anytime
                        </p>
                      </form>
                    )}
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </section>
      )}

      <section id="features" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Institutional Suite"
            title={<>PROFESSIONAL <br /> <span className="text-primary italic">INFRASTRUCTURE.</span></>}
            subtitle="The Squad provides the foundational protocols and advanced modules required to scale from a single team to an entire league."
          />

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 group hover:bg-black hover:text-white transition-all duration-500 h-full">
              <div className="bg-primary p-4 rounded-2xl w-fit shadow-lg shadow-primary/20">
                <TableIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Tournament & League Elite Engines</h3>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                Automated <strong>League Itineraries</strong> and bracket generation with a <strong>Public Spectator Hub</strong> and mobile <strong>Scorekeeper Portal</strong> for real-time results.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Live Standings</li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Multi-Team Conflicts</li>
              </ul>
            </Card>
            </motion.div>

            <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 group hover:bg-black hover:text-white transition-all duration-500 h-full">
              <div className="bg-primary p-4 rounded-2xl w-fit shadow-lg shadow-primary/20">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Branded Briefing Unit</h3>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                Export professionally branded <strong>Tactical PDF Briefings</strong> for every event. Automated <strong>AI Image Optimization</strong> ensures drill assets load instantly.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Printable Itineraries</li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Institutional Branding</li>
              </ul>
            </Card>
            </motion.div>

            <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 group hover:bg-black hover:text-white transition-all duration-500 h-full">
              <div className="bg-primary p-4 rounded-2xl w-fit shadow-lg shadow-primary/20">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Film Watch Verification</h3>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                The <strong>75% Watch Rule</strong> ensures teammates study their assignments. Monitor video compliance directly in your master roster ledger.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> 10GB Pro Storage</li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Verified Compliance</li>
              </ul>
            </Card>
            </motion.div>

            <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 group hover:bg-black hover:text-white transition-all duration-500 h-full">
              <div className="bg-primary p-4 rounded-2xl w-fit shadow-lg shadow-primary/20">
                <ClipboardList className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Recruitment Engine</h3>
              <p className="text-sm font-medium leading-relaxed opacity-70">
                Custom <strong>Form Architect</strong> for registration. Collect medical waivers and fees with automated coach assignment and performance portfolios.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Digital Signatures</li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase"><CheckCircle2 className="h-4 w-4 text-primary" /> Performance Export</li>
              </ul>
            </Card>
            </motion.div>
          </StaggerGrid>
        </div>
      </section>

      <section id="comparison" className="py-32 bg-white relative">
        <div className="container mx-auto px-6">
          <SectionHeader
            badge="Market Intelligence"
            title={<>COMPETITIVE <br /> <span className="text-primary italic">ADVANTAGE.</span></>}
            subtitle="Legacy tools are for hobbyists. The Squad is built for organizations that demand absolute operational visibility and high-performance metrics."
          />
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative overflow-x-auto rounded-[2rem] md:rounded-[3.5rem] border-2 shadow-2xl bg-white scrollbar-hide">
              <div className="md:hidden flex items-center justify-center p-3 bg-muted/20 text-[8px] font-black uppercase tracking-[0.2em] text-primary space-x-2 border-b">
                <span>Swipe to compare</span>
                <ChevronRight className="h-3 w-3 animate-bounce-x" />
              </div>
              <table className="w-full text-left border-collapse min-w-[700px] md:min-w-[1000px]">
              <thead>
                <tr className="bg-black text-white">
                  <th className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Capabilities</th>
                  <th className="py-8 px-8 text-center bg-primary">
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-black text-xs tracking-tighter">THE SQUAD</span>
                      <Badge className="bg-white text-primary border-none font-black text-[7px] h-4">PLATFORM OF CHOICE</Badge>
                    </div>
                  </th>
                  <th className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-widest opacity-40">TeamSnap</th>
                  <th className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Hudl</th>
                  <th className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-widest opacity-40">TeamReach</th>
                  <th className="py-8 px-8 text-center text-[10px] font-black uppercase tracking-widest opacity-40">GameChanger</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: "Branded PDF Briefings", squad: true, tsnap: false, hudl: false, treach: false, gchanger: false, note: "Institutional Tactical PDF Printouts" },
                  { feature: "HD Tactical Capture", squad: true, tsnap: false, hudl: "Basic", treach: false, gchanger: false, note: "Frame-accurate play breakdown" },
                  { feature: "Institutional Fiscal Audit", squad: true, tsnap: false, hudl: false, treach: false, gchanger: false, note: "Club-wide financial visibility" },
                  { feature: "Recruiting Portfolio Export", squad: true, tsnap: false, hudl: false, treach: false, gchanger: false, note: "Certified athlete performance resumes" },
                  { feature: "Consolidated Household Hub", squad: true, tsnap: false, hudl: false, treach: false, gchanger: false, note: "Unified management for multi-athlete families" },
                  { feature: "AI Image/Asset Optimization", squad: true, tsnap: false, hudl: false, treach: false, gchanger: false, note: "Automatic high-res compression" },
                  { feature: "75% Film Watch Rule", squad: true, tsnap: false, hudl: "Partial", treach: false, gchanger: false, note: "Verified compliance monitoring" },
                  { feature: "Tournament & League Elite Engines", squad: true, tsnap: "Partial", hudl: false, treach: false, gchanger: "Basic", note: "One-click championship series" },
                  { feature: "UTC-Precision Scheduling", squad: true, tsnap: "Basic", hudl: "Basic", treach: "Basic", gchanger: "Basic", note: "Timezone-aware local consistency" },
                ].map((row, idx) => (
                  <tr key={idx} className="group hover:bg-muted/10 transition-colors">
                    <td className="py-6 px-8">
                      <p className="font-black text-sm uppercase tracking-tight leading-none mb-1">{row.feature}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{row.note}</p>
                    </td>
                    <td className="py-6 px-8 bg-primary/5 border-x-2 border-primary/10">
                      <div className="flex justify-center">
                        <Check className="h-6 w-6 text-primary stroke-[4px]" />
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="flex justify-center">
                        {row.tsnap === true ? <Check className="h-5 w-5 text-primary stroke-[3px]" /> : (row.tsnap === false ? <X className="h-4 w-4 opacity-10" /> : <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">{row.tsnap}</span>)}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="flex justify-center">
                        {row.hudl === true ? <Check className="h-5 w-5 text-primary stroke-[3px]" /> : (row.hudl === false ? <X className="h-4 w-4 opacity-10" /> : <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">{row.hudl}</span>)}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="flex justify-center">
                        {row.treach === true ? <Check className="h-5 w-5 text-primary stroke-[3px]" /> : (row.treach === false ? <X className="h-4 w-4 opacity-10" /> : <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">{row.treach}</span>)}
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="flex justify-center">
                        {row.gchanger === true ? <Check className="h-5 w-5 text-primary stroke-[3px]" /> : (row.gchanger === false ? <X className="h-4 w-4 opacity-10" /> : <span className="text-[8px] font-black uppercase text-muted-foreground leading-none">{row.gchanger}</span>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

      <section className="py-32 bg-black text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary text-white border-none font-black px-4 h-7 uppercase tracking-widest text-[10px]">Strategic Advantages</Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">CHAMPIONSHIP <br /> <span className="text-primary italic">OPERATIONS.</span></h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-black uppercase">AI Scouting Analyst</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Generate <strong>Structured Opponent Intel</strong> from match notes using integrated GenAI protocols.</p>
                </div>
                <div className="space-y-3">
                  <Video className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-black uppercase">HD Tactical Capture</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Extract high-resolution <strong>Tactical Frames</strong> from raw film for granular play-by-play breakdown.</p>
                </div>
                <div className="space-y-3">
                  <Building className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-black uppercase">Institutional Hub</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-medium"><strong>Fiscal Pulse Auditing</strong> for club directors managing 20+ squads with aggregated financial visibility.</p>
                </div>
                <div className="space-y-3">
                  <ShieldAlert className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-black uppercase">Recruiting Portfolios</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-medium">Certified <strong>Personnel Evaluations</strong> that athletes can export directly to college recruitment pipelines.</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full" />
              <Card className="relative z-10 rounded-[3rem] border-white/10 bg-white/5 backdrop-blur-xl p-8 lg:p-12 shadow-2xl overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20"><Activity className="h-5 w-5 text-white" /></div>
                      <span className="font-black uppercase tracking-widest text-xs">Live Tactical Feed</span>
                    </div>
                    <Badge variant="outline" className="border-white/20 text-white font-black text-[8px] px-2 h-5">ENCRYPTED</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted/20 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-24 bg-white/20 rounded-full" />
                        <div className="h-2 w-full bg-white/10 rounded-full" />
                      </div>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/40 shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-32 bg-primary/40 rounded-full" />
                        <div className="h-2 w-3/4 bg-primary/20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Coordination Hub</p>
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-black bg-muted/40" />)}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <SectionHeader
            badge="Specialized Interfaces"
            title={<>Tailored <br /> <span className="text-primary italic">Account Roles.</span></>}
            subtitle="Every member of the organization receives a custom dashboard optimized for their specific operational objectives."
          />

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 h-full">
                <Trophy className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Coaches & Managers</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">Full command of the roster, scheduling, and tactical playbooks. Launch broadcasts, auto-generate brackets, and track personnel performance.</p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 h-full">
                <Baby className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Guardian Hub</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">Manage multiple children from one unified Household Hub. Track consolidated dues, verify digital waivers, and manage volunteer assignments globally.</p>
              </Card>
            </motion.div>
            <motion.div whileHover={{ y: -10, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Card className="rounded-[3rem] border-none shadow-xl bg-muted/20 p-10 space-y-6 h-full">
                <User className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-black uppercase tracking-tight">Athlete Performance</h3>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">A personal dashboard. Sign waivers, watch study film, track match results, and manage your <strong>Professional Recruiting Portfolio</strong>.</p>
              </Card>
            </motion.div>
          </StaggerGrid>
        </div>
      </section>

      <section id="pricing" className="py-32 bg-black relative overflow-hidden">
      <PricingCycleContext.Provider value={{ cycle: pricingCycle, setCycle: setPricingCycle }}>
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            className="text-center space-y-5 mb-16 max-w-3xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div variants={fadeUp}>
              <Badge className="bg-primary/20 text-primary border-primary/30 font-black px-4 py-1 uppercase tracking-widest text-[10px]">Transparent Institutional Tiers</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-white">
              SCALE YOUR <span className="text-primary italic">OPERATION.</span>
            </motion.h2>
            <motion.div variants={fadeUp} className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 px-4 py-2 rounded-full border border-primary/20 w-fit mx-auto">
              <AlertCircle className="h-3 w-3" /><span>Limited Introductory Pricing • Competitive Advantage Locked</span>
            </motion.div>

            {/* Billing Cycle Toggle */}
            <motion.div variants={fadeUp} className="flex items-center justify-center mt-4">
              <PricingToggle />
            </motion.div>
          </motion.div>

          {/* ── 5-Day Trial Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-12 overflow-hidden"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/60 via-yellow-400/40 to-primary/60 opacity-60 blur-[2px]" />
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 bg-black rounded-2xl px-8 py-5">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none rounded-2xl"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
              />
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-primary/20 border border-primary/30 rounded-xl p-2.5">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-white font-black uppercase tracking-tight text-sm leading-none">5-Day Free Trial</p>
                  <p className="text-white/50 font-bold text-[10px] uppercase tracking-widest mt-0.5">on all paid plans</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-white/10" />
              <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
                {['Card saved upfront', 'No charge for 5 days', 'Cancel anytime'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-white/60">
                    <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto">
            {/* Row 1: 3 cards */}
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mb-6">
              {/* Starter */}
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="flex flex-col">
              <Card className="rounded-[2.5rem] border border-white/8 shadow-xl overflow-hidden flex flex-col bg-white/5 backdrop-blur-sm h-full">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <CardHeader className="p-8 pb-4 space-y-4">
                  <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-white/20 text-white/60 w-fit">GRASSROOTS</Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Starter</CardTitle>
                    <span className="text-4xl font-black tracking-tighter text-white">$0</span>
                  </div>
                  <CardDescription className="text-[10px] font-bold text-white/40 uppercase">Foundational coordination hub.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 space-y-6">
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[9px] font-black uppercase text-white/30">Included</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><Check className="h-3.5 w-3.5 text-primary" /> Scheduling</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><Check className="h-3.5 w-3.5 text-primary" /> Tactical Chats</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><Check className="h-3.5 w-3.5 text-primary" /> Score Tracking</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border border-white/20 text-white hover:bg-white/10 bg-transparent">Join Free</Button>
                  </Link>
                </CardFooter>
              </Card>
              </motion.div>

              {/* Squad Pro — Hero card */}
              <motion.div whileHover={{ y: -14, scale: 1.03 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="flex flex-col">
              <div className="relative flex flex-col h-full">
                {/* Animated glowing border ring */}
                <div className="absolute -inset-[2px] rounded-[2.6rem] bg-gradient-to-br from-primary via-yellow-400/60 to-primary/40 opacity-80" />
                <Card className="relative rounded-[2.5rem] border-none shadow-2xl overflow-hidden flex flex-col bg-black text-white h-full">
                  {/* Shimmer sweep */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none z-10"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
                  />
                  <div className="absolute top-0 right-0 p-4 opacity-[0.07] -rotate-12 pointer-events-none"><Zap className="h-24 w-24" /></div>
                  <CardHeader className="p-8 pb-4 space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary text-black border-none font-black text-[8px] px-3 h-5 uppercase">MOST POPULAR</Badge>
                      <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-black uppercase tracking-tight">Squad Pro</CardTitle>
                      <PricingDisplay monthly="$19.99" annual="$199" annualMonthly="$16.58" color="text-primary" darkBg />
                    </div>
                    <CardDescription className="text-[10px] font-bold text-white/50 uppercase">Championship tools for one team.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 flex-1 space-y-6 relative z-10">
                    <div className="pt-4 border-t border-white/10 space-y-3">
                      <p className="text-[9px] font-black uppercase text-white/30">Everything in Starter +</p>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/80"><Sparkles className="h-3.5 w-3.5 text-primary" /> 75% Watch Rule</li>
                        <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/80"><Sparkles className="h-3.5 w-3.5 text-primary" /> Auto-Brackets</li>
                        <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/80"><Sparkles className="h-3.5 w-3.5 text-primary" /> Digital Waivers</li>
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 relative z-10">
                    <Link href="/signup" className="w-full">
                      <Button className="w-full h-12 rounded-xl font-black shadow-xl shadow-primary/40 bg-primary text-black hover:bg-primary/90 text-xs uppercase tracking-widest active:scale-95 transition-all">
                        Deploy Pro Team <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
              </motion.div>

              {/* Elite Teams */}
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="flex flex-col">
              <Card className="rounded-[2.5rem] border border-white/8 shadow-xl overflow-hidden flex flex-col bg-white/5 backdrop-blur-sm h-full">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <CardHeader className="p-8 pb-4 space-y-4">
                  <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-primary/30 text-primary w-fit">ORGANIZATION</Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Elite Teams</CardTitle>
                    <PricingDisplay monthly="$119" annual="$1,119" annualMonthly="$93" color="text-primary" />
                  </div>
                  <CardDescription className="text-[10px] font-bold text-white/40 uppercase">8 Pro Teams + Master Club Hub.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 space-y-6">
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[9px] font-black uppercase text-white/30">Institutional</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Recruitment Portal</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Fee Management</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Staff Notes</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border border-white/20 text-white hover:bg-white/10 bg-transparent">Deploy Club</Button>
                  </Link>
                </CardFooter>
              </Card>
              </motion.div>
            </StaggerGrid>

            {/* Row 2: 2 cards centered on desktop, stacked on mobile */}
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
              {/* Elite League */}
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="flex flex-col">
              <Card className="rounded-[2.5rem] border border-white/8 shadow-xl overflow-hidden flex flex-col bg-white/5 backdrop-blur-sm w-full h-full">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                <CardHeader className="p-8 pb-4 space-y-4">
                  <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-primary/30 text-primary w-fit">INSTITUTIONAL</Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">Elite League</CardTitle>
                    <PricingDisplay monthly="$279" annual="$2,790" annualMonthly="$233" color="text-primary" />
                  </div>
                  <CardDescription className="text-[10px] font-bold text-white/40 uppercase">20 Pro Teams + Public Hubs.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 space-y-6">
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[9px] font-black uppercase text-white/30">Full Infrastructure</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Conflict Mgmt</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Public Spectator Link</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Custom Domain</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border border-white/20 text-white hover:bg-white/10 hover:border-primary/40 hover:text-primary bg-transparent">Deploy League</Button>
                  </Link>
                </CardFooter>
              </Card>
              </motion.div>

              {/* School District */}
              <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ type: 'spring', stiffness: 280, damping: 22 }} className="flex flex-col">
              <Card className="rounded-[2.5rem] border border-[#10b981]/15 shadow-xl overflow-hidden flex flex-col bg-white/5 backdrop-blur-sm w-full h-full">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#10b981]/40 to-transparent" />
                <CardHeader className="p-8 pb-4 space-y-4">
                  <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-[#10b981]/30 text-[#10b981] w-fit">K-12 DISTRICT</Badge>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black uppercase tracking-tight text-white">School District</CardTitle>
                    <PricingDisplay monthly="$175" annual="$1,750" annualMonthly="$146" color="text-[#10b981]" />
                  </div>
                  <CardDescription className="text-[10px] font-bold text-white/40 uppercase">Unlimited Sports & Programs.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 flex-1 space-y-6">
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[9px] font-black uppercase text-white/30">Academic Athletics</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><GraduationCap className="h-3.5 w-3.5 text-[#10b981]" /> District Dashboard</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><GraduationCap className="h-3.5 w-3.5 text-[#10b981]" /> Athletic Director Hub</li>
                      <li className="flex items-center gap-2 text-[10px] font-bold uppercase text-white/70"><GraduationCap className="h-3.5 w-3.5 text-[#10b981]" /> Academic Eligibility</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/10 hover:border-[#10b981]/50 bg-transparent">Deploy School</Button>
                  </Link>
                </CardFooter>
              </Card>
              </motion.div>
            </StaggerGrid>
          </div>

          <motion.div
            className="mt-10 text-center"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[10px] font-black uppercase text-red-500/60 tracking-widest">All pricing is presented and billed in CAD.</p>
          </motion.div>
        </div>
      </PricingCycleContext.Provider>
      </section>

      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Get in touch</p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight">Institutional Scale <br />Custom Solutions.</h2>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  We offer enterprise-grade configurations for national leagues and professional clubs. Connect with our strategic analysts.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">teams@thesquad.pro</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">Global Tactical Support</span>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[3rem] p-8 md:p-12 overflow-hidden ring-1 ring-black/5 bg-background">
              <ContactForm db={db} />
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link href="/" className="flex items-center gap-3">
              <BrandLogo variant="light-background" className="h-8 w-32" />
            </Link>
                        <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
              <Link href="/how-to" className="hover:text-primary transition-colors">How to Guide</Link>
              <Link href="/Tactical_User_Manual.md" className="hidden hover:text-primary transition-colors text-primary font-black scale-110">Tactical Manual</Link>
              <Link href="/AI_KNOWLEDGE_BASE.md" className="hidden hover:text-primary transition-colors">AI Knowledge Base</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>

            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()} The Squad Hub. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Elfsight AI Chatbot | Squad Pro */}
      <Script src="https://elfsightcdn.com/platform.js" async />
      <div className="elfsight-app-4f8f60bc-5748-46cb-914c-1b03d7c8826e" data-elfsight-app-lazy></div>
    </div>
  );
}
