'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Trophy, Calendar, Users, Award, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CategoryPills } from '@/components/sports-hub/CategoryPills';
import { cn } from '@/lib/utils';

const TOURNAMENT_CATEGORIES = ['All', 'Bracket Management', 'Scheduling', 'Officials', 'Registration', 'Scoring', 'Awards', 'Venue Planning', 'Tournament Tips'];

const TOURNAMENT_ARTICLES = [
  { id: '1', title: 'Tournament Scheduling: How to Run a 32-Team Bracket Without Chaos', excerpt: 'From venue logistics to referee scheduling, this is the definitive guide to running a smooth, professional tournament at any level.', category: 'Tournament Tips', author: 'The Squad Team', readingTime: 15, slug: 'tournament-scheduling-guide' },
  { id: '2', title: "Tournament Formats Explained: Which Bracket Is Right for Your Event?", excerpt: "Single elimination, double elimination, round robin, Swiss system, pool play — each format has different strengths. Here's how to choose the right one.", category: 'Bracket Management', author: 'Coach Riley', readingTime: 7, slug: 'tournament-bracket-formats' },
  { id: '3', title: 'How to Work With Referees and Manage Disputes Professionally', excerpt: 'The way your organization treats officials says everything about your culture. Here\'s how to build a reputation that attracts better officials and creates better games.', category: 'Scheduling', author: 'The Squad Team', readingTime: 9, slug: 'referee-management' },
  { id: '4', title: "Managing Tournament Officials: A Director's Guide", excerpt: 'Recruiting, briefing, managing, and evaluating officials is an art form. Master it and your tournament runs smoother.', category: 'Officials', author: 'Coach Sarah M.', readingTime: 8, slug: 'managing-tournament-officials' },
  { id: '5', title: 'Online Tournament Registration That Athletes Actually Complete', excerpt: 'Your registration process is often the first impression. Make it fast, simple, and painless with these best practices.', category: 'Registration', author: 'Coach Marcus', readingTime: 6, slug: 'online-tournament-registration' },
  { id: '6', title: 'Real-Time Scoring: Keeping Everyone Informed During a Tournament', excerpt: "Live scoring keeps coaches, parents, and athletes engaged. Here's how to set it up without adding burden to your staff.", category: 'Scoring', author: 'The Squad Team', readingTime: 5, slug: 'real-time-tournament-scoring' },
  { id: '7', title: 'Venue Planning Checklist for Tournament Directors', excerpt: 'Fields, facilities, parking, first aid, and concessions — every operational detail your venue plan needs to cover.', category: 'Venue Planning', author: 'Coach Riley', readingTime: 8, slug: 'venue-planning-checklist' },
  { id: '8', title: 'Awards Ceremonies That Athletes Actually Remember', excerpt: "A great awards ceremony caps off a great tournament. Here's how to make it memorable without breaking the budget.", category: 'Awards', author: 'The Squad Team', readingTime: 5, slug: 'tournament-awards-ceremony' },
];

const QUICK_ACTIONS = [
  { icon: Trophy, label: 'Create Bracket', href: '/competition', gradient: true },
  { icon: Calendar, label: 'Schedule Games', href: '/events', gradient: false },
  { icon: Users, label: 'Manage Teams', href: '/roster', gradient: false },
  { icon: Award, label: 'Track Scores', href: '/games', gradient: false },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function TournamentsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? TOURNAMENT_ARTICLES : TOURNAMENT_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl hero-gradient flex items-center justify-center">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Sports Hub</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Tournaments</h1>
          </div>
        </div>
        <p className="text-muted-foreground font-medium text-sm max-w-2xl">
          Bracket management, scheduling, officials, scoring — everything you need to run professional-grade tournaments.
        </p>
      </motion.div>

      {/* Quick Action Cards — links back into The Squad app */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {QUICK_ACTIONS.map(({ icon: Icon, label, href, gradient }) => (
          <Link key={label} href={href}>
            <div className={cn(
              'rounded-2xl p-5 depth-card hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer',
              gradient ? 'hero-gradient text-white' : 'bg-card border text-foreground'
            )}>
              <Icon className="h-6 w-6 mb-2" />
              <p className="font-black text-xs uppercase tracking-widest">{label}</p>
              <p className="text-[9px] uppercase tracking-wider opacity-60 font-bold mt-0.5">In The Squad →</p>
            </div>
          </Link>
        ))}
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <CategoryPills categories={TOURNAMENT_CATEGORIES} activeCategory={activeCategory} onSelect={setActiveCategory} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((article, i) => (
          <motion.div key={article.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
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
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 font-medium">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <span>{article.author}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readingTime}m</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
