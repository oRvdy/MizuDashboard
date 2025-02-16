'use client'

import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { FaCrown } from 'react-icons/fa'
import { useClan } from '@/hooks/useClan'

export default function UserProfile() {
  const { data: session } = useSession()
  const { clan, isOwner } = useClan()

  if (!session?.user) return null

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {session.user.image && (
          <div className="relative">
            <Image
              src={session.user.image}
              width={40}
              height={40}
              className="rounded-full border-2 border-purple-500"
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
          </div>
        )}
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <p className="text-white font-medium">{session.user.name}</p>
            {isOwner && <FaCrown className="text-yellow-500 text-sm" />}
          </div>
          {clan && (
            <p className="text-sm text-gray-400">
              Clan: <span style={{ color: clan.tag_color }}>[{clan.tag}]</span>
            </p>
          )}
        </div>
      </div>
      <button
        onClick={() => signOut()}
        className="bg-red-500 bg-opacity-20 text-red-500 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200"
      >
        Sair
      </button>
    </div>
  )
}
