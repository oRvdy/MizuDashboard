import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gerenciamento | Mizu Dashboard',
  description: 'Página de gerenciamento do Mizu Dashboard'
}

export default function ManagePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento</h1>
    </div>
  )
}