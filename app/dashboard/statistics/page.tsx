'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import LoadingSpinner from '@/components/LoadingSpinner'
import { FaCrown, FaTrophy, FaMedal } from 'react-icons/fa'
import { IoArrowBack } from 'react-icons/io5'
import Link from 'next/link'
import type { TopClan } from '@/types/clan'
import { motion } from 'framer-motion'

export default function TopClansPage() {
  const { data: topClans, isLoading, refetch } = useQuery<TopClan[]>({
    queryKey: ['topClans'],
    queryFn: async () => {
      const res = await fetch('/api/clans/top')
      if (!res.ok) throw new Error('Falha ao carregar top clans')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <DashboardLayout>
      <div className="p-8">
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Top 10 Clans</h1>
            <p className="text-gray-400">Ranking dos melhores clans</p>
          </div>
          <button
            onClick={() => refetch()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            Atualizar
          </button>
        </div>

        <div className="space-y-4">
          {topClans && topClans.map((clan: TopClan, i: number) => (
            <motion.div
              key={clan._id.toString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 
                hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-400">#{clan.position}</span>
                    {i === 0 && <FaCrown className="text-2xl text-yellow-500" />}
                    {i === 1 && <FaMedal className="text-2xl text-gray-300" />}
                    {i === 2 && <FaMedal className="text-2xl text-orange-700" />}
                  </div>

                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-600">
                    <img
                      src={clan.logo_url}
                      alt={`${clan.tag} logo`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/default-clan.png'
                      }}
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      <span style={{ color: clan.tag_color }}>[{clan.tag}]</span>
                    </h2>
                    <p className="text-gray-400">Score: {clan.totalScore.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 text-center">
                  <div>
                    <p className="text-xl font-bold text-purple-500">
                      {clan.stats.totalKills.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">Abates</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-500">
                      {clan.stats.totalWins.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">Vitórias</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-500">
                      {clan.stats.totalXP.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">XP</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
