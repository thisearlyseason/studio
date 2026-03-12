
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Infinity,
  AlertCircle,
  Zap,
  User,
  Baby,
  Table as TableIcon,
  Sparkles,
  Loader2,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import BrandLogo from '@/components/BrandLogo';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUser, useAuth } from '@/firebase';
import { signInAnonymously, signOut } from 'firebase/auth';
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

const DEMO_OPTIONS = [
  { id: 'starter_squad', name: 'Starter Demo', icon: Users, desc: 'Grassroots essentials' },
  { id: 'elite_teams', name: 'Elite Team Demo', icon: Zap, desc: 'Advanced coordination & analytics' },
  { id: 'player_demo', name: 'Player Demo', icon: User, desc: 'Individual teammate view' },
  { id: 'parent_demo', name: 'Parent Demo', icon: Baby, desc: 'Guardian safety view' }
];

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const sportsImages = PlaceHolderImages
    .filter(img => img.id.startsWith('sport-'))
    .map(img => img.imageUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sportsImages.length);
    }, 5000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sportsImages.length]);

  const handleLaunchDemo = async (planId: string) => {
    setIsDemoLoading(true);
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      router.push(`/dashboard?seed_demo=${planId}`);
    } catch (error: any) {
      toast({
        title: "Demo Launch Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      setIsDemoLoading(false);
    }
  };

  if (isUserLoading) return (
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
            <a href="#pricing" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Pricing</a>
            <a href="#contact" className={cn("hover:text-primary transition-colors", isScrolled ? "text-muted-foreground" : "text-white/80")}>Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className={cn("font-bold", isScrolled ? "text-foreground" : "text-white hover:bg-white/10")}>
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {sportsImages.map((img, idx) => (
          <div 
            key={idx}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              currentImageIndex === idx ? "opacity-100" : "opacity-0"
            )}
          >
            <Image 
              src={img} 
              alt="Sports Background" 
              fill
              className="object-cover scale-105"
              data-ai-hint="sports background"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
          </div>
        ))}

        <div className="container relative z-10 px-6 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-primary/20 backdrop-blur-md text-primary-foreground border-primary/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] animate-pulse">
            The Ultimate Team Hub
          </Badge>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] max-w-4xl mx-auto drop-shadow-2xl">
            COORDINATE <br className="hidden md:block" /> LIKE <span className="text-primary italic">PROS.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Unite your squad, manage schedules, and dominate the season with the all-in-one platform for competitive teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {user ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all w-full sm:w-auto">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-black shadow-2xl shadow-primary/40 active:scale-95 transition-all w-full sm:w-auto">
                  Start Your Squad <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Dialog open={isDemoDialogOpen} onOpenChange={setIsDemoDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg font-black bg-white/10 border-white/20 text-white backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all w-full sm:w-auto">
                  See the Demo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-4xl rounded-[3rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
                <div className="h-2 bg-primary w-full" />
                <div className="p-8 lg:p-12 space-y-8">
                  <div className="text-center space-y-2">
                    <DialogTitle className="text-4xl font-black uppercase tracking-tight">Interactive Demos</DialogTitle>
                    <DialogDescription className="text-base font-bold text-primary uppercase tracking-widest">Select your tactical perspective</DialogDescription>
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

                  <p className="text-[10px] text-center text-muted-foreground font-black uppercase tracking-[0.2em] pt-4">
                    No account required • Instant guest deployment
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 hidden md:block">
          <div className="container mx-auto px-6 flex justify-center gap-20 text-white">
            <div className="text-center">
              <p className="text-3xl font-black">2.5k+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Active Teams</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">50k+</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Scheduled Games</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black">99.9%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">Coordination Rate</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-24 max-w-3xl mx-auto">
            <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black px-4 py-1 uppercase tracking-widest text-[10px]">
              The Suite
            </Badge>
            <h3 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              BUILT FOR <br /> <span className="text-primary italic">CHAMPIONS.</span>
            </h3>
            <p className="text-muted-foreground font-medium text-lg pt-4 leading-relaxed">
              Ditch the fragmented group chats. The Squad provides a unified, high-performance platform for elite coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "RECRUITMENT HUB", 
                desc: "Automated player enrollment with custom forms and coach assignment logic.", 
                img: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800",
                hint: "team meeting"
              },
              { 
                title: "TACTICAL CHATS", 
                desc: "Secure, role-based discussions for strategy, positions, and events.", 
                img: "https://images.unsplash.com/photo-1612768875331-0447b960fa40?auto=format&fit=crop&q=80&w=800",
                hint: "basketball player"
              },
              { 
                title: "GAME SCHEDULING", 
                desc: "Real-time RSVP tracking and match day logistics for the entire squad.", 
                img: "https://images.unsplash.com/photo-1508088062105-17d61307629d?auto=format&fit=crop&q=80&w=800",
                hint: "soccer match"
              },
              { 
                title: "SCORE TRACKING", 
                desc: "Visualize your trajectory with automated win/loss and performance tracking.", 
                img: "https://images.unsplash.com/photo-1711045676217-c3d73143071c?auto=format&fit=crop&q=80&w=800",
                hint: "baseball game"
              },
              { 
                title: "LIVE FEED", 
                desc: "A high-priority broadcast hub for squad updates, media, and alerts.", 
                img: "https://images.unsplash.com/photo-1614743653196-d969b45200b9?auto=format&fit=crop&q=80&w=1080",
                hint: "tennis player"
              },
              { 
                title: "PLAYBOOK & FILM", 
                desc: "Centralized hub for video study with automated watch verification and tactical notes.", 
                img: "https://images.unsplash.com/photo-1486128105845-91daff43f404?auto=format&fit=crop&q=80&w=800",
                hint: "video analysis"
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[1.02] cursor-default"
              >
                <Image 
                  src={feature.img} 
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  data-ai-hint={feature.hint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                <CardContent className="absolute bottom-0 p-8 space-y-4 w-full">
                  <Badge className="bg-primary text-white border-none font-black px-3 py-1 uppercase tracking-widest text-[9px]">
                    ELITE COORDINATION
                  </Badge>
                  <h4 className="text-3xl font-black text-white tracking-tighter leading-none">
                    {feature.title}
                  </h4>
                  <p className="text-white/70 font-medium text-sm leading-relaxed max-w-[240px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {feature.desc}
                  </p>
                  <div className="pt-2">
                    <div className="h-1 w-12 bg-primary group-hover:w-full transition-all duration-700 ease-in-out" />
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Simple, transparent pricing</h2>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight">Institutional Operational Tiers</h3>
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Prices listed in USD</p>
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-white px-4 py-2 rounded-full border border-primary/10 shadow-sm">
                <AlertCircle className="h-3 w-3" />
                <span>Limited Introductory Pricing • Subject to Change</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {/* Starter */}
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden flex flex-col bg-white ring-1 ring-black/5">
              <CardHeader className="p-8 pb-4 space-y-4">
                <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-primary/20 text-primary w-fit">GRASSROOTS</Badge>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Starter</CardTitle>
                  <span className="text-4xl font-black tracking-tighter">$0</span>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Foundational coordination hub.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-6">
                <div className="pt-4 border-t space-y-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Included</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Check className="h-3.5 w-3.5 text-primary" /> Scheduling</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Check className="h-3.5 w-3.5 text-primary" /> Tactical Chats</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Check className="h-3.5 w-3.5 text-primary" /> Score Tracking</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs">Join Free</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Squad Pro */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden flex flex-col bg-black text-white ring-4 ring-primary relative scale-105 z-10">
              <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 pointer-events-none"><Zap className="h-20 w-20" /></div>
              <CardHeader className="p-8 pb-4 space-y-4">
                <Badge className="bg-primary text-white border-none font-black text-[8px] px-3 h-5 uppercase w-fit">BEST VALUE</Badge>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Squad Pro</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter text-primary">$19.99</span>
                    <span className="text-[10px] font-black uppercase opacity-60">/mo</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-white/60 uppercase">Elite coordination for one squad.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-6">
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-[9px] font-black uppercase text-white/40">Pro Features</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Sparkles className="h-3.5 w-3.5 text-primary" /> Bracket Engine</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Sparkles className="h-3.5 w-3.5 text-primary" /> Film Study</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><Sparkles className="h-3.5 w-3.5 text-primary" /> Compliance</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Link href="/signup" className="w-full">
                  <Button className="w-full h-12 rounded-xl font-black shadow-xl bg-white text-black hover:bg-white/90 text-xs">Upgrade Now</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Elite Teams */}
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden flex flex-col bg-white ring-1 ring-black/5">
              <CardHeader className="p-8 pb-4 space-y-4">
                <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-primary/20 text-primary w-fit">CLUB</Badge>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Elite Teams</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter text-primary">$110</span>
                    <span className="text-[10px] font-black uppercase opacity-60">/mo</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Up to 8 Pro Teams + Hub.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-6">
                <div className="pt-4 border-t space-y-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Institutional</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Club Hub</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Portal Architect</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Multi-Seat Mgmt</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border-2">Deploy Club</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Elite League */}
            <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden flex flex-col bg-white ring-1 ring-black/5">
              <CardHeader className="p-8 pb-4 space-y-4">
                <Badge variant="outline" className="font-black uppercase text-[8px] tracking-widest px-3 h-5 border-primary/20 text-primary w-fit">LEAGUE</Badge>
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight">Elite League</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tighter text-primary">$279</span>
                    <span className="text-[10px] font-black uppercase opacity-60">/mo</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">20 Pro Teams + Support.</p>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-1 space-y-6">
                <div className="pt-4 border-t space-y-3">
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Master Strategy</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> League Series</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Conflict Res.</li>
                    <li className="flex items-center gap-2 text-[10px] font-bold uppercase"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Institutional SLA</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black uppercase text-xs border-2">Deploy League</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Get in touch</h2>
                <h3 className="text-4xl md:text-5xl font-black tracking-tight">Need a custom plan <br />for your organization?</h3>
                <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                  We offer enterprise-grade solutions for sports leagues and multi-team organizations. Connect with our coordination experts today.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">team@thesquad.pro</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">Worldwide</span>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Infinity className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground">Unlimited Starter Support</span>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-2xl rounded-[3rem] p-8 md:p-12 overflow-hidden ring-1 ring-black/5 bg-background">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest">Name</Label>
                    <Input placeholder="John Doe" className="h-12 rounded-xl bg-muted/50 border-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest">Email</Label>
                    <Input type="email" placeholder="john@example.com" className="h-12 rounded-xl bg-muted/50 border-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest">Team/League Name</Label>
                  <Input placeholder="Westside Warriors" className="h-12 rounded-xl bg-muted/50 border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest">How can we help?</Label>
                  <Textarea placeholder="Tell us about your organization..." className="min-h-[120px] rounded-xl bg-muted/50 border-none resize-none" />
                </div>
                <Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 active:scale-95 transition-all">
                  Send Inquiry
                </Button>
              </form>
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
            
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/how-to" className="hover:text-primary transition-colors">How to Guide</Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/safety" className="hover:text-primary transition-colors">Safety Center</Link>
            </div>

            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              © {new Date().getFullYear()} The Squad Hub. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
