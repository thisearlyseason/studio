
/**
 * @fileOverview Utilities for generating calendar export links and ICS files.
 */

import { format, addHours } from 'date-fns';

export interface CalendarEvent {
  title: string;
  start: Date;
  end?: Date;
  location?: string;
  description?: string;
}

/**
 * Generates a Google Calendar link for a specific event.
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const startStr = format(event.start, "yyyyMMdd'T'HHmmss'Z'");
  const end = event.end || addHours(event.start, 1);
  const endStr = format(end, "yyyyMMdd'T'HHmmss'Z'");
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startStr}/${endStr}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads an ICS file for one or more events.
 */
export function downloadICS(events: CalendarEvent[], fileName: string = 'squad_schedule.ics') {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Squad//Tactical Coordination Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    const startStr = format(event.start, "yyyyMMdd'T'HHmmss'Z'");
    const end = event.end || addHours(event.start, 1);
    const endStr = format(end, "yyyyMMdd'T'HHmmss'Z'");
    
    icsContent.push(
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).substring(7)}@thesquad.io`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location || ''}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');

  const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
