'use client'

import { useSession, signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { FaCrown, FaUsers, FaChartLine, FaDiscord } from 'react-icons/fa'

export default function LandingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  // Função simplificada de login
  const handleLogin = () => {
    signIn('discord', { 
      callbackUrl: '/dashboard',
      redirect: true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="fixed w-full top-0 bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Mizu Logo"
              className="rounded-full"
            />
            <span className="text-xl font-bold text-white">MizuBot</span>
          </div>
          {session ? (
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752C4] transition-all flex items-center gap-2"
            >
              <FaDiscord />
              Entrar com Discord
            </button>
          )}
        </div>
      </header>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Image
            src="/logo.png"
            width={180}
            height={180}
            alt="Mizu Logo"
            className="mx-auto mb-8 rounded-full border-4 border-purple-500/50"
            priority
          />
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Mizu Bot
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Gerencie seu clan do Mushmc com facilidade. Acompanhe estatísticas, defina metas e muito mais.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Recursos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FaCrown className="text-4xl text-yellow-500" />}
              title="Gerenciamento de Clan"
              description="Adicione membros, defina cargos e mantenha seu clan organizado."
            />
            <FeatureCard
              icon={<FaUsers className="text-4xl text-blue-500" />}
              title="Sistema de Metas"
              description="Crie metas para seu clan e acompanhe o progresso de cada membro."
            />
            <FeatureCard
              icon={<FaChartLine className="text-4xl text-green-500" />}
              title="Estatísticas Detalhadas"
              description="Acompanhe o desempenho do seu clan com estatísticas em tempo real."
            />
          </div>
        </div>
      </section>

      <footer className="bg-gray-900/80 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
          <p>© 2024 Mizu. Desenvolvido por Rezando</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
      </div>
    </div>
  )
}