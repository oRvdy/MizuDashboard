'use client'

import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDiscord, FaCrown, FaSpotify, FaEdit } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface ProfileProps {
  params: { username: string }
}

export default function ProfilePage({ params }: ProfileProps) {
  const { data: session } = useSession()
  const [isPlaying, setIsPlaying] = useState(false)
  const username = decodeURIComponent(params.username)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${username}`)
      if (!res.ok) throw new Error('Perfil não encontrado')
      return res.json()
    }
  })

  const { data: mushData } = useQuery({
    queryKey: ['mush', username],
    queryFn: async () => {
      const res = await fetch(`https://mush.com.br/api/player/${username}`)
      if (!res.ok) throw new Error('Jogador não encontrado')
      return res.json()
    }
  })

  useEffect(() => {
    if (profile?.isPremium && profile?.musicUrl) {
      const audio = new Audio(profile.musicUrl)
      if (isPlaying) {
        audio.play()
      }
      return () => {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }, [isPlaying, profile?.musicUrl])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
          <Image
            src={profile?.bannerUrl || '/default-banner.jpg'}
            fill
            className="object-cover"
            alt="Banner"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative -mt-16 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
        >
          <div className="flex items-end gap-6 mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <Image
                src={profile?.avatar || mushData?.response?.avatar_url || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                width={140}
                height={140}
                className="rounded-full border-4 border-purple-500 shadow-xl"
                alt={username}
              />
              {profile?.isPremium && (
                <div className="absolute -top-2 -right-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <FaCrown className="text-3xl text-yellow-500 drop-shadow-glow" />
                  </motion.div>
                </div>
              )}
            </motion.div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">{username}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#5865F2]/20 px-3 py-1 rounded-full">
                  <FaDiscord className="text-[#5865F2]" />
                  <span className="text-white/90">{profile?.discord?.tag}</span>
                </div>
                
                {mushData?.response?.badges?.map((badge: any) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${badge.color}20`,
                      color: badge.color,
                      border: `1px solid ${badge.color}40`
                    }}
                  >
                    {badge.name}
                  </motion.div>
                ))}
              </div>
            </div>

            {session?.user?.id === profile?.discord?.id && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  href="/profile/edit"
                  className="bg-purple-600/80 hover:bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 backdrop-blur-sm"
                >
                  <FaEdit />
                  Personalizar Perfil
                </Link>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedStatCard
              title="Vitórias"
              value={mushData?.response?.stats?.bedwars?.wins || 0}
              icon="🏆"
              color="from-yellow-500/20 to-orange-500/20"
            />
            <AnimatedStatCard
              title="Abates Finais"
              value={mushData?.response?.stats?.bedwars?.final_kills || 0}
              icon="⚔️"
              color="from-red-500/20 to-pink-500/20"
            />
            <AnimatedStatCard
              title="XP Total"
              value={mushData?.response?.stats?.bedwars?.xp || 0}
              icon="✨"
              color="from-blue-500/20 to-purple-500/20"
            />
          </div>

          {profile?.isPremium && profile?.musicUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaSpotify className="text-2xl text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Música do Perfil</p>
                    <p className="text-white">{profile.musicName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isPlaying ? 'bg-green-500' : 'bg-white'
                  }`}
                >
                  {isPlaying ? 'II' : '▶'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function AnimatedStatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl border border-white/10 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-lg font-medium text-white/90">{title}</h3>
      </div>
      <motion.p
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-bold text-white"
      >
        {value.toLocaleString()}
      </motion.p>
    </motion.div>
  )
}
