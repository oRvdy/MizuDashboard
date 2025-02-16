'use client'

import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ClanCard from '@/components/ClanCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [userClan, setUserClan] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserClan = async () => {
      try {
        const response = await fetch('/api/clans/user')
        const data = await response.json()
        setUserClan(data)
      } catch (error) {
        console.error('Erro ao buscar clan:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchUserClan()
    }
  }, [session])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8 text-gradient">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userClan ? (
            <>
              <ClanCard
                clan={userClan}
                onManage={() => router.push('/dashboard/manage')}
                color="purple"
              />
              <ClanCard
                type="members"
                clan={userClan}
                onManage={() => router.push('/dashboard/goals')}
                color="blue"
              />
              <ClanCard
                type="stats"
                clan={userClan}
                onManage={() => router.push('/dashboard/statistics')}
                color="green"
              />
            </>
          ) : (
            <div className="col-span-3 text-center">
              <p className="text-gray-400 mb-4">Você não possui um clan</p>
              <button
                onClick={() => router.push('/dashboard/create-clan')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Criar Clan
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
