'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: ReactNode
  showBackButton?: boolean
}

export default function DashboardLayout({ children, showBackButton = false }: DashboardLayoutProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/',
      redirect: true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <nav className="fixed top-0 left-0 right-0 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo e Título */}
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                width={48}
                height={48}
                alt="Mizu Logo"
                className="rounded-full border-2 border-purple-500/50"
              />
              <h1 className="text-2xl font-bold text-white">Mizu Dashboard</h1>
            </div>

            {/* Menu do Usuário */}
            <div className="flex items-center gap-4">
              <Link
                href={`/profile/${session?.user?.name}`}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-all"
              >
                <img
                  src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-purple-500/30"
                />
                <div className="flex flex-col">
                  <span className="text-white font-medium">{session?.user?.name}</span>
                  <span className="text-xs text-gray-400">Ver perfil</span>
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 max-w-7xl mx-auto">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 fixed top-20 left-4"
          >
            ← Voltar
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
