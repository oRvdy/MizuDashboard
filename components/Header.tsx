'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { FaDiscord } from 'react-icons/fa'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              width={40}
              height={40}
              alt="Mizu Logo"
              className="rounded-full border-2 border-purple-500/50"
            />
            <span className="text-xl font-bold text-white">Mizu</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Início
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <a 
              href="https://discord.gg/bQuEWMfUPN" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Suporte
            </a>
          </nav>

          <div>
            {session ? (
              <div className="flex items-center gap-4">
                <Image
                  src={session.user?.image || '/default-avatar.png'}
                  width={32}
                  height={32}
                  alt={session.user?.name || 'User'}
                  className="rounded-full"
                />
                <button
                  onClick={() => signOut({ 
                    redirect: true,
                    callbackUrl: '/'
                  })}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('discord')}
                className="bg-[#5865F2] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#4752C4] transition-all duration-200"
              >
                <FaDiscord />
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
