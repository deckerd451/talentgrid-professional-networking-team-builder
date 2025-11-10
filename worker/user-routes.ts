import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad } from './core-utils';
import type { Profile, Skill } from "@shared/types";
import { getSupabase } from './supabase';
import type { ProfileRow } from './supabase';
// Helper to generate a random avatar URL
const getRandomAvatar = (firstName: string, lastName: string) => {
  const seed = `${firstName} ${lastName}`;
  return `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};
// Helper to map Supabase row to application Profile type
const mapRowToProfile = (row: ProfileRow): Profile => {
    return {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        photoUrl: row.photoUrl,
        bio: row.bio,
        availability: row.availability,
        skills: (row.skills as any as Skill[]) || [], // Supabase returns JSON, cast it
        createdAt: new Date(row.created_at).getTime(),
    };
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PROFILE ROUTES
  app.post('/api/profiles', async (c) => {
    const supabase = getSupabase(c);
    const body = await c.req.json<Partial<Profile>>();
    if (!body.firstName || !body.lastName || !body.email) {
      return bad(c, 'First name, last name, and email are required');
    }
    const newProfileData = {
      id: crypto.randomUUID(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      photoUrl: getRandomAvatar(body.firstName, body.lastName),
      bio: body.bio?.trim(),
      availability: body.availability || 'Available',
      skills: body.skills || [],
    };
    const { data, error } = await supabase
      .from('profiles')
      .insert(newProfileData as any)
      .select()
      .single();
    if (error) {
      console.error('Supabase insert error:', error);
      return bad(c, 'Failed to create profile.');
    }
    return ok(c, mapRowToProfile(data as ProfileRow));
  });
  app.get('/api/profiles', async (c) => {
    const supabase = getSupabase(c);
    const nameQuery = c.req.query('name')?.toLowerCase();
    const skillsQuery = c.req.query('skills')?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    let query = supabase.from('profiles').select('*');
    if (nameQuery) {
        query = query.or(`firstName.ilike.%${nameQuery}%,lastName.ilike.%${nameQuery}%`);
    }
    const { data: allProfiles, error } = await query;
    if (error) {
        console.error('Supabase select error:', error);
        return bad(c, 'Failed to fetch profiles.');
    }
    let filteredProfiles = allProfiles.map(mapRowToProfile);
    if (skillsQuery && skillsQuery.length > 0) {
        filteredProfiles = filteredProfiles.filter(p =>
            skillsQuery.every(requiredSkill =>
                p.skills.some(profileSkill => profileSkill.name.toLowerCase().includes(requiredSkill))
            )
        );
    }
    return ok(c, filteredProfiles);
  });
  // TEAM BUILDER ROUTE
  app.post('/api/teams/build', async (c) => {
    const supabase = getSupabase(c);
    const { skills, teamSize } = await c.req.json<{ skills?: string[], teamSize?: number }>();
    if (!skills || skills.length === 0 || !teamSize || teamSize < 1) {
      return bad(c, 'Skills and a valid team size are required');
    }
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('availability', 'Available');
    if (error) {
        console.error('Supabase select error for team builder:', error);
        return bad(c, 'Failed to fetch profiles for team building.');
    }
    const availableProfiles = data.map(mapRowToProfile);
    const scoredProfiles = availableProfiles.map(profile => {
      let score = 0;
      const matchingSkills: Skill[] = [];
      for (const requiredSkill of skills) {
        const foundSkill = profile.skills.find(s => s.name.toLowerCase() === requiredSkill.toLowerCase());
        if (foundSkill) {
          score += foundSkill.proficiency;
          matchingSkills.push(foundSkill);
        }
      }
      return { ...profile, score, matchingSkills };
    }).filter(p => p.score > 0);
    scoredProfiles.sort((a, b) => b.score - a.score);
    const team = scoredProfiles.slice(0, teamSize);
    return ok(c, team);
  });
  // LEADERBOARD ROUTE
  app.get('/api/leaderboard', async (c) => {
    const supabase = getSupabase(c);
    const type = c.req.query('type');
    if (type === 'prolific') { // Most skills
        const { data, error } = await supabase.from('profiles').select('id, firstName, lastName, photoUrl, skills');
        if (error) {
            console.error('Supabase prolific leaderboard error:', error);
            return bad(c, 'Failed to fetch data for prolific leaderboard.');
        }
        const sorted = data
            .map(p => ({ ...p, value: (p.skills as any as Skill[] || []).length }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        return ok(c, sorted.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, photoUrl: p.photoUrl, value: p.value })));
    }
    if (type === 'newest') { // Newest members
        const { data, error } = await supabase
            .from('profiles')
            .select('id, firstName, lastName, photoUrl, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        if (error) {
            console.error('Supabase newest members leaderboard error:', error);
            return bad(c, 'Failed to fetch data for newest members leaderboard.');
        }
        return ok(c, data.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, photoUrl: p.photoUrl, value: new Date(p.created_at).toLocaleDateString(), createdAt: new Date(p.created_at).getTime() })));
    }
    // Default: Top skills (most common skills)
    const { data, error } = await supabase.rpc('get_top_skills');
    if (error) {
        console.error('Supabase RPC error:', error);
        return bad(c, 'Failed to fetch top skills.');
    }
    return ok(c, data);
  });
}