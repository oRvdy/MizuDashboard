import { FaStar, FaCrown, FaTrophy } from 'react-icons/fa'
import { ClanMember, ClanGoal } from '@/types';

interface Stats {
  wins: number;
  final_kills: number;
  xp: number;
  monthly_wins?: number;
  monthly_kills?: number;
  monthly_xp?: number;
  [key: string]: number | undefined;
}

interface MemberStatsCardProps {
  member: ClanMember;
  goals: ClanGoal[];
  isOwner: boolean;
  onRemove?: (member: ClanMember) => void;
}

export default function MemberStatsCard({ member, goals, isOwner, onRemove }: MemberStatsCardProps) {
  const stats: Stats = member.stats || {
    wins: 0,
    final_kills: 0,
    xp: 0,
    monthly_wins: 0,
    monthly_kills: 0,
    monthly_xp: 0
  }

  const getProgressForGoal = (type: string) => {
    const goal = goals.find(g => g.type === type)
    if (!goal) return { progress: 0, current: 0, target: 0 }

    const statsKey = type === 'kills' ? 'final_kills' : type
    const current = stats[statsKey] || 0
    const progress = (current / goal.target) * 100

    return {
      progress: Math.min(progress, 100),
      current,
      target: goal.target
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={`https://mc-heads.net/avatar/${member.nick}`}
              alt={member.nick}
              className="w-12 h-12 rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{member.nick}</h3>
            <p className="text-sm text-gray-400">
              Discord ID: {member.discordId || 'Não definido'}
            </p>
            <div className="text-sm text-gray-400">
              Total Wins: {stats.wins}
            </div>
          </div>
        </div>
        {isOwner && onRemove && (
          <button
            onClick={() => onRemove(member)}
            className="text-red-500 hover:text-red-400"
          >
            Remover
          </button>
        )}
      </div>

      <div className="flex gap-6 mt-4">
        {goals.map((goal, index) => {
          const { progress, current, target } = getProgressForGoal(goal.type);
          return (
            <div key={index} className="text-center min-w-[120px]">
              <div className="text-sm text-gray-400 mb-1 capitalize">{goal.type}</div>
              <div className="w-full h-2 bg-gray-600 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400">
                {current.toLocaleString()} / {target.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
