import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProfileEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { Profile, Skill } from "@shared/types";
// Helper to generate a random avatar URL
const getRandomAvatar = () => {
  const seed = Math.random().toString(36).substring(7);
  return `https://api.dicebear.com/6.x/initials/svg?seed=${seed}`;
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PROFILE ROUTES
  app.post('/api/profiles', async (c) => {
    const body = await c.req.json<Partial<Profile>>();
    if (!isStr(body.firstName) || !isStr(body.lastName) || !isStr(body.email)) {
      return bad(c, 'First name, last name, and email are required');
    }
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim(),
      photoUrl: getRandomAvatar(),
      bio: body.bio?.trim(),
      availability: body.availability || 'Available',
      skills: body.skills || [],
      createdAt: Date.now(),
    };
    const created = await ProfileEntity.create(c.env, newProfile);
    return ok(c, created);
  });
  app.get('/api/profiles', async (c) => {
    const nameQuery = c.req.query('name')?.toLowerCase();
    const skillsQuery = c.req.query('skills')?.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const { items: allProfiles } = await ProfileEntity.list(c.env, null, 1000); // Limiting to 1000 for performance
    let filteredProfiles = allProfiles;
    if (nameQuery) {
      filteredProfiles = filteredProfiles.filter(p => 
        p.firstName.toLowerCase().includes(nameQuery) || 
        p.lastName.toLowerCase().includes(nameQuery)
      );
    }
    if (skillsQuery && skillsQuery.length > 0) {
      filteredProfiles = filteredProfiles.filter(p => 
        skillsQuery.every(requiredSkill => 
          p.skills.some(profileSkill => profileSkill.name.toLowerCase() === requiredSkill)
        )
      );
    }
    return ok(c, filteredProfiles);
  });
  // TEAM BUILDER ROUTE
  app.post('/api/teams/build', async (c) => {
    const { skills, teamSize } = await c.req.json<{ skills?: string[], teamSize?: number }>();
    if (!skills || skills.length === 0 || !teamSize || teamSize < 1) {
      return bad(c, 'Skills and a valid team size are required');
    }
    const { items: allProfiles } = await ProfileEntity.list(c.env, null, 1000);
    const availableProfiles = allProfiles.filter(p => p.availability === 'Available');
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
    const type = c.req.query('type');
    const { items: allProfiles } = await ProfileEntity.list(c.env, null, 1000);
    if (type === 'prolific') { // Most skills
      const sorted = allProfiles
        .map(p => ({ ...p, value: p.skills.length }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
      return ok(c, sorted.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, photoUrl: p.photoUrl, value: p.value })));
    }
    if (type === 'newest') { // Newest members
      const sorted = allProfiles
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);
      return ok(c, sorted.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, photoUrl: p.photoUrl, value: new Date(p.createdAt).toLocaleDateString() })));
    }
    // Default: Top skills (most common skills)
    const skillCounts: Record<string, number> = {};
    allProfiles.forEach(p => {
      p.skills.forEach(s => {
        skillCounts[s.name] = (skillCounts[s.name] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
    return ok(c, topSkills);
  });
}