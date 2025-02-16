import { FaChartLine, FaTrash } from 'react-icons/fa'

interface ClanGoalProps {
  goal: {
    id: string
    type: string
    target: number
    description: string
    deadline: string
    progress: Record<string, number>
  }
  members: Array<{ nick: string, stats: any }>
  isOwner: boolean
  onDelete?: () => void
}

export default function ClanGoalCard({ goal, members, isOwner, onDelete }: ClanGoalProps) {
  const calculateProgress = (memberStats: any) => {
    if (!memberStats) return 0;
    const current = memberStats[goal.type] || 0;
    return Math.min((current / goal.target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{goal.description}</h3>
          <p className="text-sm text-gray-400">
            Meta: {goal.target.toLocaleString()} {goal.type}
          </p>
          <p className="text-sm text-gray-400">
            Prazo: {new Date(goal.deadline).toLocaleDateString()}
          </p>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-400"
          >
            <FaTrash />
          </button>
        )}
      </div>

      <div className="space-y-4 mt-4">
        {members.map(member => {
          const progress = calculateProgress(member.stats);
          return (
            <div key={member.nick} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{member.nick}</span>
                <span className="text-gray-500">{Math.floor(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(progress)} transition-all duration-500`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
