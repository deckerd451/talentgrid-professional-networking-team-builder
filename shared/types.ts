export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Skill {
  name: string;
  proficiency: number; // 1-5 scale
}
export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string;
  bio?: string;
  availability: 'Available' | 'Busy' | 'Not Looking';
  skills: Skill[];
  createdAt: number; // epoch millis
}
export type LeaderboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  value: number | string;
  createdAt?: number;
};