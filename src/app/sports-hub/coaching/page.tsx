'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GraduationCap, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CategoryPills } from '@/components/sports-hub/CategoryPills';
import { COACHING_CATEGORIES } from '@/lib/sports-hub-types';

const COACHING_ARTICLES = [
  { id: '1', title: 'Building Championship Culture: Leadership Strategies That Actually Work', excerpt: 'Discover the proven leadership frameworks that elite coaches use to build cultures of excellence, accountability, and sustained performance.', category: 'Leadership', author: 'The Squad Team', readingTime: 8, slug: 'building-championship-culture' },
  { id: '2', title: 'The 5-Day Practice Plan Formula for Game Day Readiness', excerpt: 'Stop winging it. Build a structured weekly practice plan covering physical prep, tactical work, and mental readiness.', category: 'Practice Planning', author: 'Coach Riley', readingTime: 6, slug: 'five-day-practice-plan' },
  { id: '3', title: 'How to Motivate Athletes When the Season Gets Hard', excerpt: 'Proven psychological frameworks to keep your team engaged, motivated, and pulling in the same direction through adversity.', category: 'Motivation', author: 'Dr. Amanda Lee', readingTime: 7, slug: 'motivate-athletes-hard-season' },
  { id: '4', title: 'Communication That Builds Trust With Every Athlete', excerpt: 'Master the communication patterns that top coaches use to build deep trust, resolve conflict, and inspire peak performance.', category: 'Communication', author: 'Coach Sarah M.', readingTime: 9, slug: 'communication-builds-trust' },
  { id: '5', title: 'Youth Coaching Philosophy: Developing the Whole Athlete', excerpt: "Youth coaches have a rare opportunity to shape character, resilience, and lifelong habits. Here's how to seize it.", category: 'Youth Coaching', author: 'Coach Marcus', readingTime: 10, slug: 'youth-coaching-philosophy' },
  { id: '6', title: 'Game Strategy: Building a System Your Athletes Can Execute', excerpt: 'Great strategies only work if athletes can execute them under pressure. Learn how to build systems that stick.', category: 'Game Strategy', author: 'The Squad Team', readingTime: 8, slug: 'game-strategy-systems' },
  { id: '7', title: 'Recovery Protocols That Actually Speed Up Performance', excerpt: 'Cold water immersion, foam rolling, sleep optimization — the evidence-based recovery strategies your athletes need.', category: 'Recovery', author: 'Dr. Amanda Lee', readingTime: 6, slug: 'recovery-protocols-performance' },
  { id: '8', title: 'Mental Performance: Training the Mind Like the Body', excerpt: 'Visualization, mindfulness, and pressure inoculation — the mental skills curriculum used by elite programs worldwide.', category: 'Mental Performance', author: 'Coach Riley', readingTime: 11, slug: 'mental-performance-training' },
  { id: '9', title: 'Conditioning Cycles: Periodization for Amateur Programs', excerpt: "You don't need a full-time strength coach. Here's how to implement smart periodization within your existing schedule.", category: 'Conditioning', author: 'Coach Marcus', readingTime: 9, slug: 'conditioning-periodization' },
];

const ALL_CATEGORIES = ['All', ...Array.from(COACHING_CATEGORIES)];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function CoachingPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filtered = activeCategory === 'All' ? COACHING_ARTICLES : COACHING_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-2xl hero-gradient flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Sports Hub</p>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Coaching</h1>
          </div>
        </div>
        <p className="text-muted-foreground font-medium text-sm max-w-2xl">
          Leadership, motivation, practice planning, player development — everything you need to be a better coach.
        </p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <CategoryPills categories={ALL_CATEGORIES} activeCategory={activeCategory} onSelect={setActiveCategory} />
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
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.author}</span>
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
