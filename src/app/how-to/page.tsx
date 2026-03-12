
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
  Award,
  CircleCheck,
  RotateCcw
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
  steps: Array<{ step: string; detail: React.ReactNode }>;
}

export default function HowToGuidePage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedType, setSelectedAccountType] = useState<AccountType | null>(null);

  // --- REUSABLE TACTICAL BLOCKS ---

  const BLOCK_DEPLOYMENT = {
    title: "1. Squad Deployment & Recruitment",
    icon: UserPlus,
    steps: [
      { step: "Launch Team", detail: <>Start at the Dashboard and select <strong>New Squad</strong>. Choose your tier to initialize the coordination hub.</> },
      { step: "Retrieve Join Code", detail: <>Navigate to <strong>Team Profile</strong> to find your unique 6-digit Squad Code. This is the primary key for enrollment.</> },
      { step: "Invite Members", detail: <>Share the code via text or email. Teammates use the <strong>Recruitment Hub</strong> to enroll themselves instantly.</> }
    ]
  };

  const BLOCK_SCHEDULING = {
    title: "2. Strategic Scheduling",
    icon: CalendarDays,
    steps: [
      { step: "Create Activity", detail: <>In the <strong>Schedule</strong> hub, use <strong>+ New Activity</strong> to log Match Days, Training, or Tactical Meetings. Set location and precise start times.</> },
      { step: "Calendar View", detail: <>Use the <strong>Calendar</strong> tab for a unified chronological view of all squad commitments across multiple teams.</> },
      { step: "RSVP Monitoring", detail: <>Click any event to see who is <strong>Going</strong>, <strong>Maybe</strong>, or <strong>Declined</strong> in real-time. Crucial for match-day logistics.</> }
    ]
  };

  const BLOCK_COMMUNICATION = {
    title: "3. Communication & Live Chats",
    icon: MessageCircle,
    steps: [
      { step: "Tactical Chats", detail: <>Open the <strong>Chats</strong> hub to establish secure messaging groups. Create channels for specific squad units (e.g., Defensive Unit) or travel planning.</> },
      { step: "Live Feed", detail: <>Use the <strong>Feed</strong> to view system updates and broadcasts. Pro/Elite users can post polls and media to spark squad engagement.</> },
      { step: "Member Messaging", detail: <>Directly message any coach or opponent via the <strong>Leagues</strong> directory to coordinate match logistics.</> }
    ]
  };

  const BLOCK_SCOREKEEPING = {
    title: "4. Performance & Result Ledger",
    icon: Trophy,
    steps: [
      { step: "Record Match", detail: <>Visit <strong>Scorekeeping</strong> after matches. Enter <strong>Us vs Them</strong> scores to update the season Win/Loss record instantly.</> },
      { step: "Manual Itineraries", detail: <>Add <strong>Tournament</strong> events to create multi-day calendar blocks. This serves as a manual schedule for championship weekend.</> },
      { step: "Standing Sync", detail: <>League matches automatically update the <strong>Leagues</strong> leaderboard once the result is posted to the ledger.</> }
    ]
  };

  const BLOCK_PLAYBOOK = {
    title: "5. Playbook & Study Film",
    icon: Dumbbell,
    steps: [
      { step: "Archive Drills", detail: <>In the <strong>Playbook</strong>, add execution protocols with instructions and external video links for squad study.</> },
      { step: "Film Study", detail: <>Upload match film to the Playbook hub. Pro tiers enable high-speed 10GB media storage for detailed game analysis.</> },
      { step: "Tactical Repository", detail: <>Use the <strong>Library</strong> to upload PDFs (maps, handbooks, rules) for immediate administrative access.</> }
    ]
  };

  const BLOCK_ELITE_ACTIVATION = {
    title: "6. Activating Elite Status",
    icon: Zap,
    steps: [
      { step: "Provision Seat", detail: <>After upgrading, visit <strong>Team Profile</strong> and use <strong>Override Tier</strong> to attach the Pro seat to your primary squad.</> },
      { step: "Unlock Modules", detail: <>Verify the <strong>ELITE PRO</strong> badge in your team switcher. Advanced film study, analytics, and tournament tools are now live.</> }
    ]
  };

  const BLOCK_TOURNAMENT_ENGINE = {
    title: "7. The Elite Tournament Engine",
    icon: Table,
    steps: [
      { step: "Roster Enrollment", detail: <>Create a Tournament. In the <strong>Deploy</strong> tab, enter participating squad names to initialize the bracket engine.</> },
      { step: "Auto-Scheduler", detail: <>Define match lengths and breaks. Tap <strong>Deploy Complex Itinerary</strong> to auto-generate pairings across available fields.</> },
      { step: "Portal Distribution", detail: <>In <strong>Portals</strong>, share the <strong>Spectator Hub</strong> with fans and the <strong>Scorekeeper Hub</strong> with marshals for live updates.</> }
    ]
  };

  const BLOCK_FILM_COMPLIANCE = {
    title: "8. Film Watch Verification",
    icon: Video,
    steps: [
      { step: "The 75% Rule", detail: <>The system tracks precise watch time. Teammates must watch <strong>75% of the video</strong> to be marked as <strong>Compliant</strong> in your roster ledger.</> },
      { step: "Audit Ledger", detail: <>View the Roster to see who has completed their film study. A <strong>Checkmark</strong> appears once the watch threshold is met.</> }
    ]
  };

  const BLOCK_FEES_GOVERNANCE = {
    title: "9. Roster Fees & Governance",
    icon: DollarSign,
    steps: [
      { step: "Post Dues", detail: <>In the Roster hub, attach uniform or tournament fees to player profiles. Track <strong>Paid</strong> vs <strong>Owed</strong> status automatically.</> },
      { step: "Staff Evaluations", detail: <>Use <strong>Private Staff Notes</strong> in the Roster to log tactical performance reviews visible only to your coaching staff.</> },
      { step: "Digital Signatures", detail: <>Upload protocols to <strong>Coaches Corner</strong>. The system collects and archives verified digital signatures from every member.</> }
    ]
  };

  const BLOCK_HIGH_PRIORITY = {
    title: "10. High-Priority Command",
    icon: Megaphone,
    steps: [
      { step: "Broadcast Alerts", detail: <>Use the <strong>Megaphone</strong> icon to send urgent, full-screen team-wide popups for last-minute venue changes or safety news.</> },
      { step: "Advanced Trajectory", detail: <>In <strong>Scorekeeping</strong>, visualize PPG, Win Trends, and opponent scouting patterns via interactive Pro charts.</> }
    ]
  };

  const BLOCK_CLUB_HUB = {
    title: "11. Institutional Club Hub",
    icon: Building,
    steps: [
      { step: "Fiscal Pulse", detail: <>Access the <strong>Club Hub</strong> to audit aggregated dues collection across all squads in your entire organization.</> },
      { step: "Fleet Management", detail: <>Manage equipment and facility assets from a master ledger. Resolve scheduling conflicts across 20+ squads instantly.</> },
      { step: "Staff Directory", detail: <>Manage personnel and coach assignments from a central directory. Provision Pro seats to specific squads as needed.</> }
    ]
  };

  const BLOCK_PUBLIC_RECRUITMENT = {
    title: "12. Public Recruitment Hub",
    icon: ClipboardList,
    steps: [
      { step: "Form Architect", detail: <>Build custom registration forms with logic for jersey sizes, medical history, and digital waivers.</> },
      { step: "Public Portal", detail: <>Share your <strong>Portal URL</strong>. New recruits can apply without an account. Review and approve submissions in the <strong>Ledger</strong>.</> },
      { step: "Squad Assignment", detail: <>Directly deploy approved applicants to specific squads in your organization with one tap.</> }
    ]
  };

  const BLOCK_SCOUTING_AI = {
    title: "13. AI Scouting Analyst",
    icon: BrainCircuit,
    steps: [
      { step: "Raw Observations", detail: <>In the <strong>Scouting</strong> tab, enter raw match notes about an opponent's tendencies or recent results.</> },
      { step: "Generate Brief", detail: <>Tap <strong>Generate AI Brief</strong> to have our Tactical Analyst structure your notes into <strong>Strengths, Weaknesses, and Keys to Victory</strong>.</> }
    ]
  };

  const BLOCK_LOGISTICS_FLEET = {
    title: "14. Fleet & Facility Logistics",
    icon: MapPin,
    steps: [
      { step: "Resource Booking", detail: <>Enroll facilities and specific fields in the <strong>Facilities</strong> hub. Assign them to events to block off time globally.</> },
      { step: "Inventory Vault", detail: <>Track uniforms, balls, and medical kits in <strong>Equipment</strong>. Log assignments to specific players and track return status.</> }
    ]
  };

  const BLOCK_PLAYER_HUB = {
    title: "Athlete Operational Hub",
    icon: User,
    steps: [
      { step: "Recruiting Portfolio", detail: <>In the Roster hub, tap <strong>Generate Scouting Pack</strong> to export a certified tactical resume for recruiters and scouts.</> },
      { step: "The RSVP Mandate", detail: <>Check your <strong>Dashboard</strong> itinerary daily. Submit your RSVP status for all games and training to ensure match-day eligibility.</> },
      { step: "Compliance Tasks", detail: <>Watch assigned film in the Playbook. Sign digital waivers in the <strong>Library</strong> to maintain a <strong>Cleared</strong> status.</> }
    ]
  };

  const BLOCK_PARENT_HUB = {
    title: "Guardian Safety Hub",
    icon: Baby,
    steps: [
      { step: "Household Command", detail: <>Add children in the <strong>Family Hub</strong>. They link to your account for unified scheduling and consolidated billing.</> },
      { step: "Fiscal Audit", detail: <>View your <strong>Household Balance</strong> on the dashboard to track aggregated dues across all active squads.</> },
      { step: "Volunteer Board", detail: <>Visit the <strong>Volunteer Hub</strong> to claim concessions or hospitality shifts. Track your verified hours for the season.</> }
    ]
  };

  const MANUAL_CONTENT: Record<AccountType, { label: string; desc: string; highlights: string[]; sections: ManualSection[] }> = {
    starter: {
      label: "Starter (Free)",
      desc: "Foundational coordination for grassroots squads. Master the core coordination engine.",
      highlights: ["Unlimited Teams", "Tactical Chats", "Match Scheduling", "Manual Scorekeeping", "Playbook Drills", "Library Repository"],
      sections: [BLOCK_DEPLOYMENT, BLOCK_SCHEDULING, BLOCK_COMMUNICATION, BLOCK_SCOREKEEPING, BLOCK_PLAYBOOK]
    },
    pro: {
      label: "Squad Pro",
      desc: "Full coordination for elite squads. Advanced verification and AI-driven scout analysis.",
      highlights: ["Everything in Starter", "Elite Auto-Scheduler", "75% Film Watch Rule", "Digital Waivers", "High-Priority Alerts", "AI Scouting"],
      sections: [BLOCK_DEPLOYMENT, BLOCK_SCHEDULING, BLOCK_COMMUNICATION, BLOCK_SCOREKEEPING, BLOCK_PLAYBOOK, BLOCK_ELITE_ACTIVATION, BLOCK_TOURNAMENT_ENGINE, BLOCK_FILM_COMPLIANCE, BLOCK_FEES_GOVERNANCE, BLOCK_HIGH_PRIORITY, BLOCK_SCOUTING_AI]
    },
    elite: {
      label: "Elite Org (Team/League)",
      desc: "Institutional infrastructure. Complete tactical suite for multi-team organizations.",
      highlights: ["Everything in Pro", "Master Club Hub", "Public Recruitment", "Form Architect", "Facility Management", "Equipment Vault"],
      sections: [BLOCK_DEPLOYMENT, BLOCK_SCHEDULING, BLOCK_COMMUNICATION, BLOCK_SCOREKEEPING, BLOCK_PLAYBOOK, BLOCK_ELITE_ACTIVATION, BLOCK_TOURNAMENT_ENGINE, BLOCK_FILM_COMPLIANCE, BLOCK_FEES_GOVERNANCE, BLOCK_HIGH_PRIORITY, BLOCK_SCOUTING_AI, BLOCK_CLUB_HUB, BLOCK_PUBLIC_RECRUITMENT, BLOCK_LOGISTICS_FLEET]
    },
    player: {
      label: "Individual Athlete",
      desc: "Stay coordinated and ready. Manage your personal recruitment portfolio and performance hub.",
      highlights: ["Join via Code", "Recruiting Portfolio", "Film Compliance", "Digital Vault", "RSVP Mandate", "Scoreboard"],
      sections: [BLOCK_PLAYER_HUB, BLOCK_COMMUNICATION, BLOCK_SCOREKEEPING, BLOCK_PLAYBOOK]
    },
    parent: {
      label: "Parent / Guardian",
      desc: "Unified household safety and fiscal command for multiple minor players.",
      highlights: ["Household Command", "Fiscal Audit", "Minor Registration", "Unified Calendar", "Volunteer Board", "Fundraising"],
      sections: [BLOCK_PARENT_HUB, BLOCK_SCHEDULING, BLOCK_COMMUNICATION, {
        title: "2. Community & Fundraising",
        icon: HandHelping,
        steps: [
          { step: "Volunteer Hub", detail: <>Claim assignments for concessions or hospitality. Track your verified hours for the season.</> },
          { step: "Fundraising Ops", detail: <>Participate in squad capital campaigns. Log contributions and track goal progress.</> }
        ]
      }]
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
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">Operational <span className="text-primary italic">Manual.</span></h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">Select your account perspective for exhaustive coordination guidance.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.keys(MANUAL_CONTENT) as AccountType[]).map((type) => {
                const data = MANUAL_CONTENT[type];
                const Icon = type === 'starter' ? Users2 : type === 'pro' ? Zap : type === 'elite' ? Building : type === 'player' ? User : Baby;
                
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
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{data.desc}</p>
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
                  {selectedType === 'starter' && <Users2 className="h-8 w-8" />}
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 ml-1">Tactical Capability Matrix</p>
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
                            <div className="text-base font-medium leading-relaxed text-muted-foreground">{s.detail}</div>
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
