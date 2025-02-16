'use client'

import { signIn } from 'next-auth/react'

export default function SignIn() {
  const handleSignIn = async () => {
    try {
      await signIn('discord', {
        callbackUrl: '/dashboard'
      })
    } catch (error) {
      console.error('Erro no login:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleSignIn}
        className="px-4 py-2 bg-[#5865F2] text-white rounded"
      >
        Login com Discord
      </button>
    </div>
  )
}
