
"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Plus, ChevronRight, Info } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTeam } from '@/components/providers/team-provider';

const MOCK_EVENTS = [
  {
    id: '1',
    teamId: '1',
    title: 'Morning Practice',
    date: new Date(),
    startTime: '07:00 AM',
    endTime: '09:00 AM',
    location: 'Pitch 4, Central Park',
    description: 'Drills and tactical session. Please bring both kits.',
    rsvps: { going: 12, notGoing: 2, maybe: 4 }
  },
  {
    id: '2',
    teamId: '1',
    title: 'Away Game vs. Titans',
    date: new Date(Date.now() + 86400000 * 2),
    startTime: '02:00 PM',
    location: 'Stadium East',
    description: 'Season semi-finals. Meeting at the clubhouse at 12:30 PM.',
    rsvps: { going: 18, notGoing: 1, maybe: 0 }
  },
  {
    id: '3',
    teamId: '2',
    title: 'Basketball Drills',
    date: new Date(),
    startTime: '05:00 PM',
    location: 'Indoor Court A',
    description: 'Focusing on three-pointers and defense.',
    rsvps: { going: 8, notGoing: 0, maybe: 2 }
  }
];

export default function EventsPage() {
  const { activeTeam } = useTeam();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const teamEvents = MOCK_EVENTS.filter(e => e.teamId === activeTeam.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input id="title" placeholder="e.g. Practice, Game Day" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Where is it?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Optional details..." />
              </div>
              <Button className="w-full">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4 mt-4">
          {teamEvents.length > 0 ? teamEvents.map((event) => (
            <Dialog key={event.id} onOpenChange={(open) => !open && setSelectedEvent(null)}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer group" onClick={() => setSelectedEvent(event)}>
                  <div className="flex items-stretch">
                    <div className="bg-primary/5 w-16 flex flex-col items-center justify-center border-r shrink-0">
                      <span className="text-xs font-bold uppercase text-primary">
                        {event.date.toLocaleString('default', { month: 'short' })}
                      </span>
                      <span className="text-2xl font-black text-primary">
                        {event.date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 p-4 space-y-2 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors truncate">{event.title}</h3>
                        <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {event.startTime}
                        </div>
                        {event.location && (
                          <div className="flex items-center truncate">
                            <MapPin className="h-3.5 w-3.5 mr-1.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                          {event.rsvps.going} Going
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{event.title}</DialogTitle>
                  <DialogDescription>
                    {event.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Time</p>
                      <p className="text-sm text-muted-foreground">{event.startTime} - {event.endTime || 'Finish'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-green-50 rounded-xl">
                      <p className="text-xl font-black text-green-600">{event.rsvps.going}</p>
                      <p className="text-[10px] font-bold text-green-700 uppercase">Going</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-xl">
                      <p className="text-xl font-black text-muted-foreground">{event.rsvps.maybe}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Maybe</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-xl">
                      <p className="text-xl font-black text-red-600">{event.rsvps.notGoing}</p>
                      <p className="text-[10px] font-bold text-red-700 uppercase">No</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex gap-2">
                  <Button variant="outline" className="flex-1">Can't Go</Button>
                  <Button className="flex-1">Going</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )) : (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl">
              <p className="text-muted-foreground italic">No events scheduled for {activeTeam.name}.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto w-full"
              />
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground px-1">Selected Date Details</h4>
                {teamEvents.filter(e => e.date.toDateString() === date?.toDateString()).length > 0 ? (
                  teamEvents.filter(e => e.date.toDateString() === date?.toDateString()).map(event => (
                    <div key={event.id} className="flex gap-4 items-center p-3 rounded-lg border bg-accent/30">
                      <div className="bg-primary text-white p-2 rounded-md h-fit">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.startTime} @ {event.location}</p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center py-8 text-muted-foreground italic">No team events for this day.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
