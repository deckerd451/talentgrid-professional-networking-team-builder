import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { UserPlus, Search, Users, Trophy, X, Star, Link, Rocket, PlusCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import NeuralBackground from '@/components/NeuralBackground';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';
import type { Profile, Skill, LeaderboardUser } from '@shared/types';
const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(120, 'Bio must be 120 characters or less').optional(),
  availability: z.enum(['Available', 'Busy', 'Not Looking']),
});
type ProfileFormData = z.infer<typeof profileSchema>;
export function HomePage() {
  // Form State
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { availability: 'Available' },
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentProficiency, setCurrentProficiency] = useState(3);
  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [teamResults, setTeamResults] = useState<Profile[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardType, setLeaderboardType] = useState<'skills' | 'prolific' | 'newest'>('skills');
  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.some(s => s.name.toLowerCase() === currentSkill.trim().toLowerCase())) {
      setSkills([...skills, { name: currentSkill.trim(), proficiency: currentProficiency }]);
      setCurrentSkill('');
      setCurrentProficiency(3);
    }
  };
  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };
  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await api('/api/profiles', {
        method: 'POST',
        body: JSON.stringify({ ...data, skills }),
      });
      toast.success('Profile created successfully!');
      reset();
      setSkills([]);
    } catch (error) {
      toast.error('Failed to create profile.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearch = async (formData: { name?: string; skills?: string }) => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams();
      if (formData.name) params.append('name', formData.name);
      if (formData.skills) params.append('skills', formData.skills);
      const results = await api<Profile[]>(`/api/profiles?${params.toString()}`);
      setSearchResults(results);
      if (results.length === 0) {
        toast.info('No profiles found matching your criteria.');
      }
    } catch (error) {
      toast.error('Search failed.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleBuildTeam = async (formData: { skills: string; teamSize: number }) => {
    setIsLoading(true);
    setTeamResults([]);
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length === 0) {
        toast.warning('Please enter at least one skill.');
        setIsLoading(false);
        return;
      }
      const results = await api<Profile[]>('/api/teams/build', {
        method: 'POST',
        body: JSON.stringify({ skills: skillsArray, teamSize: formData.teamSize }),
      });
      setTeamResults(results);
    } catch (error) {
      toast.error('Failed to build team.');
    } finally {
      setIsLoading(false);
    }
  };
  const fetchLeaderboard = useCallback(async (type: 'skills' | 'prolific' | 'newest') => {
    setIsLoading(true);
    setLeaderboardType(type);
    setLeaderboardData([]);
    try {
      const data = await api<any[]>(`/api/leaderboard?type=${type}`);
      setLeaderboardData(data);
    } catch (error) {
      toast.error('Failed to fetch leaderboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchLeaderboard('skills');
  }, [fetchLeaderboard]);
  const renderLeaderboard = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full mb-2" />);
    }
    if (leaderboardData.length === 0) {
      return <p className="text-muted-foreground text-center">No data available.</p>;
    }
    if (leaderboardType === 'skills') {
      return leaderboardData.map((skill, index) => (
        <div key={skill.name} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-muted-foreground w-6">{index + 1}</span>
            <Badge>{skill.name}</Badge>
          </div>
          <span className="font-semibold">{skill.count} users</span>
        </div>
      ));
    } else {
      return leaderboardData.map((user: LeaderboardUser, index) => (
        <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
          <div className="flex items-center gap-4">
            <span className="font-bold text-lg text-muted-foreground w-6">{index + 1}</span>
            <Avatar>
              <AvatarImage src={user.photoUrl} />
              <AvatarFallback>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{user.firstName} {user.lastName}</span>
          </div>
          <span className="font-semibold">{user.value}</span>
        </div>
      ));
    }
  };
  return (
    <>
      <NeuralBackground />
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans">
        <main className="w-full max-w-7xl mx-auto py-8 md:py-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">TalentGrid</h1>
            <p className="text-center text-muted-foreground mb-8">Professional Networking & Team Builder</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="profile"><UserPlus className="w-4 h-4 mr-2" />Create Profile</TabsTrigger>
                  <TabsTrigger value="search"><Search className="w-4 h-4 mr-2" />Search</TabsTrigger>
                  <TabsTrigger value="team-builder"><Users className="w-4 h-4 mr-2" />Team Builder</TabsTrigger>
                  <TabsTrigger value="leaderboard"><Trophy className="w-4 h-4 mr-2" />Leaderboard</TabsTrigger>
                </TabsList>
                <AnimatePresence mode="wait">
                  <motion.div key="tab-content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                    <TabsContent value="profile" className="p-6 md:p-8">
                      <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label htmlFor="firstName">First Name</Label><Input id="firstName" {...register('firstName')} />{errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}</div>
                          <div><Label htmlFor="lastName">Last Name</Label><Input id="lastName" {...register('lastName')} />{errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}</div>
                        </div>
                        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" {...register('email')} />{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}</div>
                        <div><Label htmlFor="bio">Short Bio</Label><Input id="bio" {...register('bio')} placeholder="Tell us about yourself" />{errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}</div>
                        <div>
                          <Label>Skills</Label>
                          <div className="flex gap-2">
                            <Input value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} placeholder="e.g., React" />
                            <Button type="button" onClick={handleAddSkill}><PlusCircle className="w-4 h-4" /></Button>
                          </div>
                          <div className="mt-2"><Label>Proficiency: {currentProficiency}</Label><Slider value={[currentProficiency]} onValueChange={(v) => setCurrentProficiency(v[0])} min={1} max={5} step={1} /></div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {skills.map(skill => (
                              <Badge key={skill.name} variant="secondary" className="flex items-center gap-1">
                                {skill.name} ({skill.proficiency})
                                <button type="button" onClick={() => handleRemoveSkill(skill.name)}><X className="w-3 h-3" /></button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="availability">Availability</Label>
                          <Controller name="availability" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Available">Available</SelectItem>
                                <SelectItem value="Busy">Busy</SelectItem>
                                <SelectItem value="Not Looking">Not Looking</SelectItem>
                              </SelectContent>
                            </Select>
                          )} />
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Saving...' : 'Save Profile'}</Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="search" className="p-6 md:p-8 space-y-8">
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleSearch({ name: fd.get('name') as string, skills: fd.get('skills') as string }); }} className="space-y-4">
                        <div><Label htmlFor="search-name">Search by Name</Label><Input id="search-name" name="name" placeholder="e.g., John Doe" /></div>
                        <div><Label htmlFor="search-skills">Search by Skills (comma-separated)</Label><Input id="search-skills" name="skills" placeholder="e.g., react,nodejs" /></div>
                        <Button type="submit" className="w-full">Search Profiles</Button>
                      </form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoading && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                        <AnimatePresence>
                          {searchResults.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
                        </AnimatePresence>
                      </div>
                    </TabsContent>
                    <TabsContent value="team-builder" className="p-6 md:p-8 space-y-8">
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleBuildTeam({ skills: fd.get('team-skills') as string, teamSize: Number(fd.get('team-size')) }); }} className="space-y-4">
                        <div><Label htmlFor="team-skills">Required Skills (comma-separated)</Label><Input id="team-skills" name="team-skills" placeholder="e.g., react,figma,rust" required /></div>
                        <div><Label htmlFor="team-size">Team Size</Label><Input id="team-size" name="team-size" type="number" min="1" max="10" defaultValue="3" required /></div>
                        <Button type="submit" className="w-full">Build Team</Button>
                      </form>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                        <AnimatePresence>
                          {teamResults.map(profile => <ProfileCard key={profile.id} profile={profile} />)}
                        </AnimatePresence>
                      </div>
                    </TabsContent>
                    <TabsContent value="leaderboard" className="p-6 md:p-8">
                      <CardHeader className="p-0 mb-4"><CardTitle>Leaderboard</CardTitle></CardHeader>
                      <div className="flex gap-2 mb-4">
                        <Button variant={leaderboardType === 'skills' ? 'default' : 'outline'} onClick={() => fetchLeaderboard('skills')}><Star className="w-4 h-4 mr-2" />Top Skills</Button>
                        <Button variant={leaderboardType === 'prolific' ? 'default' : 'outline'} onClick={() => fetchLeaderboard('prolific')}><Link className="w-4 h-4 mr-2" />Most Prolific</Button>
                        <Button variant={leaderboardType === 'newest' ? 'default' : 'outline'} onClick={() => fetchLeaderboard('newest')}><Rocket className="w-4 h-4 mr-2" />Newest Members</Button>
                      </div>
                      <div className="space-y-2">{renderLeaderboard()}</div>
                    </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </Tabs>
            </Card>
          </motion.div>
        </main>
      </div>
      <Toaster richColors />
    </>
  );
}