import { FaCrown, FaUsers, FaChartLine } from 'react-icons/fa'

type CardType = 'management' | 'members' | 'stats';
type ColorType = 'purple' | 'blue' | 'green';

interface CardConfigType {
  title: string;
  description: string;
  icon: React.ElementType;
  color: ColorType;
  buttonText: string;
}

interface ClanCardProps {
  type?: CardType;
  clan: any;
  onManage: () => void;
  color: ColorType;
}

export default function ClanCard({ type = 'management', clan, onManage, color }: ClanCardProps) {
  const cardConfig: Record<CardType, CardConfigType> = {
    management: {
      title: 'Gerenciar Clan',
      description: 'Configure seu clan e permissões',
      icon: FaCrown,
      color: 'purple',
      buttonText: 'Gerenciar'
    },
    members: {
      title: 'Metas',
      description: 'Acompanhe o progresso do clan',
      icon: FaUsers,
      color: 'blue',
      buttonText: 'Ver Metas'
    },
    stats: {
      title: 'Estatísticas',
      description: 'Visualize o desempenho do clan',
      icon: FaChartLine,
      color: 'green',
      buttonText: 'Visualizar'
    }
  }

  const config = cardConfig[type]

  const getButtonClasses = (color: ColorType) => {
    const classes: Record<ColorType, string> = {
      purple: 'bg-purple-600 hover:bg-purple-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      green: 'bg-green-600 hover:bg-green-700'
    }
    return `${classes[color]} text-white px-4 py-2 rounded-lg transition-all duration-200`
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700 hover:border-opacity-100 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-gray-400 mb-4">{config.description}</p>
          <button
            onClick={onManage}
            className={getButtonClasses(config.color)}
          >
            {config.buttonText}
          </button>
        </div>
        <div className={`bg-${config.color}-500/20 p-3 rounded-lg`}>
          <config.icon className={`text-${config.color}-500 text-2xl`} />
        </div>
      </div>
    </div>
  )
}
