
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  LayoutDashboard, 
  CalendarDays, 
  Shield, 
  Trophy, 
  Dumbbell, 
  MessageCircle, 
  Users2, 
  FolderClosed,
  Zap,
  CheckCircle2,
  Lock,
  Star,
  Info,
  CreditCard,
  Building,
  HelpCircle,
  Plus,
  BarChart2,
  ExternalLink,
  Signature,
  Download,
  Settings,
  Bell,
  Camera,
  Share2,
  History,
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  MousePointer2,
  Smartphone,
  Check,
  Video,
  Play,
  HardDrive,
  ClipboardList,
  UserPlus,
  BookOpen,
  ArrowRight,
  User,
  Baby,
  Table,
  Target,
  Activity,
  DollarSign,
  PenTool,
  Hash,
  MapPin,
  Package,
  Terminal,
  MessageSquare,
  Megaphone,
  HandHelping,
  BrainCircuit,
  Wand2,
  GraduationCap,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BrandLogo from '@/components/BrandLogo';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';

type AccountType = 'starter' | 'pro' | 'elite' | 'player' | 'parent';

interface ManualSection {
  title: string;
  icon: any;
  steps: Array<{ step: string; detail: string }>;
}

export default function HowToGuidePage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedType, setSelectedAccountType] = useState<AccountType | null>(null);

  // --- REUSABLE INSTRUCTION BLOCKS ---

  const BLOCK_SQUAD_SETUP = {
    title: "1. Squad Deployment & Recruitment",
    icon: UserPlus,
    steps: [
      { step: "Launch Team", detail: "Start at the Dashboard and select 'New Squad'. Choose your tier (Starter or Pro) to initialize the coordination hub." },
      { step: "Retrieve Join Code", detail: "Navigate to 'Team Profile' to find your unique 6-digit Squad Code. This is the only way for others to join." },
      { step: "Invite Members", detail: "Share the code via text or email. Teammates use the 'Recruitment Hub' to enroll themselves instantly." }
    ]
  };

  const BLOCK_SCHEDULING = {
    title: "2. Strategic Scheduling & RSVPs",
    icon: CalendarDays,
    steps: [
      { step: "Create Activity", detail: "In 'Schedule', use '+ New Activity' to log Match Days, Training, or Meetings. Set location and times." },
      { step: "Calendar View", detail: "Use the 'Calendar' tab for a unified chronological view of all squad commitments across all your teams." },
      { step: "Monitor RSVPs", detail: "Click any event to see who is 'Going', 'Maybe', or 'Declined' in real-time. Crucial for match-day planning." }
    ]
  };

  const BLOCK_COMMS = {
    title: "3. Communication & Social Feed",
    icon: MessageCircle,
    steps: [
      { step: "Squad Feed", detail: "Use the 'Feed' to view system updates and coordination notes. Note: Posting and polls are unlocked in Pro." },
      { step: "Tactical Chats", detail: "Open 'Chats' to establish secure messaging groups for specific squad units or travel planning." },
      { step: "Broadcast Alerts", detail: "Coaches can use the Megaphone icon to send urgent, full-screen team-wide alerts for venue changes." }
    ]
  };

  const BLOCK_PERFORMANCE = {
    title: "4. Result Ledgers & Tournaments",
    icon: Trophy,
    steps: [
      { step: "Scorekeeping", detail: "Visit the 'Scorekeeping' hub after matches. Enter 'Us vs Them' scores to update the season Win/Loss record." },
      { step: "Manual Itineraries", detail: "Add 'Tournament' events to create multi-day calendar blocks for championships. Pro unlocks automated brackets." }
    ]
  };

  const BLOCK_RESOURCES = {
    title: "5. Playbook, Film & Library",
    icon: Dumbbell,
    steps: [
      { step: "Archive Drills", detail: "In 'Playbook', add execution protocols with instructions and external video links for squad study." },
      { step: "Film Study", detail: "Upload match film to the Playbook. Teammates must watch 75% of the video to be marked compliant in the roster." },
      { step: "Resource Repository", detail: "Upload PDFs or images to the 'Library' for administrative access (maps, rules, handbooks)." }
    ]
  };

  const BLOCK_SCOUTING_AI = {
    title: "6. AI Scouting Intelligence",
    icon: BrainCircuit,
    steps: [
      { step: "Draft Observation", detail: "In the Scouting hub, enter raw notes about an opponent's recent performance or tendencies." },
      { step: "Generate Brief", detail: "Tap 'Generate AI Brief' to have the analyzer structure your notes into Strengths, Weaknesses, and Keys to Victory." },
      { step: "Publish Intel", detail: "Commit the report to the squad hub so all players can study the match-up before game day." }
    ]
  };

  const BLOCK_CLUB_AUDIT = {
    title: "7. Institutional Club Command",
    icon: Building,
    steps: [
      { step: "Fiscal Pulse", detail: "Use the Club Hub to audit aggregated dues collection across all your organization's teams." },
      { step: "Staff Directory", detail: "Manage personnel across every squad from a single master directory. Assign Pro seats to specific coaches." },
      { step: "Facility Audit", detail: "View organization-wide field bookings to resolve scheduling conflicts before they occur." }
    ]
  };

  const BLOCK_RECRUITMENT = {
    title: "8. Public Recruitment Hub",
    icon: ClipboardList,
    steps: [
      { step: "Form Architect", detail: "Build custom registration forms with logic for sizes, medical history, and digital waivers." },
      { step: "Public Portal", detail: "Share your unique Portal URL. New recruits can apply without needing an initial account." },
      { step: "Ledger Approval", detail: "Review submissions in the Ledger. Approve applicants and assign them directly to your club's squads." }
    ]
  };

  const MANUAL_CONTENT: Record<AccountType, { label: string; desc: string; highlights: string[]; sections: ManualSection[] }> = {
    starter: {
      label: "Starter (Free)",
      desc: "Essential coordination for grassroots squads. Master the core coordination engine.",
      highlights: ["Unlimited Teams", "Tactical Chat", "Basic Scheduling", "Manual Scorekeeping", "Playbook Basics", "Library"],
      sections: [BLOCK_SQUAD_SETUP, BLOCK_SCHEDULING, BLOCK_COMMS, BLOCK_PERFORMANCE, BLOCK_RESOURCES]
    },
    pro: {
      label: "Squad Pro",
      desc: "Full coordination for elite squads. Advanced verification and AI-driven scout analysis.",
      highlights: ["Everything in Starter", "Auto-Scheduler", "75% Film Rule", "AI Scouting", "Digital Signatures", "Advanced Stats"],
      sections: [BLOCK_SQUAD_SETUP, BLOCK_SCHEDULING, BLOCK_COMMS, BLOCK_PERFORMANCE, BLOCK_RESOURCES, BLOCK_SCOUTING_AI]
    },
    elite: {
      label: "Elite Org (Team/League)",
      desc: "Institutional infrastructure. Complete tactical suite for multi-team organizations.",
      highlights: ["Multi-Team Club Hub", "Public Recruitment", "Fiscal Audit", "Facility Conflicts", "Staff Directory", "AI Strategy"],
      sections: [BLOCK_SQUAD_SETUP, BLOCK_SCHEDULING, BLOCK_COMMS, BLOCK_PERFORMANCE, BLOCK_RESOURCES, BLOCK_SCOUTING_AI, BLOCK_CLUB_AUDIT, BLOCK_RECRUITMENT]
    },
    player: {
      label: "Individual Athlete",
      desc: "Stay coordinated and ready. Your personal recruitment portfolio and performance hub.",
      highlights: ["Join via Code", "Recruiting Portfolio", "RSVP Mandate", "Film Compliance", "Digital Vault"],
      sections: [
        {
          title: "1. Recruitment & Enrollment",
          icon: UserPlus,
          steps: [
            { step: "Join via Code", detail: "Enter the 6-digit code from your coach in the 'Recruitment Hub' to join your team's tactical board." },
            { step: "Professional Portfolio", detail: "In the Roster hub, tap 'Generate Scouting Pack' to export your certified tactical resume for recruiters." }
          ]
        },
        {
          title: "2. Compliance & Film Study",
          icon: Video,
          steps: [
            { step: "The 75% Rule", detail: "Watch 75% of assigned film or drills in the Playbook to be marked 'Compliant' in your coach's ledger." },
            { step: "Digital Signatures", detail: "Execute pending waivers in the 'Library' hub to ensure eligibility for upcoming series." }
          ]
        }
      ]
    },
    parent: {
      label: "Parent / Guardian",
      desc: "Unified household safety and fiscal command for multiple minor players.",
      highlights: ["Household Pulse", "Fiscal Audit", "Minor Registration", "Unified Calendar", "Volunteer Board"],
      sections: [
        {
          title: "1. Household Hub",
          icon: Baby,
          steps: [
            { step: "Register Minors", detail: "Add children in 'Family Hub'. They link to your account for unified scheduling and payment tracking." },
            { step: "Fiscal Audit", detail: "View the 'Household Balance' on your dashboard to see aggregated dues across all active squads." }
          ]
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={user ? "/dashboard" : "/"}>
            <BrandLogo variant="light-background" className="h-8 w-32" />
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="font-bold" 
            onClick={() => selectedType ? setSelectedAccountType(null) : (user ? router.push('/settings') : router.push('/'))}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> 
            {selectedType ? 'Back to Selection' : 'Back'}
          </Button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {!selectedType ? (
          <div className="space-y-16 animate-in fade-in duration-700">
            <section className="text-center space-y-6">
              <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px] px-4 h-7">Tactical Manual</Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">The Operational <span className="text-primary italic">Manual.</span></h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">Select your account perspective for exhaustive coordination guidance.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.keys(MANUAL_CONTENT) as AccountType[]).map((type) => {
                const data = MANUAL_CONTENT[type];
                const Icon = type === 'starter' ? Users : type === 'pro' ? Zap : type === 'elite' ? Building : type === 'player' ? User : Baby;
                
                return (
                  <Card 
                    key={type} 
                    className="rounded-[2.5rem] border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group bg-white ring-1 ring-black/5 overflow-hidden"
                    onClick={() => setSelectedAccountType(type)}
                  >
                    <div className={cn(
                      "h-2 w-full",
                      type === 'starter' ? "bg-muted" : type === 'pro' ? "bg-primary" : "bg-black"
                    )} />
                    <CardContent className="p-8 space-y-4">
                      <div className="bg-muted p-4 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{data.label}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{data.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
            <section className="space-y-6 border-b pb-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-3xl text-primary shadow-inner">
                  {selectedType === 'starter' && <Users className="h-8 w-8" />}
                  {selectedType === 'pro' && <Zap className="h-8 w-8" />}
                  {selectedType === 'elite' && <Building className="h-8 w-8" />}
                  {selectedType === 'player' && <User className="h-8 w-8" />}
                  {selectedType === 'parent' && <Baby className="h-8 w-8" />}
                </div>
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tight">{MANUAL_CONTENT[selectedType].label} Guide</h2>
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">{MANUAL_CONTENT[selectedType].desc}</p>
                </div>
              </div>

              <div className="bg-muted/30 p-6 rounded-[2rem] border-2 border-dashed">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 ml-1">Key Tier Capabilities</p>
                <div className="flex flex-wrap gap-2">
                  {MANUAL_CONTENT[selectedType].highlights.map((h, i) => (
                    <Badge key={i} className="bg-white text-black border-none shadow-sm font-black uppercase text-[10px] h-8 px-4">
                      {h}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-12">
              {MANUAL_CONTENT[selectedType].sections.map((section, idx) => (
                <Card key={idx} className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-white ring-1 ring-black/5">
                  <CardHeader className="bg-muted/30 p-8 lg:p-10 border-b flex flex-row items-center gap-6">
                    <div className="bg-white p-4 rounded-2xl shadow-sm text-primary">
                      <section.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 lg:p-12">
                    <div className="space-y-10">
                      {section.steps.map((s, stepIdx) => (
                        <div key={stepIdx} className="flex gap-8 relative group">
                          {stepIdx < section.steps.length - 1 && (
                            <div className="absolute left-[19px] top-10 w-0.5 h-full bg-muted group-hover:bg-primary/20 transition-colors" />
                          )}
                          <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center shrink-0 font-black text-sm z-10 shadow-lg group-hover:bg-primary transition-colors">
                            {stepIdx + 1}
                          </div>
                          <div className="space-y-2 pt-1">
                            <h4 className="font-black text-lg uppercase tracking-tight text-primary">{s.step}</h4>
                            <p className="text-base font-medium leading-relaxed text-muted-foreground">{s.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
