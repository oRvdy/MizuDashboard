'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaSpotify, FaUpload } from 'react-icons/fa'
import DashboardLayout from '@/components/layouts/DashboardLayout'

export default function EditProfilePage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [musicUrl, setMusicUrl] = useState('')
  const [musicName, setMusicName] = useState('')
  const [bio, setBio] = useState('')

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${session?.user?.id}`)
      if (!res.ok) throw new Error('Erro ao carregar perfil')
      return res.json()
    },
    enabled: !!session?.user?.id,
    onSuccess: (data) => {
      setMusicUrl(data?.musicUrl || '')
      setMusicName(data?.musicName || '')
      setBio(data?.bio || '')
    }
  })

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Erro ao atualizar perfil')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: () => {
      toast.error('Erro ao atualizar perfil')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({
      musicUrl,
      musicName,
      bio
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gradient">Editar Perfil</h1>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {profile?.isPremium && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-purple-500/10 p-6 rounded-xl border border-yellow-500/20">
                <h2 className="text-xl font-bold text-yellow-500 mb-4">
                  Configurações Premium
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL da Música
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={musicUrl}
                        onChange={(e) => setMusicUrl(e.target.value)}
                        className="flex-1 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        placeholder="URL do arquivo de áudio"
                      />
                      <button
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg"
                      >
                        <FaSpotify className="text-xl" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome da Música
                    </label>
                    <input
                      type="text"
                      value={musicName}
                      onChange={(e) => setMusicName(e.target.value)}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      placeholder="Nome da música"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Informações Gerais
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Biografia
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-white h-32"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banner do Perfil
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center">
                      <FaUpload className="text-3xl text-gray-500 mb-2" />
                      <p className="text-gray-400">
                        Arraste uma imagem ou clique para upload
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
