"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Send, 
  BarChart2, 
  MoreVertical, 
  Sparkles,
  X,
  Plus,
  Trash2,
  Users,
  ImagePlus,
  XCircle,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { suggestPollQuestionAndOptions } from '@/ai/flows/poll-question-and-option-suggestion';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useTeam, Message } from '@/components/providers/team-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const { addMessage, votePoll, user, formatTime, members, activeTeam } = useTeam();
  const db = useFirestore();
  
  const [input, setInput] = useState('');
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const [pollPrompt, setPollPrompt] = useState('');
  const [pollOptions, setPollOptions] = useState<{text: string, image?: string}[]>([{text: '', image: undefined}, {text: '', image: undefined}]);
  const [suggestedPoll, setSuggestedPoll] = useState<{question: string, options: string[]} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatImage, setChatImage] = useState<string | undefined>();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionImageInputRef = useRef<HTMLInputElement>(null);
  const activeOptionIdxRef = useRef<number | null>(null);

  // Memoized Chat Metadata Ref
  const chatDocRef = useMemoFirebase(() => {
    if (!activeTeam || !db || !chatId) return null;
    return doc(db, 'teams', activeTeam.id, 'groupChats', chatId as string);
  }, [activeTeam?.id, db, chatId]);

  const { data: currentChat, isLoading: isChatLoading } = useDoc(chatDocRef);

  // Memoized Messages Query - Ordered by date to ensure fast loading and correct sequence
  const messagesQuery = useMemoFirebase(() => {
    if (!activeTeam || !db || !chatId) return null;
    return query(
      collection(db, 'teams', activeTeam.id, 'groupChats', chatId as string, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
  }, [activeTeam?.id, db, chatId]);

  const { data: messages = [], isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);

  // Auto-scroll to bottom on new messages or initial load
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages?.length]);

  const handleSendMessage = () => {
    if ((!input.trim() && !chatImage) || !chatId || !user) return;
    if (chatImage && !input.trim()) {
      addMessage(chatId as string, user.name, '', 'image', chatImage);
    } else if (chatImage) {
      addMessage(chatId as string, user.name, input, 'image', chatImage);
    } else {
      addMessage(chatId as string, user.name, input, 'text');
    }
    setInput('');
    setChatImage(undefined);
  };

  const handleSuggestPoll = async () => {
    if (!pollPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await suggestPollQuestionAndOptions({ prompt: pollPrompt });
      setSuggestedPoll(result);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate poll.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreatePoll = () => {
    if (!chatId || !user) return;
    let question = pollPrompt;
    let finalOptions = pollOptions.filter(o => o.text.trim() !== '');
    if (suggestedPoll) {
      question = suggestedPoll.question;
      finalOptions = suggestedPoll.options.map(o => ({text: o, image: undefined}));
    }
    if (!question || finalOptions.length < 2) {
      toast({ title: "Error", description: "Poll needs question and options.", variant: "destructive" });
      return;
    }
    const pollData = { id: 'p' + Date.now(), question, options: finalOptions.map(o => ({ text: o.text, imageUrl: o.image, votes: 0 })), totalVotes: 0, voters: {}, isClosed: false };
    addMessage(chatId as string, user.name, '', 'poll', undefined, pollData);
    setIsPollDialogOpen(false); setSuggestedPoll(null); setPollPrompt(''); setPollOptions([{text: '', image: undefined}, {text: '', image: undefined}]);
  };

  if (isChatLoading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Opening discussion...</p>
    </div>
  );

  if (!currentChat) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <Users className="h-12 w-12 text-muted-foreground opacity-20" />
      <h2 className="text-xl font-black uppercase tracking-tight">Chat Not Found</h2>
      <Button variant="outline" onClick={() => router.push('/chats')}>Back to Chats</Button>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-130px)] -mt-4 md:-mt-4 -mx-4 overflow-hidden">
      <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b bg-background sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chats')} className="rounded-full h-9 w-9 md:h-10 md:w-10"><ChevronLeft className="h-5 w-5" /></Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-black truncate text-base md:text-lg tracking-tight">{currentChat.name}</h2>
          <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{currentChat.memberIds?.length || 0} Members</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 md:h-10 md:w-10"><MoreVertical className="h-5 w-5" /></Button>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-4 space-y-6 pb-10">
          {isMessagesLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
          ) : messages.length > 0 ? messages.map((msg) => {
            const isMe = msg.authorId === user?.id;
            const isPoll = (msg.type === 'poll' || !!msg.poll) && msg.poll;
            const hasOptionImages = isPoll && msg.poll?.options.some(o => o.imageUrl);

            return (
              <div key={msg.id} className={cn("flex flex-col gap-1.5", isMe ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[8px] lg:text-[9px] font-black uppercase text-muted-foreground tracking-widest truncate max-w-[100px]">{msg.author}</span>
                  <span className="text-[8px] lg:text-[9px] text-muted-foreground/50 font-bold whitespace-nowrap">{formatTime(msg.createdAt)}</span>
                </div>
                {!isPoll ? (
                  <div className={cn("max-w-[85%] sm:max-w-[70%] p-3 lg:p-3.5 rounded-2xl text-xs lg:text-sm shadow-sm space-y-2 break-words", isMe ? "bg-primary text-white rounded-tr-none" : "bg-muted text-foreground rounded-tl-none")}>
                    {msg.imageUrl && (
                      <div className="rounded-xl overflow-hidden border-2 border-white/20 shadow-lg mb-2">
                        <img src={msg.imageUrl} alt="Chat attachment" className="w-full h-auto max-h-[250px] lg:max-h-[300px] object-cover" />
                      </div>
                    )}
                    {msg.content && <p className="font-medium leading-relaxed">{msg.content}</p>}
                  </div>
                ) : (
                  <div className="w-full max-w-[95%] sm:max-w-[80%] bg-card border rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-md">
                    <div className="bg-primary/5 p-4 lg:p-5 border-b">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] lg:text-[9px] font-black text-primary uppercase tracking-widest">Squad Poll</span>
                        <BarChart2 className="h-3.5 w-3.5 text-primary opacity-50" />
                      </div>
                      <h4 className="font-black text-sm lg:text-lg leading-tight tracking-tight">{msg.poll?.question}</h4>
                    </div>
                    <div className={cn("p-4 lg:p-5", hasOptionImages ? "grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4" : "space-y-3 lg:space-y-4")}>
                      {msg.poll?.options.map((opt, i) => {
                        const hasVoted = msg.poll?.voters?.[user?.id || ''] === i;
                        const percentage = msg.poll!.totalVotes > 0 ? (opt.votes / msg.poll!.totalVotes) * 100 : 0;
                        return (
                          <div key={i} className={cn("relative group", hasOptionImages ? "bg-muted/20 rounded-2xl lg:rounded-3xl overflow-hidden flex flex-col border hover:border-primary/20 transition-all" : "")}>
                            {hasOptionImages && (
                              <div className="relative aspect-video overflow-hidden cursor-zoom-in" onClick={() => opt.imageUrl && setLightboxImage(opt.imageUrl)}>
                                {opt.imageUrl ? <img src={opt.imageUrl} className="w-full h-full object-cover" alt={opt.text} /> : <div className="w-full h-full bg-muted flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground/20" /></div>}
                              </div>
                            )}
                            <div className={cn("p-2 lg:p-3 space-y-2 lg:space-y-3", !hasOptionImages && "w-full")}>
                              <button onClick={() => votePoll(chatId as string, msg.id, i)} className={cn("w-full text-left relative transition-all p-1", hasVoted ? "ring-2 ring-primary ring-offset-1 rounded-xl" : "hover:bg-muted/50 rounded-xl")}>
                                <div className="flex justify-between text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-1.5 px-1">
                                  <span className="flex items-center gap-1.5 truncate max-w-[120px]">{opt.text}{hasVoted && <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse shrink-0" />}</span>
                                  <span className="text-primary shrink-0">{opt.votes}</span>
                                </div>
                                <div className="relative"><Progress value={percentage} className="h-2 lg:h-2.5 rounded-full" /></div>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                <div className="bg-muted p-6 rounded-full"><Users className="h-8 w-8" /></div>
                <p className="text-xs font-black uppercase tracking-widest">No messages yet. Start the coordination.</p>
              </div>
            )}
        </div>
      </ScrollArea>

      <div className="p-3 md:p-4 bg-background border-t mt-auto shrink-0 relative z-20">
        {chatImage && (
          <div className="mb-2 relative inline-block">
            <img src={chatImage} alt="Attachment" className="h-16 lg:h-24 w-auto rounded-xl border-2 border-primary/10 shadow-lg" />
            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg" onClick={() => setChatImage(undefined)}><X className="h-3.5 w-3.5" /></Button>
          </div>
        )}
        <div className="flex items-center gap-2 lg:gap-3">
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async (e) => { if (e.target.files?.[0]) { const reader = new FileReader(); reader.onload = (ev) => setChatImage(ev.target?.result as string); reader.readAsDataURL(e.target.files[0]); } }} />
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 lg:h-12 lg:w-12 border-primary/20 text-primary" onClick={() => fileInputRef.current?.click()}><ImagePlus className="h-4 w-4 lg:h-5 lg:w-5" /></Button>
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 lg:h-12 lg:w-12 border-primary/20 text-primary" onClick={() => setIsPollDialogOpen(true)}><BarChart2 className="h-4 w-4 lg:h-5 lg:w-5" /></Button>
          <Input className="flex-1 rounded-full bg-muted border-none h-10 lg:h-12 px-4 lg:px-6 shadow-inner font-medium text-sm lg:text-base" placeholder="Message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
          <Button size="icon" className="shrink-0 rounded-full h-10 w-10 lg:h-12 lg:w-12 shadow-lg shadow-primary/20" onClick={handleSendMessage}><Send className="h-4 w-4 lg:h-5 lg:w-5" /></Button>
        </div>
      </div>

      <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
        <DialogContent className="sm:max-w-4xl rounded-3xl lg:rounded-[2.5rem] overflow-hidden p-0 max-h-[90vh] flex flex-col border-none shadow-2xl">
          <DialogTitle className="sr-only">Create Poll</DialogTitle>
          <DialogDescription className="sr-only">New poll form</DialogDescription>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 lg:p-8 bg-primary/5 lg:border-r space-y-4 lg:space-y-6">
                <DialogHeader><DialogTitle className="text-xl lg:text-2xl font-black">Squad Poll</DialogTitle></DialogHeader>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1">The Topic</Label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Venue?" value={pollPrompt} onChange={(e) => setPollPrompt(e.target.value)} className="h-11 lg:h-12 rounded-xl bg-background border-2 font-black text-sm" />
                    <Button variant="secondary" onClick={handleSuggestPoll} disabled={isGenerating || !pollPrompt.trim()} className="h-11 w-11 lg:h-12 lg:w-12 rounded-xl border-2 shrink-0">
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6 lg:p-8 space-y-4 lg:space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Options</Label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input placeholder={`Opt ${i+1}`} value={opt.text} onChange={(e) => { const n = [...pollOptions]; n[i].text = e.target.value; setPollOptions(n); }} className="h-10 lg:h-11 rounded-xl bg-muted/30 text-sm" />
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive" onClick={() => pollOptions.length > 2 && setPollOptions(pollOptions.filter((_, idx) => idx !== i))} disabled={pollOptions.length <= 2}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {pollOptions.length < 6 && <Button variant="ghost" size="sm" onClick={() => setPollOptions([...pollOptions, {text: '', image: undefined}])} className="h-7 text-[9px] font-black uppercase text-primary"><Plus className="h-3 w-3 mr-1" /> Add Option</Button>}
                </div>
                <Button className="w-full h-12 lg:h-14 rounded-2xl text-base font-black shadow-xl shadow-primary/20 active:scale-95 transition-all" onClick={handleCreatePoll}>Launch Poll</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl p-0 overflow-hidden bg-black/95 border-none rounded-2xl">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <img src={lightboxImage!} className="w-full h-auto max-h-[85vh] object-contain" alt="Large" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
