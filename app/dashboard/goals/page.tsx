'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { IoArrowBack } from 'react-icons/io5'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import Swal from 'sweetalert2'
import { useState, useEffect } from 'react'
import { MushApiResponse } from '@/types/mush'

interface Member {
  nick: string;
  discordId: string;
}

interface Goal {
  _id: string;
  type: 'wins' | 'final_kills' | 'xp';
  target: number;
  deadline: string;
  description: string;
  memberNick: string;
  progress: number;
  completed: boolean;
  created_at: string;
  initial_stats: {
    [key: string]: number;
  };
}

export default function GoalsPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: clan, isLoading } = useQuery({
    queryKey: ['clan', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const res = await fetch(`/api/clans?userId=${session.user?.id}`)
      if (!res.ok) return null
      return res.json()
    },
    enabled: !!session?.user?.id
  })

  const handleCreateGoal = async () => {
    if (!clan) return

    const memberOptions = clan.members
      .map((member: Member) => `<option value="${member.nick}">${member.nick}</option>`)
      .join('');

    const { value: memberSelection } = await Swal.fire({
      title: 'Selecionar Membro(s)',
      html: `
        <div class="space-y-4">
          <select id="memberNick" class="swal2-input bg-gray-800 text-white mb-2">
            ${memberOptions}
          </select>
          <div class="flex items-center gap-2 text-left">
            <input type="checkbox" id="allMembers" class="swal2-checkbox">
            <label for="allMembers" class="text-white">Aplicar para todos os membros</label>
          </div>
        </div>
      `,
      background: '#1f2937',
      color: '#ffffff',
      confirmButtonText: 'Próximo',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => ({
        memberNick: (document.getElementById('memberNick') as HTMLSelectElement).value,
        allMembers: (document.getElementById('allMembers') as HTMLInputElement).checked
      })
    })

    if (!memberSelection) return

    const { value: formValues } = await Swal.fire({
      title: memberSelection.allMembers ? 'Nova Meta para Todos' : `Nova Meta para ${memberSelection.memberNick}`,
      html: `
        <select id="type" class="swal2-input bg-gray-800 text-white">
          <option value="wins">Vitórias</option>
          <option value="final_kills">Kills Finais</option>
          <option value="xp">XP</option>
        </select>
        <input id="target" type="number" class="swal2-input bg-gray-800 text-white" placeholder="Meta">
        <input id="deadline" type="date" class="swal2-input bg-gray-800 text-white">
        <input id="description" class="swal2-input bg-gray-800 text-white" placeholder="Descrição">
      `,
      background: '#1f2937',
      color: '#ffffff',
      confirmButtonText: 'Criar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => ({
        type: (document.getElementById('type') as HTMLSelectElement).value,
        target: Number((document.getElementById('target') as HTMLInputElement).value),
        deadline: (document.getElementById('deadline') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value
      })
    })

    if (formValues) {
      try {
        const membersToProcess = memberSelection.allMembers 
          ? clan.members 
          : [{ nick: memberSelection.memberNick }];
        
        for (const member of membersToProcess) {
          if (!member.nick) continue;

          const response = await fetch(`/api/clans/${clan.tag}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formValues,
              memberNick: member.nick
            })
          });

          if (!response.ok) {
            console.error(`Erro ao criar meta para ${member.nick}`);
            continue;
          }
        }

        toast.success(memberSelection.allMembers 
          ? 'Metas criadas para todos os membros!' 
          : 'Meta criada com sucesso!'
        )
        
        queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] })
      } catch (error) {
        console.error('Erro ao criar meta(s):', error)
        toast.error('Erro ao criar meta(s)')
      }
    }
  }

  const calculateProgress = async (goal: Goal) => {
    try {
      const mushResponse = await fetch(`https://mush.com.br/api/player/${goal.memberNick}`)
      const mushData: MushApiResponse = await mushResponse.json()

      if (!mushData.success) return 0

      let currentValue = 0;
      const bedwarsStats = mushData.response?.stats?.bedwars;
      
      if (!bedwarsStats) return 0;

      switch (goal.type) {
        case 'wins':
          currentValue = Number(bedwarsStats.wins) || 0;
          break;
        case 'final_kills':
          currentValue = Number(bedwarsStats.final_kills) || 0;
          break;
        case 'xp':
          currentValue = Number(bedwarsStats.xp) || 0;
          break;
        default:
          currentValue = 0;
      }

      const initialValue = Number(goal.initial_stats[goal.type]) || 0;
      
      const progress = Math.max(0, currentValue - initialValue);
      
      return progress;
    } catch (error) {
      console.error('Erro ao calcular progresso:', error)
      return 0
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      notation: num > 999999 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Deletar Meta',
        text: 'Tem certeza que deseja deletar esta meta?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
      });

      if (result.isConfirmed && clan) {
        const response = await fetch(`/api/clans/${clan.tag}/goals/${goalId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ goalId })
        });

        if (!response.ok) throw new Error('Falha ao deletar meta');
        
        toast.success('Meta deletada com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] });
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      toast.error('Erro ao deletar meta');
    }
  };

  const handleDeleteCategoryGoals = async (type: string) => {
    try {
      const result = await Swal.fire({
        title: `Deletar Metas de ${type === 'wins' ? 'Vitórias' : type === 'final_kills' ? 'Abates' : 'XP'}`,
        text: 'Tem certeza que deseja deletar todas as metas desta categoria?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar todas',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
      });

      if (result.isConfirmed && clan) {
        const response = await fetch(`/api/clans/${clan.tag}/goals/categories`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        });

        if (!response.ok) throw new Error('Falha ao deletar metas');
        
        toast.success('Metas deletadas com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] });
      }
    } catch (error) {
      console.error('Erro ao deletar metas:', error);
      toast.error('Erro ao deletar metas');
    }
  };

  const handleDeleteAllGoals = async () => {
    try {
      const result = await Swal.fire({
        title: 'Deletar Todas as Metas',
        text: 'Tem certeza que deseja deletar todas as metas do clan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar todas',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
      });

      if (result.isConfirmed && clan) {
        const response = await fetch(`/api/clans/${clan.tag}/goals/all`, {
          method: 'DELETE'
        });

        if (!response.ok) throw new Error('Falha ao deletar metas');
        
        toast.success('Todas as metas foram deletadas!');
        queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] });
      }
    } catch (error) {
      console.error('Erro ao deletar metas:', error);
      toast.error('Erro ao deletar metas');
    }
  };

  const [progressValues, setProgressValues] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const updateAllProgress = async () => {
      const newProgressValues: {[key: string]: number} = {};
      
      if (clan?.goals) {
        for (const goal of clan.goals) {
          const progress = await calculateProgress(goal);
          newProgressValues[goal._id] = progress;
        }
        
        setProgressValues(newProgressValues);
      }
    };

    updateAllProgress();
    // Atualizar a cada 5 minutos
    const interval = setInterval(updateAllProgress, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clan?.goals]);

  if (isLoading) return <LoadingSpinner />

  if (!clan) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-500/10 p-6 rounded-lg border border-red-500 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-500 mb-2">Acesso Negado</h2>
            <p className="text-gray-400">Você não está registrado em nenhum clan.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const goals = clan?.goals || [];

  interface GoalGroups {
    wins: Goal[];
    final_kills: Goal[];
    xp: Goal[];
  }

  const groupedByType = (goals as Goal[]).reduce((acc: GoalGroups, goal: Goal) => {
    if (!acc[goal.type]) {
      acc[goal.type] = [];
    }
    acc[goal.type].push(goal);
    return acc;
  }, {
    wins: [],
    final_kills: [],
    xp: []
  } as GoalGroups);

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 
              bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <IoArrowBack className="w-4 h-4" />
            Voltar para Dashboard
          </Link>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Metas do Clan</h1>
            <p className="text-gray-400">
              <span style={{ color: clan.tag_color }}>[{clan.tag}]</span>
            </p>
          </div>
          {clan.owner_id === session?.user?.id && (
            <button
              onClick={handleCreateGoal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Nova Meta
            </button>
          )}
        </div>

        {clan.owner_id === session?.user?.id && goals.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleDeleteAllGoals}
              className="bg-red-600/80 hover:bg-red-700/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Deletar Todas as Metas
            </button>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedByType).map(([type, groupGoals]) => (
            <div key={type} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {type === 'wins' && '🏆 Metas de Vitórias'}
                  {type === 'final_kills' && '⚔️ Metas de Abates'}
                  {type === 'xp' && '✨ Metas de XP'}
                </h2>
                {clan.owner_id === session?.user?.id && groupGoals.length > 0 && (
                  <button
                    onClick={() => handleDeleteCategoryGoals(type)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Deletar Categoria
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(groupGoals as Goal[]).map((goal) => (
                  <div
                    key={goal._id}
                    className="bg-gray-700/50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-400">{goal.description}</p>
                      {clan.owner_id === session?.user?.id && (
                        <button
                          onClick={() => handleDeleteGoal(goal._id)}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          Deletar
                        </button>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      Membro: {goal.memberNick}
                    </p>

                    <div className="space-y-2">
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((progressValues[goal._id] || 0) / goal.target * 100).toFixed(2)}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {formatNumber(progressValues[goal._id] || 0)} / {formatNumber(goal.target)}
                        </span>
                        <span className="text-gray-400">
                          {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhuma meta definida ainda.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
