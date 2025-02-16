'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import Swal from 'sweetalert2'
import { IoArrowBack, IoPersonAdd } from 'react-icons/io5'
import Link from 'next/link'

export default function ManagePage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data: clan, isLoading, error } = useQuery({
    queryKey: ['clan', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('Sem userId')
        return null
      }
      
      console.log('Fazendo request para:', `/api/clans?userId=${session.user.id}`)
      const res = await fetch(`/api/clans?userId=${session.user.id}`)
      console.log('Status da resposta:', res.status)
      
      const data = await res.json()
      console.log('Dados recebidos:', data)
      
      if (!data) {
        console.log('Nenhum dado recebido')
        return null
      }

      return data
    },
    retry: 2,
    retryDelay: (retryCount: number) => Math.min(1000 * Math.pow(2, retryCount), 30000)
  })

  if (isLoading) {
    console.log('Carregando dados do clan...');
    return <LoadingSpinner />
  }

  if (error || !clan) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-500/10 p-6 rounded-lg border border-red-500 text-center max-w-md">
            <h2 className="text-xl font-bold text-red-500 mb-2">Acesso Negado</h2>
            <p className="text-gray-400 mb-4">
              Você não está registrado em nenhum clan. 
              Entre em contato com o dono de um clan para ser adicionado.
            </p>
            <div className="text-center">
              <p className="text-sm text-gray-500/80 font-mono">
                {session?.user?.id}
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const handleRemoveMember = async (discordId: string) => {
    try {
      const result = await Swal.fire({
        title: 'Remover Membro',
        text: 'Tem certeza que deseja remover este membro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar',
        background: '#1f2937',
        color: '#ffffff'
      });

      if (result.isConfirmed && clan) {
        const response = await fetch(`/api/clans/${clan.tag}/member`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ discordId })
        });

        if (!response.ok) {
          throw new Error('Falha ao remover membro');
        }

        toast.success('Membro removido com sucesso!');
        await queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] });
      }
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast.error('Erro ao remover membro');
    }
  };

  const handleAddMember = async () => {
    const { value: memberInfo } = await Swal.fire({
      title: 'Adicionar Membro',
      html: `
        <input id="nick" class="swal2-input bg-gray-800 text-white" placeholder="Nick do Minecraft">
        <input id="discordId" class="swal2-input bg-gray-800 text-white" placeholder="ID do Discord">
      `,
      background: '#1f2937',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonText: 'Adicionar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nick = (document.getElementById('nick') as HTMLInputElement).value
        const discordId = (document.getElementById('discordId') as HTMLInputElement).value
        if (!nick || !discordId) {
          Swal.showValidationMessage('Por favor preencha todos os campos')
        }
        return { nick, discordId }
      }
    })

    if (memberInfo) {
      try {
        const response = await fetch(`/api/clans/${clan.tag}/member`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memberInfo)
        })

        if (!response.ok) throw new Error('Falha ao adicionar membro')
        
        toast.success('Membro adicionado com sucesso!')
        await queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] })
      } catch (error) {
        console.error('Erro ao adicionar membro:', error)
        toast.error('Erro ao adicionar membro')
      }
    }
  }

  const handleUpdateLogo = async () => {
    const { value: logoUrl } = await Swal.fire({
      title: 'Atualizar Logo do Clan',
      html: `
        <input 
          id="logoUrl" 
          class="swal2-input bg-gray-800 text-white" 
          placeholder="URL da imagem"
          value="${clan.logo_url || ''}"
        >
        <p class="text-sm text-gray-400 mt-2">
          Cole o link de uma imagem (PNG/JPG)
        </p>
      `,
      background: '#1f2937',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonText: 'Atualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const url = (document.getElementById('logoUrl') as HTMLInputElement).value
        if (!url) {
          Swal.showValidationMessage('Por favor insira uma URL válida')
        }
        return url
      }
    })

    if (logoUrl) {
      try {
        const response = await fetch(`/api/clans/${clan.tag}/logo`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo_url: logoUrl })
        })

        if (!response.ok) throw new Error('Falha ao atualizar logo')
        
        toast.success('Logo atualizada com sucesso!')
        queryClient.invalidateQueries({ queryKey: ['clan', session?.user?.id] })
      } catch (error) {
        console.error('Erro ao atualizar logo:', error)
        toast.error('Erro ao atualizar logo')
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/90 
              bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 
              border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm
              transform hover:scale-105"
          >
            <IoArrowBack className="w-4 h-4" />
            Voltar para Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-gradient">Gerenciar Clan</h1>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                <span style={{ color: clan.tag_color }}>[{clan.tag}]</span>
              </h2>
              {clan.owner_id === session?.user?.id && (
                <button
                  onClick={handleUpdateLogo}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-purple-600/80 hover:bg-purple-500/80 rounded-lg transition-all duration-200"
                >
                  Atualizar Logo
                </button>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Membros</h3>
                {clan.owner_id === session?.user?.id && (
                  <button
                    onClick={handleAddMember}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white 
                      bg-blue-600/80 hover:bg-blue-500/80 rounded-lg transition-all duration-200"
                  >
                    <IoPersonAdd className="w-4 h-4" />
                    Adicionar Membro
                  </button>
                )}
              </div>
              <div className="grid gap-4">
                {clan.members.map((member: any) => (
                  <div 
                    key={member.discordId}
                    className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://mc-heads.net/avatar/${member.nick}/48`}
                        alt={`${member.nick}'s head`}
                        className="w-8 h-8 rounded"
                        onError={(e: any) => {
                          e.target.src = "https://mc-heads.net/avatar/steve/48"
                        }}
                      />
                      <div>
                        <p className="font-medium text-white">{member.nick}</p>
                        <p className="text-sm text-gray-400">Discord ID: {member.discordId}</p>
                      </div>
                    </div>
                    {clan.owner_id === session?.user?.id && (
                      <button
                        onClick={() => handleRemoveMember(member.discordId)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}