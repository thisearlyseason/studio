'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clock, User, TrendingUp, Lightbulb, Target,
  Trophy, Calendar, Zap, ChevronRight, Star,
  Dumbbell, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HeroBanner } from '@/components/sports-hub/HeroBanner';
import { CategoryPills } from '@/components/sports-hub/CategoryPills';
import { NewsletterSignup } from '@/components/sports-hub/NewsletterSignup';
import { cn } from '@/lib/utils';
import { SPORTS_HUB_CATEGORIES } from '@/lib/sports-hub-types';

// ─── Sample Content ────────────────────────────────────────────────────────
const FEATURED_ARTICLE = {
  id: '1',
  title: 'Building a Championship Culture: Leadership Strategies That Actually Work',
  excerpt: 'The difference between good teams and great teams rarely comes down to talent. Discover the proven leadership frameworks that elite coaches use to build cultures of excellence.',
  category: 'Coaching',
  author: { name: 'The Squad Team' },
  readingTime: 8,
  publishedAt: '2026-07-09',
  slug: 'building-championship-culture',
  featuredImage: null,
};

const LATEST_ARTICLES = [
  {
    id: '2', title: 'The 5-Day Practice Plan Formula That Prepares Any Team for Game Day',
    excerpt: 'Stop winging it. Build a structured weekly practice plan that covers physical prep, tactical work, and mental readiness.',
    category: 'Coaching', author: { name: 'Coach Riley' }, readingTime: 6,
    publishedAt: '2026-07-08', slug: 'five-day-practice-plan',
  },
  {
    id: '3', title: 'Tournament Scheduling: How to Run a 32-Team Bracket Without Chaos',
    excerpt: 'From venue logistics to referee scheduling, this is the definitive guide to running a smooth tournament at any level.',
    category: 'Tournament Management', author: { name: 'The Squad Team' }, readingTime: 9,
    publishedAt: '2026-07-07', slug: 'tournament-scheduling-guide',
  },
  {
    id: '4', title: 'Parent Communication Templates That Save Coaches Hours Every Week',
    excerpt: 'Pre-written emails and messages for every situation — injury updates, schedule changes, game-day logistics, and more.',
    category: 'Team Management', author: { name: 'Coach Sarah M.' }, readingTime: 5,
    publishedAt: '2026-07-06', slug: 'parent-communication-templates',
  },
];

const PRODUCT_UPDATES = [
  {
    id: 'pu1', version: 'v2.8', title: 'Live Scorekeeping Gets Real-Time Push Notifications',
    description: 'Score updates now broadcast instantly to all team members and parents via push notification.',
    date: '2026-07-08', type: 'Feature',
  },
  {
    id: 'pu2', version: 'v2.7', title: 'Tournament Bracket Generator Now Supports Swiss Format',
    description: 'Generate Swiss-system brackets for leagues and multi-day tournaments with automatic round pairing.',
    date: '2026-06-28', type: 'Feature',
  },
];

const COACH_TIP = {
  tip: "Start every practice with a 5-minute 'energy check.' Ask one athlete to rate the team's energy level from 1-10, then challenge the team to bring it to a 9 by warm-up's end. This micro-ritual builds accountability and sets the tone for focused work.",
  category: 'Practice Planning',
};

const FEATURED_DRILL = {
  id: 'dr1', title: 'The 4-Corner Passing Drill', sport: 'Soccer',
  description: 'Improve first touch, communication, and movement off the ball with this high-intensity passing circuit. Works for all age groups.',
  difficulty: 'intermediate', duration: '15 minutes',
  slug: 'four-corner-passing-drill',
};

const UPCOMING_EVENTS = [
  { id: 'ev1', title: 'Summer Championship Bracket Open', date: '2026-07-15', type: 'Tournament', sport: 'Multi-Sport' },
  { id: 'ev2', title: 'Youth Coaching Certification Webinar', date: '2026-07-18', type: 'Webinar', sport: 'General' },
  { id: 'ev3', title: 'National League Registration Deadline', date: '2026-07-22', type: 'Deadline', sport: 'Basketball' },
];



const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number,number,number,number] } },
};

function SectionHeader({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">{children}</h2>
      {action}
    </div>
  );
}

export default function SportsHubHomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16">

      {/* ── Hero ── */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <HeroBanner />
      </motion.div>

      {/* ── Featured Article ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} aria-labelledby="featured-heading">
        <SectionHeader
          action={
            <Link href="/sports-hub/news">
              <Button variant="ghost" size="sm" className="font-black text-xs uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary">
                All Articles <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <span id="featured-heading">Featured Article</span>
        </SectionHeader>
        <Link href={`/sports-hub/articles/${FEATURED_ARTICLE.slug}`} className="group block">
          <div className="relative overflow-hidden rounded-3xl hero-gradient p-8 md:p-12 depth-card transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute inset-0 grid-beam opacity-20 pointer-events-none" aria-hidden />
            <div className="relative z-10 max-w-3xl">
              <Badge className="bg-white/20 text-white border-white/30 font-black text-[9px] uppercase tracking-widest mb-4">
                {FEATURED_ARTICLE.category}
              </Badge>
              <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-white leading-tight mb-4 group-hover:opacity-90 transition-opacity">
                {FEATURED_ARTICLE.title}
              </h2>
              <p className="text-white/70 font-medium text-sm md:text-base mb-6 leading-relaxed max-w-2xl">
                {FEATURED_ARTICLE.excerpt}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                  <User className="h-3.5 w-3.5" />{FEATURED_ARTICLE.author.name}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                  <Clock className="h-3.5 w-3.5" />{FEATURED_ARTICLE.readingTime} min read
                </div>
                <Button className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs gap-2 ml-auto hidden sm:flex">
                  Read Article <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </motion.section>

      {/* ── Latest Squad Articles ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} aria-labelledby="latest-heading">
        <SectionHeader
          action={
            <Link href="/sports-hub/news">
              <Button variant="ghost" size="sm" className="font-black text-xs uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary">
                View All <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        >
          <span id="latest-heading">Latest from The Squad</span>
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LATEST_ARTICLES.map((article, i) => (
            <motion.div key={article.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.08 }}>
              <Link href={`/sports-hub/articles/${article.slug}`} className="group block h-full">
                <div className="h-full bg-card border rounded-2xl overflow-hidden depth-card transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                  <div className="h-1.5 hero-gradient" />
                  <div className="p-6">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-primary border-primary/20 bg-primary/5 mb-3">
                      {article.category}
                    </Badge>
                    <h3 className="font-black tracking-tight text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium leading-relaxed">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author.name}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTime}m</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Product Updates ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} aria-labelledby="updates-heading">
        <SectionHeader>
          <span id="updates-heading">Product Updates</span>
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRODUCT_UPDATES.map((update) => (
            <div key={update.id} className="bg-card border rounded-2xl p-6 depth-card hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  <Zap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-primary uppercase tracking-widest">{update.version}</span>
                    <Badge className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary border-0">{update.type}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{new Date(update.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <h3 className="font-black tracking-tight text-sm mb-1.5">{update.title}</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">{update.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Coach Tip of the Day ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} aria-labelledby="tip-heading">
        <div className="bg-card border-2 border-primary/10 rounded-3xl p-8 md:p-10 relative overflow-hidden glow-red">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden />
          <div className="flex items-start gap-5">
            <div className="h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center shrink-0 shadow-xl shadow-primary/20">
              <Lightbulb className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-1" id="tip-heading">Coach Tip of the Day</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{COACH_TIP.category}</p>
              <blockquote className="text-base md:text-lg font-black tracking-tight leading-snug text-foreground">
                &ldquo;{COACH_TIP.tip}&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Featured Drill + Tournament (2-col) ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Drill */}
          <div>
            <SectionHeader action={<Link href="/sports-hub/playbook"><Button variant="ghost" size="sm" className="font-black text-xs uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary">Playbook <ChevronRight className="h-3.5 w-3.5" /></Button></Link>}>
              Featured Drill
            </SectionHeader>
            <Link href={`/sports-hub/playbook`} className="group block">
              <div className="bg-card border rounded-2xl overflow-hidden depth-card transition-all hover:shadow-xl hover:-translate-y-0.5">
                <div className="hero-gradient p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Dumbbell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">{FEATURED_DRILL.sport} · {FEATURED_DRILL.duration}</p>
                    <h3 className="font-black tracking-tight text-lg text-white">{FEATURED_DRILL.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-amber-600 border-amber-200 bg-amber-50 mb-3">{FEATURED_DRILL.difficulty}</Badge>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed mb-4">{FEATURED_DRILL.description}</p>
                  <Button variant="outline" size="sm" className="font-black text-xs uppercase tracking-widest gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    View Drill <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>

          {/* Upcoming Events */}
          <div>
            <SectionHeader>
              Upcoming Events
            </SectionHeader>
            <div className="space-y-3">
              {UPCOMING_EVENTS.map((event, i) => (
                <div key={event.id} className="bg-card border rounded-2xl p-4 flex items-center gap-4 depth-card hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black tracking-tight text-sm truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-muted-foreground">·</span>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-4 px-1.5">{event.type}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>



      {/* ── Popular Categories ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} aria-labelledby="categories-heading">
        <SectionHeader>
          <span id="categories-heading">Popular Categories</span>
        </SectionHeader>
        <CategoryPills categories={Array.from(SPORTS_HUB_CATEGORIES)} />
      </motion.section>

      {/* ── Newsletter ── */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <NewsletterSignup />
      </motion.section>

    </div>
  );
}
