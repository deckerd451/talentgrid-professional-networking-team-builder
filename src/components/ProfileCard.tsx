import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, Mail } from 'lucide-react';
import type { Profile } from '@shared/types';
interface ProfileCardProps {
  profile: Profile;
}
const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.photoUrl} alt={`${profile.firstName} ${profile.lastName}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{`${profile.firstName} ${profile.lastName}`}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Mail className="h-4 w-4" /> {profile.email}
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            {profile.bio && <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>}
            <div className="flex items-center gap-2 text-sm font-medium mb-4">
              <Briefcase className="h-4 w-4" />
              <Badge variant={profile.availability === 'Available' ? 'default' : 'secondary'} className={profile.availability === 'Available' ? 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30' : ''}>
                {profile.availability}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 5).map((skill) => (
                <Badge key={skill.name} variant="secondary">
                  {skill.name} ({skill.proficiency})
                </Badge>
              ))}
              {profile.skills.length > 5 && <Badge variant="outline">+{profile.skills.length - 5} more</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
export default ProfileCard;