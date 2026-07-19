'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bold,
  Download,
  Eye,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Loader2,
  Mail,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Type,
  Users,
} from 'lucide-react';
import { useTeam } from '@/components/providers/team-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  NewsletterBlock,
  renderNewsletterHtml,
} from '@/lib/newsletter-content';

type Subscriber = {
  email: string;
  name: string;
  sources: string[];
  subscribedAt: string;
  isActive: boolean;
};

type Campaign = {
  id: string;
  subject: string;
  status: string;
  recipientCount: number;
  createdAt: string | null;
  sentAt: string | null;
};

const initialBlocks: NewsletterBlock[] = [
  { id: crypto.randomUUID(), type: 'paragraph', text: 'Write your opening message here. Use **bold**, *italic*, [links](https://thesquad.pro), or a list:\n\n- First update\n- Second update' },
];

function createBlock(type: NewsletterBlock['type']): NewsletterBlock {
  const id = crypto.randomUUID();
  if (type === 'heading') return { id, type, text: 'Section heading' };
  if (type === 'paragraph') return { id, type, text: 'Write your newsletter content here.' };
  if (type === 'image') return { id, type, url: '', alt: '', caption: '' };
  if (type === 'button') return { id, type, label: 'Learn More', url: 'https://thesquad.pro' };
  return { id, type };
}

export function NewsletterManager() {
  const { firebaseUser } = useTeam();
  const editorRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const [section, setSection] = useState<'compose' | 'subscribers'>('compose');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<NewsletterBlock[]>(initialBlocks);

  const authenticatedFetch = useCallback(async (url: string, init?: RequestInit) => {
    if (!firebaseUser) throw new Error('Your admin session is unavailable.');
    const requestWithToken = async (forceRefresh: boolean) => {
      const token = await firebaseUser.getIdToken(forceRefresh);
      return fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...init?.headers,
        },
      });
    };
    const response = await requestWithToken(false);
    return response.status === 401 ? requestWithToken(true) : response;
  }, [firebaseUser]);

  const loadData = useCallback(async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/admin/newsletter');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load newsletter data.');
      setSubscribers(payload.subscribers || []);
      setCampaigns(payload.campaigns || []);
    } catch (error) {
      toast({ title: 'Newsletter Load Failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch, firebaseUser]);

  useEffect(() => { void loadData(); }, [loadData]);

  const activeSubscribers = subscribers.filter(subscriber => subscriber.isActive);
  const filteredSubscribers = subscribers.filter(subscriber => {
    const term = search.toLowerCase();
    return subscriber.email.toLowerCase().includes(term) || subscriber.name.toLowerCase().includes(term);
  });
  const previewHtml = useMemo(() => renderNewsletterHtml({
    subject,
    previewText,
    title,
    blocks,
  }), [subject, previewText, title, blocks]);

  const updateBlock = (id: string, update: Partial<NewsletterBlock>) => {
    setBlocks(current => current.map(block => block.id === id ? { ...block, ...update } as NewsletterBlock : block));
  };

  const formatText = (
    block: Extract<NewsletterBlock, { type: 'heading' | 'paragraph' }>,
    prefix: string,
    suffix: string,
    placeholder: string,
  ) => {
    const editor = editorRefs.current[block.id];
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selection = block.text.slice(start, end) || placeholder;
    const replacement = `${prefix}${selection}${suffix}`;
    updateBlock(block.id, { text: `${block.text.slice(0, start)}${replacement}${block.text.slice(end)}` });
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + prefix.length, start + prefix.length + selection.length);
    });
  };

  const formatList = (block: Extract<NewsletterBlock, { type: 'paragraph' }>) => {
    const editor = editorRefs.current[block.id];
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selection = block.text.slice(start, end) || 'List item';
    const replacement = selection.split(/\r?\n/).map(line => `- ${line.replace(/^\s*-\s*/, '')}`).join('\n');
    updateBlock(block.id, { text: `${block.text.slice(0, start)}${replacement}${block.text.slice(end)}` });
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start, start + replacement.length);
    });
  };

  const formatLink = (block: Extract<NewsletterBlock, { type: 'paragraph' }>) => {
    const editor = editorRefs.current[block.id];
    if (!editor) return;
    const url = window.prompt('Enter the secure link URL (https://):', 'https://');
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') throw new Error('unsafe protocol');
    } catch {
      toast({ title: 'Invalid Link', description: 'Newsletter links must use a valid https:// address.', variant: 'destructive' });
      return;
    }
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selection = block.text.slice(start, end) || 'Link text';
    const replacement = `[${selection}](${url})`;
    updateBlock(block.id, { text: `${block.text.slice(0, start)}${replacement}${block.text.slice(end)}` });
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + 1, start + 1 + selection.length);
    });
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    setBlocks(current => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const deleteSubscriber = async (subscriber: Subscriber) => {
    if (!window.confirm(`Permanently remove ${subscriber.email} from the newsletter list?`)) return;
    setDeleting(subscriber.email);
    try {
      const response = await authenticatedFetch('/api/admin/newsletter', {
        method: 'DELETE',
        body: JSON.stringify({ email: subscriber.email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to delete subscriber.');
      setSubscribers(current => current.filter(item => item.email !== subscriber.email));
      toast({ title: 'Subscriber Removed', description: `${subscriber.email} was removed from Firestore and Resend.` });
    } catch (error) {
      toast({ title: 'Delete Failed', description: error instanceof Error ? error.message : 'Please retry.', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !title.trim() || blocks.length === 0) return;
    if (!window.confirm(`Send “${subject}” to ${activeSubscribers.length} active subscriber${activeSubscribers.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
    setSending(true);
    try {
      const response = await authenticatedFetch('/api/admin/newsletter/send', {
        method: 'POST',
        body: JSON.stringify({
          campaignId: crypto.randomUUID(),
          subject,
          previewText,
          title,
          blocks,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to send newsletter.');
      toast({ title: 'Newsletter Sent', description: `Resend accepted the broadcast for ${payload.recipientCount} active subscribers.` });
      await loadData();
    } catch (error) {
      toast({ title: 'Newsletter Send Failed', description: error instanceof Error ? error.message : 'Please retry.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Status', 'Sources', 'Subscribed'], ...filteredSubscribers.map(subscriber => [
      subscriber.name,
      subscriber.email,
      subscriber.isActive ? 'Active' : 'Unsubscribed',
      subscriber.sources.join(', '),
      subscriber.subscribedAt,
    ])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `squad-newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Newsletter</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
            Compose campaigns, manage subscribers, and monitor consent
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-gray-100 dark:bg-white/5 p-1.5">
          <Button variant={section === 'compose' ? 'default' : 'ghost'} onClick={() => setSection('compose')} className="rounded-xl font-black uppercase text-[10px]">
            <Send className="mr-2 h-4 w-4" /> Compose
          </Button>
          <Button variant={section === 'subscribers' ? 'default' : 'ghost'} onClick={() => setSection('subscribers')} className="rounded-xl font-black uppercase text-[10px]">
            <Users className="mr-2 h-4 w-4" /> Subscribers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: subscribers.length, Icon: Users },
          { label: 'Active', value: activeSubscribers.length, Icon: Mail },
          { label: 'Unsubscribed', value: subscribers.length - activeSubscribers.length, Icon: Minus },
          { label: 'Campaigns', value: campaigns.length, Icon: Send },
        ].map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <Icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-2xl font-black text-gray-900 dark:text-white">{value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {section === 'subscribers' ? (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search subscribers…" className="h-12 pl-10 rounded-xl" />
            </div>
            <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="h-12 rounded-xl font-black uppercase text-[10px]">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Refresh
            </Button>
            <Button variant="outline" onClick={exportCsv} className="h-12 rounded-xl font-black uppercase text-[10px]">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1fr_1.5fr_1fr_0.7fr_auto] gap-4 border-b px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span>Name</span><span>Email</span><span>Sources</span><span>Status</span><span>Action</span>
              </div>
              {loading ? (
                <div className="py-16 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" /></div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="py-16 text-center text-xs font-black uppercase tracking-widest text-gray-400">No subscribers found.</div>
              ) : filteredSubscribers.map(subscriber => (
                <div key={subscriber.email} className="grid grid-cols-[1fr_1.5fr_1fr_0.7fr_auto] gap-4 items-center border-b last:border-0 px-6 py-4 text-sm">
                  <span className="font-bold truncate">{subscriber.name || '—'}</span>
                  <span className="font-mono truncate text-gray-600 dark:text-white/60">{subscriber.email}</span>
                  <span className="text-[10px] font-black uppercase text-gray-400">{subscriber.sources.join(', ')}</span>
                  <span className={`w-fit rounded-full px-2 py-1 text-[9px] font-black uppercase ${subscriber.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => void deleteSubscriber(subscriber)} disabled={deleting === subscriber.email} className="text-destructive" aria-label={`Delete ${subscriber.email}`}>
                    {deleting === subscriber.email ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 space-y-5">
              <div><Label>Subject line</Label><Input value={subject} onChange={event => setSubject(event.target.value)} maxLength={200} placeholder="This week at The Squad…" className="mt-2 h-12 rounded-xl" /></div>
              <div><Label>Inbox preview text</Label><Input value={previewText} onChange={event => setPreviewText(event.target.value)} maxLength={300} placeholder="A short summary shown beside the subject" className="mt-2 h-12 rounded-xl" /></div>
              <div><Label>Newsletter headline</Label><Input value={title} onChange={event => setTitle(event.target.value)} maxLength={200} placeholder="The Squad Weekly" className="mt-2 h-12 rounded-xl" /></div>
            </div>

            <div className="space-y-4">
              {blocks.map((block, index) => (
                <div key={block.id} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{block.type}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => moveBlock(index, -1)} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setBlocks(current => current.filter(item => item.id !== block.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {(block.type === 'heading' || block.type === 'paragraph') && (
                    <div className="overflow-hidden rounded-xl border bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2" role="toolbar" aria-label="Rich text formatting">
                        <Button type="button" variant="ghost" size="sm" onClick={() => formatText(block, '**', '**', 'bold text')} aria-label="Bold selected text" title="Bold">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => formatText(block, '*', '*', 'italic text')} aria-label="Italicize selected text" title="Italic">
                          <Italic className="h-4 w-4" />
                        </Button>
                        {block.type === 'paragraph' && (
                          <>
                            <Button type="button" variant="ghost" size="sm" onClick={() => formatLink(block)} aria-label="Add link" title="Add link">
                              <Link2 className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => formatList(block)} aria-label="Format as bullet list" title="Bullet list">
                              <List className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <span className="ml-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rich text</span>
                      </div>
                      <Textarea
                        ref={element => { editorRefs.current[block.id] = element; }}
                        value={block.text}
                        onChange={event => updateBlock(block.id, { text: event.target.value })}
                        rows={block.type === 'paragraph' ? 9 : 2}
                        maxLength={10000}
                        aria-label={`${block.type} rich text editor`}
                        className="resize-y rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  )}
                  {block.type === 'paragraph' && <p className="text-[10px] text-gray-400">Select text and use the formatting toolbar. The live preview shows exactly how the email will appear.</p>}
                  {block.type === 'image' && (
                    <div className="space-y-3">
                      <Input type="url" value={block.url} onChange={event => updateBlock(block.id, { url: event.target.value })} placeholder="https://… public image URL" />
                      <Input value={block.alt} onChange={event => updateBlock(block.id, { alt: event.target.value })} placeholder="Image description for accessibility" maxLength={300} />
                      <Input value={block.caption || ''} onChange={event => updateBlock(block.id, { caption: event.target.value })} placeholder="Optional caption" maxLength={500} />
                    </div>
                  )}
                  {block.type === 'button' && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input value={block.label} onChange={event => updateBlock(block.id, { label: event.target.value })} placeholder="Button label" maxLength={120} />
                      <Input type="url" value={block.url} onChange={event => updateBlock(block.id, { url: event.target.value })} placeholder="https://…" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ['heading', Heading2, 'Heading'], ['paragraph', Type, 'Text'], ['image', ImageIcon, 'Image'], ['button', Link2, 'Button'], ['divider', Minus, 'Divider'],
              ].map(([type, Icon, label]) => (
                <Button key={String(type)} variant="outline" onClick={() => setBlocks(current => [...current, createBlock(type as NewsletterBlock['type'])])} className="rounded-xl text-[10px] font-black uppercase">
                  <Icon className="mr-2 h-4 w-4" /><Plus className="mr-1 h-3 w-3" />{String(label)}
                </Button>
              ))}
            </div>

            <Button onClick={() => void sendNewsletter()} disabled={sending || !subject.trim() || !title.trim() || blocks.length === 0 || activeSubscribers.length === 0} className="h-14 w-full rounded-2xl font-black uppercase tracking-widest">
              {sending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
              Send to {activeSubscribers.length} Active Subscriber{activeSubscribers.length === 1 ? '' : 's'}
            </Button>
          </div>

          <div className="xl:sticky xl:top-6 space-y-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><Eye className="h-4 w-4" /> Live email preview</div>
            <iframe title="Newsletter preview" sandbox="" srcDoc={previewHtml} className="h-[760px] w-full rounded-2xl border bg-gray-100" />
            {campaigns.length > 0 && (
              <div className="rounded-2xl border bg-white dark:bg-white/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400"><List className="h-4 w-4" /> Recent campaigns</div>
                {campaigns.slice(0, 5).map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between gap-4 border-t pt-3 text-sm">
                    <div className="min-w-0"><p className="font-bold truncate">{campaign.subject}</p><p className="text-[10px] text-gray-400">{campaign.recipientCount} recipients</p></div>
                    <span className="text-[9px] font-black uppercase text-primary">{campaign.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
