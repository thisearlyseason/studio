'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoryPills } from '@/components/sports-hub/CategoryPills';

const TM_CATEGORIES = ['All', 'Roster Management', 'Communication', 'Parent Relations', 'Volunteer Management', 'Equipment', 'Finance', 'Scheduling'];

const TM_ARTICLES = [
  { id: '1', title: 'Parent Communication Templates That Save Coaches Hours Every Week', excerpt: 'Pre-written emails and messages for every situation — injury updates, schedule changes, game-day logistics, and more.', category: 'Communication', author: 'Coach Sarah M.', readingTime: 5, slug: 'parent-communication-templates' },
  { id: '2', title: "How to Build a Volunteer Program That Actually Works", excerpt: "Volunteers are the backbone of amateur sports. Here's how to recruit, organize, and retain a reliable volunteer team.", category: 'Volunteer Management', author: 'Coach Marcus', readingTime: 8, slug: 'volunteer-program-guide' },
  { id: '3', title: 'Roster Management Best Practices for Growing Programs', excerpt: 'From tryouts to player transfers, managing a roster is more complex than it looks. These systems keep everything organized.', category: 'Roster Management', author: 'The Squad Team', readingTime: 7, slug: 'roster-management-best-practices' },
  { id: '4', title: 'Equipment Tracking and Inventory Management for Coaches', excerpt: 'Lost jerseys, missing gear, and broken equipment add up. This tracking system prevents chaos and saves money.', category: 'Equipment', author: 'Coach Riley', readingTime: 6, slug: 'equipment-tracking-inventory' },
  { id: '5', title: 'Team Fundraising Strategies That Actually Raise Money', excerpt: 'Beyond bake sales — modern fundraising strategies that work for youth and amateur sports programs of all sizes.', category: 'Finance', author: 'The Squad Team', readingTime: 9, slug: 'team-fundraising-strategies' },
  { id: '6', title: 'Building a Season Schedule That Works for Everyone', excerpt: 'Balancing games, practices, holidays, and facilities is a puzzle. Here\'s how to solve it systematically.', category: 'Scheduling', author: 'Coach Sarah M.', readingTime: 7, slug: 'building-season-schedule' },
  { id: '7', title: 'Setting Team Expectations: The First Meeting Playbook', excerpt: 'What you communicate in your first team meeting sets the tone for the entire season. Here\'s what elite coaches do.', category: 'Communication', author: 'The Squad Team', readingTime: 6, slug: 'first-team-meeting-playbook' },
  { id: '8', title: "A Coach's Guide to Handling Difficult Sports Parents", excerpt: 'Difficult parents are a near-universal coaching experience. The coaches who handle them best aren\'t the ones who avoid conflict — they\'re the ones who have a system.', category: 'Parent Relations', author: 'Dr. Amanda Lee', readingTime: 8, slug: 'managing-difficult-parents' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function TeamManagementPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? TM_ARTICLES : TM_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl hero-gradient flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Sports Hub</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Team Management</h1>
          </div>
        </div>
        <p className="text-muted-foreground font-medium text-sm max-w-2xl">
          Rosters, communication, volunteers, equipment, finance, and scheduling — the operational side of running a great sports program.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <CategoryPills categories={TM_CATEGORIES} activeCategory={activeCategory} onSelect={setActiveCategory} />
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
