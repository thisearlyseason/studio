'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const items = [
  { id: 'links', name: 'All-in-One Link Hub', description: 'A complete Linktree-style page with account, dashboard, Sports Hub, and newsletter links.', height: 1050, directPath: '/embed/links' },
  { id: 'newsletter', name: 'Newsletter Signup Form', description: 'An interactive subscriber form connected to your newsletter and automatic welcome email.', height: 560, directPath: '/#newsletter' },
  { id: 'signup', name: 'Account Signup Card', description: 'A compact call-to-action that sends visitors to account signup.', height: 210, directPath: '/signup' },
  { id: 'sports-hub', name: 'Sports Hub Card', description: 'A compact link to coaching resources, news, templates, and playbooks.', height: 210, directPath: '/sports-hub' },
  { id: 'squad-hub', name: 'Squad Hub Card', description: 'A compact link that takes members to their dashboard or login flow.', height: 210, directPath: '/dashboard' },
] as const;

export function EmbedHubManager() {
  const [origin, setOrigin] = useState('https://www.thesquad.pro');
  const [copied, setCopied] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  const copy = async (id: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(''), 1600);
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-4xl font-black uppercase tracking-tighter">Embed Hub</h1><p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">Copy responsive cards or direct links for any external website</p></div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-6">
        Use the iframe code in an HTML/embed block on another host. Use the direct URL for Linktree buttons, social bios, QR codes, or ordinary links. The iframe width automatically fits its container.
      </div>
      <div className="grid gap-5">
        {items.map(item => {
          const embedUrl = `${origin}/embed/${item.id}`;
          const directUrl = `${origin}${item.directPath}`;
          const code = `<iframe src="${embedUrl}" title="The Squad — ${item.name}" width="100%" height="${item.height}" style="border:0;max-width:680px;width:100%;" loading="lazy"></iframe>`;
          return (
            <section key={item.id} className="rounded-2xl border bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-xl font-black uppercase tracking-tight">{item.name}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{item.description}</p></div><a href={embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-black uppercase tracking-wider text-primary">Preview <ExternalLink className="ml-2 h-4 w-4" /></a></div>
              <div className="mt-5 space-y-4">
                <div><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Direct URL</p><div className="flex gap-2"><Input readOnly value={directUrl} className="font-mono text-xs" /><Button variant="outline" onClick={() => void copy(`url-${item.id}`, directUrl)} aria-label={`Copy ${item.name} direct URL`}>{copied === `url-${item.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div>
                <div><p className="mb-2 text-[9px] font-black uppercase tracking-widest text-gray-400">Responsive iframe code</p><div className="flex gap-2"><textarea readOnly value={code} rows={3} className="min-h-20 flex-1 resize-y rounded-xl border bg-muted/30 p-3 font-mono text-xs" /><Button variant="outline" onClick={() => void copy(`code-${item.id}`, code)} aria-label={`Copy ${item.name} embed code`}>{copied === `code-${item.id}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button></div></div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
