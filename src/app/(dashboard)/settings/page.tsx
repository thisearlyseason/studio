
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Bell, 
  Lock, 
  LogOut, 
  Camera, 
  ChevronRight,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useTeam } from '@/components/providers/team-provider';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { user, updateUser, members, activeTeam, updateMember } = useTeam();
  const auth = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    position: ''
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setEditForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone
      }));
    }
  }, [user]);

  if (!mounted || !activeTeam || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-pulse">
        <div className="h-12 w-12 bg-primary/10 rounded-full mb-4" />
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Adjusting settings...</p>
      </div>
    );
  }

  const currentMember = members.find(m => m.id === user.id && m.teamId === activeTeam.id);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Avatars can be smaller
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUpdatingAvatar(true);
      try {
        const compressed = await compressImage(e.target.files[0]);
        await updateUser({ avatar: compressed });
        toast({ title: "Avatar Updated", description: "Your profile picture has been updated successfully." });
      } catch (error) {
        toast({ title: "Update Failed", description: "Could not update avatar image.", variant: "destructive" });
      } finally {
        setIsUpdatingAvatar(false);
      }
    }
  };

  const handleSaveProfile = () => {
    updateUser({
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone
    });
    
    if (currentMember) {
      updateMember(currentMember.id, {
        position: editForm.position
      });
    }

    setIsEditOpen(false);
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully.",
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <Card className="border-none shadow-sm overflow-hidden rounded-3xl">
        <div className="bg-primary/5 h-20 w-full" />
        <CardContent className="-mt-10 space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="font-bold">{user.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="secondary" 
                disabled={isUpdatingAvatar}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md bg-white hover:bg-muted"
                onClick={handleAvatarClick}
              >
                {isUpdatingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Camera className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground font-medium">{currentMember?.position || 'Team Member'}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">{user.email}</p>
            </div>
            
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full px-6 border-primary/20 text-primary hover:bg-primary/5">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>Update your personal information for your team profile.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input 
                      className="rounded-xl h-11"
                      value={editForm.name} 
                      onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position / Role</Label>
                    <Select 
                      value={editForm.position} 
                      onValueChange={(v) => setEditForm(prev => ({ ...prev, position: v }))}
                    >
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue placeholder="Select position..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coach">Coach</SelectItem>
                        <SelectItem value="Team Lead">Team Lead</SelectItem>
                        <SelectItem value="Assistant Coach">Assistant Coach</SelectItem>
                        <SelectItem value="Squad Leader">Squad Leader</SelectItem>
                        <SelectItem value="Player">Player</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      className="rounded-xl h-11"
                      value={editForm.email} 
                      onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      className="rounded-xl h-11"
                      value={editForm.phone} 
                      onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))} 
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button className="w-full rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20" onClick={handleSaveProfile}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Menu Options */}
      <div className="space-y-4">
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden ring-1 ring-black/5">
          <CardContent className="p-0">
            <div className="divide-y divide-muted/50">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Push Notifications</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Alerts for posts, events & chats</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <button 
                onClick={() => navigateTo('/privacy')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2.5 rounded-2xl text-amber-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Privacy & Security</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manage your account protection</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>

              <button 
                onClick={() => navigateTo('/safety')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2.5 rounded-2xl text-green-600">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">Help & Support</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Get assistance or report an issue</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-3xl overflow-hidden ring-1 ring-black/5">
          <CardContent className="p-0">
            <button 
              onClick={handleLogout}
              className="w-full p-4 flex items-center justify-between hover:bg-destructive/5 text-destructive transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2.5 rounded-2xl">
                  <LogOut className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Log Out</p>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Sign out of your session</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">The Squad v1.0.0 • Professional Team Hub</p>
      </div>
    </div>
  );
}
