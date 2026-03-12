
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
  Table as TableIcon,
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
  HandHelping
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

  const MANUAL_CONTENT: Record<AccountType, { label: string; desc: string; highlights: string[]; sections: ManualSection[] }> = {
    starter: {
      label: "Starter (Free)",
      desc: "Essential coordination for unlimited grassroots squads. Master the core coordination engine.",
      highlights: ["Unlimited Teams", "Tactical Chat", "Basic Scheduling", "Match Ledger", "Manual Itineraries"],
      sections: [
        {
          title: "1. Squad Deployment & Recruitment",
          icon: Plus,
          steps: [
            { step: "Launch Team", detail: "Navigate to the Dashboard and initiate the deployment process via the 'New Squad' button. Select the 'Starter Squad' tier to maintain a zero-cost operational hub indefinitely." },
            { step: "Establish Identity", detail: "Define your squad's name and sport. Once created, visit the 'Team Profile' to retrieve your unique 6-digit Squad Code." },
            { step: "Recruit the Roster", detail: "Share your Squad Code with players or parents. They use the 'Recruitment Hub' to join instantly, populating your roster without manual data entry." }
          ]
        },
        {
          title: "2. Strategic Operations",
          icon: CalendarDays,
          steps: [
            { step: "Scheduling Matches & Meetings", detail: "In the 'Schedule' hub, use 'New Activity' to log Match Days, Training, or Tactical Meetings. Specify location, start time, and a brief description for the roster." },
            { step: "Tactical Chat Coordination", detail: "Open the 'Chats' hub to establish secure messaging channels. Use the 'Establish Channel' button to create specific groups for defense, travel, or leadership." },
            { step: "Manual Scorekeeping", detail: "Visit 'Scorekeeping' after match day. Record the final us-vs-them results to maintain a clean Win/Loss record and visualize your season progress chart." }
          ]
        },
        {
          title: "3. Training & Library Management",
          icon: Dumbbell,
          steps: [
            { step: "The Playbook Hub", detail: "In 'Playbook', use 'Add Drill' to archive execution protocols. Include step-by-step instructions and attach external video links (YouTube/Vimeo) for squad study." },
            { step: "Resource Repository", detail: "Archive essential documents, field maps, or rulebooks in the 'Library'. This ensures every teammate has immediate access to critical administrative files." }
          ]
        },
        {
          title: "4. Manual Tournament Itineraries",
          icon: TableIcon,
          steps: [
            { step: "Itinerary Drafting", detail: "Add a 'Tournament' type event in the Schedule hub. This creates a multi-day window in the calendar for complex events." },
            { step: "Manual Match Entry", detail: "For Starter accounts, use the Tournament Hub to manually list matchups and locations. Note: Automated brackets and public spectator hubs require a Pro upgrade." }
          ]
        }
      ]
    },
    pro: {
      label: "Squad Pro",
      desc: "High-performance performance tools for elite squads. Unlock the full bracket and film verification suite.",
      highlights: ["Elite Bracket Engine", "75% Film Verification", "Broadcast Alerts", "Digital Signatures", "Advanced Analytics"],
      sections: [
        {
          title: "1. Activating Elite Capability",
          icon: Zap,
          steps: [
            { step: "Provision the Seat", detail: "Upgrade via the 'Pricing' hub. Once active, visit 'Team Profile' and use the 'Override Tier' or assignment trigger to attach your Pro seat to your primary squad." },
            { step: "Verify Pro Status", detail: "Confirm the 'ELITE PRO' badge appears in your squad switcher. All advanced modules (Film Study, Alerts, and the Bracket Engine) are now fully operational." }
          ]
        },
        {
          title: "2. The Elite Tournament Engine",
          icon: Trophy,
          steps: [
            { step: "Enroll Participating Squads", detail: "Create an Elite Tournament series. In the 'Deploy' tab, enter the names of all participating teams to initialize the itinerary engine." },
            { step: "Auto-Scheduler Execution", detail: "Define match duration and break intervals. Tap 'Deploy Complex Itinerary' to automatically pair matchups and distribute them across available fields." },
            { step: "Scorekeeper & Spectator Hubs", detail: "In the 'Portals' tab, copy the secure URLs. Share the Scorekeeper link with field marshals and the Spectator link with fans for real-time live standings." },
            { step: "Digital Waiver Enforcement", detail: "Use the 'Waiver Portal' to collect legal digital signatures from opposing coaches, verifying their roster compliance before the first whistle." }
          ]
        },
        {
          title: "3. Film Analysis & Verification",
          icon: Video,
          steps: [
            { step: "MP4 Media Archiving", detail: "In the 'Playbook', upload raw match film or training sessions directly. Pro accounts include 10GB of high-priority media storage." },
            { step: "The 75% Compliance Rule", detail: "The system automatically tracks watch progress. Teammates must watch 75% of the video to be marked as 'Verified Viewed' in your coach's compliance ledger." },
            { step: "Tactical Insight Layer", detail: "Add comments directly to the film study hub to highlight strategic errors or exceptional plays, sparking squad discussion." }
          ]
        },
        {
          title: "4. Professional Roster Governance",
          icon: Users2,
          steps: [
            { step: "Full Data Audit", detail: "Unlock advanced roster fields to track birthdates, medical clearance, emergency contacts, and private staff evaluations for every player." },
            { step: "Compliance Signature Tracking", detail: "In 'Coaches Corner', upload liability or media waivers. Teammates sign digitally, and you can audit the 'Compliance Ledger' to see who is cleared for play." },
            { step: "Institutional Fee Ledger", detail: "Post dues or uniform fees to individual profiles. Track 'Paid' status and aggregate 'Amount Owed' for the entire household automatically." }
          ]
        },
        {
          title: "5. High-Priority Command Hub",
          icon: Megaphone,
          steps: [
            { step: "Broadcast Priority Alerts", detail: "Use the Megaphone icon in the global header to send urgent, full-screen popups to the entire team for last-minute venue changes or safety notices." },
            { step: "Advanced Performance Trajectory", detail: "In the 'Scorekeeping' hub, visualize your season with advanced charts showing win trends, average PPG, and head-to-head history against league rivals." }
          ]
        }
      ]
    },
    elite: {
      label: "Elite Org (Team/League)",
      desc: "Institutional infrastructure for clubs and leagues. Manage a fleet of Pro squads and public recruitment.",
      highlights: ["Multi-Team Club Hub", "Form Architect", "Recruitment Portals", "Facility Scheduling", "Equipment Vault"],
      sections: [
        {
          title: "1. Club Hub Command",
          icon: Building,
          steps: [
            { step: "Fleet Management", detail: "As an Elite Manager, you maintain control over multiple squads. Create new teams from the 'Club Hub' and they are automatically enrolled in your organization." },
            { step: "Pro Seat Provisioning", detail: "Assign your 8 or 20 Pro seats to specific coaches. They gain full Elite features for their squad, while your master account retains administrative oversight." }
          ]
        },
        {
          title: "2. The Recruitment Portal Suite",
          icon: ClipboardList,
          steps: [
            { step: "Form Schema Architect", detail: "Navigate to 'Leagues > Registration'. Use the architect to build a custom signup form. Add fields for jersey sizes, document uploads (birth certificates), and medical waivers." },
            { step: "Deploy Public Hub", detail: "Copy your unique Public Portal URL. Distribute this to prospective players. They can apply to join without creating an app account first." },
            { step: "Ledger Review & Deployment", detail: "Review incoming applications in the 'Ledger'. Approve or decline recruits and assign them directly to one of your organization's squads with a single tap." }
          ]
        },
        {
          title: "3. Institutional League Infrastructure",
          icon: ShieldCheck,
          steps: [
            { step: "Establish Standings", detail: "Create a League to link multiple squads into an official leaderboard. Invite external verified teams or manually enter squads to populate the rankings." },
            { step: "Cross-Squad Coordination", detail: "Use the 'Coach Directory' to establish tactical chats with opposing managers, ensuring smooth coordination for league match days." },
            { step: "Strategic Season Reset", detail: "At the end of the year, use the 'Reset Season' tool to purge match results and rosters for a clean start while retaining organization records." }
          ]
        },
        {
          title: "4. Resource & Logistics Control",
          icon: MapPin,
          steps: [
            { step: "Facility Availability Management", detail: "In 'Facilities', register every venue and field in your organization. Track assigned slots to prevent scheduling conflicts across your entire fleet of teams." },
            { step: "Asset Inventory Vault", detail: "In 'Equipment', log all institutional assets (uniforms, kits, gear). Assign specific items to players and track the 'Return' status to prevent loss of capital." }
          ]
        }
      ]
    },
    player: {
      label: "Individual Athlete",
      desc: "The professional teammate's operational handbook. Stay coordinated, compliant, and ready for match day.",
      highlights: ["Join Requests", "RSVP Protocol", "Film Compliance", "Digital Signatures", "Personal Schedule"],
      sections: [
        {
          title: "1. Squad Enrollment",
          icon: UserPlus,
          steps: [
            { step: "Recruitment Hub Entry", detail: "Navigate to the 'Recruitment Hub' and enter the 6-digit Squad Code provided by your coach. Verify your assigned position and jersey number." },
            { step: "Tactical Data Sync", detail: "Once joined, your personal Dashboard and master Calendar will automatically populate with your squad's specific schedule and strategy." }
          ]
        },
        {
          title: "2. Strategic Availability Protocol",
          icon: Target,
          steps: [
            { step: "The RSVP Mandate", detail: "Check your 'Schedule' daily. Mark your status as 'Going', 'Maybe', or 'Decline'. This is critical for your coach to finalize play-time and tactical formations." },
            { step: "Unified Season Calendar", detail: "Use the 'Calendar' tab to see an aggregated itinerary of every game and practice across all squads you belong to, sorted chronologically." }
          ]
        },
        {
          title: "3. Performance & Study Compliance",
          icon: Activity,
          steps: [
            { step: "Film Study Requirements", detail: "Visit the 'Playbook' to watch assigned game tape. Remember: You must finish at least 75% of the video to be marked as compliant in the coach's ledger." },
            { step: "Execution Protocol Review", detail: "Study drill diagrams and instructions before training to ensure the squad is game-ready and coordinated for practice." }
          ]
        },
        {
          title: "4. Documentation & Social",
          icon: FolderClosed,
          steps: [
            { step: "Vault Execution", detail: "Check the 'Library' for pending signatures. Execute all liability waivers digitally to ensure you are cleared for tournament play." },
            { step: "Secure Feed Participation", detail: "Post updates, match photos, and vote in squad polls to build team consensus on tactical or logistical choices." }
          ]
        }
      ]
    },
    parent: {
      label: "Parent / Guardian",
      desc: "Unified household coordination and safety for minor players. Manage multiple athletes from one hub.",
      highlights: ["Household Dashboard", "Athlete Roster", "Child Login Provision", "Volunteer Hub", "Consolidated Dues"],
      sections: [
        {
          title: "1. Household Command Hub",
          icon: Baby,
          steps: [
            { step: "Athlete Registration", detail: "In the 'Family Hub', register your children. They are linked to your guardian account automatically for unified scheduling and billing." },
            { step: "Login Provisioning", detail: "For older children, tap 'Enable Login'. This allows them to have their own app access for RSVPs and film study while you maintain master oversight." }
          ]
        },
        {
          title: "2. Unified Multi-Athlete Scheduling",
          icon: CalendarDays,
          steps: [
            { step: "Master Family Itinerary", detail: "The 'Calendar' hub merges the practices and games of every child in your household into one clear view. No more checking multiple apps or chats." },
            { step: "Guardian RSVP Protocol", detail: "Handle attendance confirmations for minor players. Ensure RSVPs are set at least 24 hours before match start to help coaches coordinate transport." }
          ]
        },
        {
          title: "3. Community & Engagement",
          icon: HandHelping,
          steps: [
            { step: "Volunteer Assignment Claims", detail: "Visit the 'Volunteer Hub' to claim shifts for concessions, transport, or hospitality. Once the task is complete, the coach will verify your hours in your profile." },
            { step: "Capital Campaign Participation", detail: "Participate in squad fundraising. Join active campaigns, log your contributions, and track the team's goal progress in real-time." }
          ]
        },
        {
          title: "4. Fiscal & Compliance Audit",
          icon: DollarSign,
          steps: [
            { step: "Consolidated Balance Audit", detail: "Check your Dashboard for the 'Household Balance'. This aggregates all tournament fees, uniform costs, and dues across all your children." },
            { step: "Digital Signature Execution", detail: "In the 'Library', sign legal waivers on behalf of your children. Verified signatures are required by the system before a player can be rostered for Elite Tournaments." }
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
              <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px] px-4 h-7">Master Manual</Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">The Tactical <span className="text-primary italic">Manual.</span></h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">Select your account perspective for granular, step-by-step operational guidance.</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.keys(MANUAL_CONTENT) as AccountType[]).map((type) => {
                const data = MANUAL_CONTENT[type];
                const Icon = type === 'starter' ? Plus : type === 'pro' ? Zap : type === 'elite' ? Building : type === 'player' ? User : Baby;
                
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
                    <CardContent className="p-8 space-y-4 text-foreground">
                      <div className="bg-muted p-4 rounded-2xl w-fit group-hover:bg-primary group-hover:text-white transition-all">
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{data.label}</h3>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">{data.desc}</p>
                      </div>
                      <div className="pt-4 flex items-center text-primary font-black text-[10px] uppercase tracking-widest gap-2">
                        Open Hub Manual <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
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
                  {selectedType === 'starter' && <Plus className="h-8 w-8" />}
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 ml-1">Key Capability Matrix</p>
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

            <div className="bg-black text-white p-10 rounded-[3rem] text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Still have operational questions?</h3>
                <p className="text-white/60 font-medium max-w-md mx-auto mb-8">Our tactical support team is standing by to help you dominate your season coordination and institutional scale.</p>
                <Button variant="secondary" className="rounded-full px-10 h-14 font-black uppercase tracking-widest bg-white text-black hover:bg-white/90" onClick={() => window.location.href = 'mailto:team@thesquad.pro'}>
                  Contact Operations
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 bg-muted/50 border-t mt-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link href={user ? "/dashboard" : "/"}>
              <BrandLogo variant="light-background" className="h-8 w-32" />
            </Link>
            
            <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/how-to" className="text-primary transition-colors">How to Guide</Link>
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
