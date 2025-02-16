'use client'

import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="p-8 bg-gray-800 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Erro de Autenticação</h1>
        <p className="text-gray-300 mb-8">
          Ocorreu um erro durante o login. Por favor, tente novamente.
        </p>
        <Link
          href="/auth/signin"
          className="bg-[#5865F2] text-white px-8 py-3 rounded-md hover:bg-[#4752C4] transition-colors"
        >
          Voltar ao Login
        </Link>
      </div>
    </div>
  )
}
