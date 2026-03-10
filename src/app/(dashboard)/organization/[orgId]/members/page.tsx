
"use client";

import React, { useState, useMemo } from 'react';
import { useTeam, Member } from '@/components/providers/team-provider';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Users, Mail, Phone, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useParams } from 'next/navigation';

export default function OrganizationMembersPage() {
  const { orgId } = useParams();
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const membersQuery = useMemoFirebase(() => {
    if (!orgId || !db) return null;
    return query(collectionGroup(db, 'members'), where('clubId', '==', orgId), orderBy('name', 'asc'));
  }, [orgId, db]);

  const { data: members, isLoading } = useCollection<Member>(membersQuery);

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    const unique = new Map();
    members.forEach(m => {
      const key = m.userId || m.id;
      if (!unique.has(key)) {
        unique.set(key, m);
      }
    });
    const list = Array.from(unique.values());
    return list.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [members, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search organization directory..." 
            className="pl-11 h-12 rounded-2xl bg-muted/50 border-none font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="h-10 px-6 rounded-full font-black uppercase text-[10px] border-primary/20 text-primary">
          {filteredMembers.length} Active Personnel
        </Badge>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b">
              <tr>
                <th className="px-8 py-5">Personnel</th>
                <th className="px-4 py-5">Primary Position</th>
                <th className="px-4 py-5">Verified Contact</th>
                <th className="px-8 py-5 text-right">Ledger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-2xl border-2 border-background shadow-md">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="font-black bg-muted text-xs">{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-black text-sm uppercase truncate tracking-tight">{member.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">ID: {member.id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase h-5 px-2">
                      {member.position}
                    </Badge>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted p-2 rounded-lg text-muted-foreground/40 group-hover:text-primary transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <div className="bg-muted p-2 rounded-lg text-muted-foreground/40 group-hover:text-primary transition-colors">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5 text-green-600">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase">Verified</span>
                      </div>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Joined {member.joinedAt ? format(new Date(member.joinedAt), 'MMM yyyy') : 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-30">
                    <p className="text-xs font-black uppercase tracking-widest">No personnel found in directory</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
