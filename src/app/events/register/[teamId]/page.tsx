
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useTeam } from '@/components/providers/team-provider';
import { CheckCircle2, AlertCircle, Clock, MapPin, Loader2 } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

function RegistrationForm() {
  const { teamId } = useParams();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const db = useFirestore();
  const { addRegistration } = useTeam();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!teamId || !eventId) return;
      try {
        const eventSnap = await getDoc(doc(db, 'teams', teamId as string, 'events', eventId));
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          setEvent(data);
          
          if (data.maxRegistrations) {
            const regsSnap = await getDocs(collection(db, 'teams', teamId as string, 'events', eventId, 'registrations'));
            if (regsSnap.size >= data.maxRegistrations) {
              setIsFull(true);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [db, teamId, eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || isSubmitting) return;
    
    setIsSubmitting(true);
    const success = await addRegistration(teamId as string, eventId as string, formData);
    if (success) {
      setSubmitted(true);
    } else {
      alert("Failed to register. The event might be full.");
    }
    setIsSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-md w-full text-center p-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground mt-2">The link you followed may be broken or the event has been deleted.</p>
      </Card>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-md w-full text-center p-8 rounded-[2rem] shadow-2xl">
        <div className="bg-green-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Registration Sent!</h2>
        <p className="text-muted-foreground mt-4 font-medium">
          Thanks for signing up for <strong>{event.title}</strong>. The organizer has been notified.
        </p>
        <Button className="mt-8 w-full rounded-xl h-12" onClick={() => window.close()}>Close Window</Button>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-6">
      <BrandLogo variant="light-background" className="h-10 w-40 mb-8" />
      
      <Card className="max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden border-none bg-white">
        <div className="h-2 hero-gradient w-full" />
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-3xl font-black tracking-tighter">{event.title}</CardTitle>
          <CardDescription className="text-base font-medium">Event Registration</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3 bg-muted/30 p-4 rounded-2xl">
            <div className="flex items-center gap-3 text-sm font-bold">
              <Clock className="h-4 w-4 text-primary" />
              <span>{new Date(event.date).toLocaleDateString()} @ {event.startTime}</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>

          {isFull ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-2xl text-center border border-red-100">
              <p className="font-bold text-lg">Event at Capacity</p>
              <p className="text-sm">Sorry, registrations for this event are currently closed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="(555) 000-0000" 
                  required 
                  value={formData.phone}
                  onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="rounded-xl h-12"
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm Registration"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="bg-muted/10 p-6 text-center border-t">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Powered by The Squad</p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PublicRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <RegistrationForm />
    </Suspense>
  );
}
