
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen } from 'lucide-react';

interface ProfileBadgesProps {
  college?: string;
  major?: string;
  schoolYear?: string;
}

const ProfileBadges = ({ college, major, schoolYear }: ProfileBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {college && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
          <GraduationCap className="w-3 h-3" />
          {college}
        </Badge>
      )}
      {major && (
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100">
          <BookOpen className="w-3 h-3" />
          {major}
        </Badge>
      )}
      {schoolYear && (
        <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
          {schoolYear}
        </Badge>
      )}
    </div>
  );
};

export default ProfileBadges;
