import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import clientPromise from '@/lib/mongodb'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    if ((data.musicUrl || data.musicName) && !data.isPremium) {
      return NextResponse.json(
        { error: 'Recurso disponível apenas para usuários premium' },
        { status: 403 }
      )
    }

    const result = await db.collection('profiles').updateOne(
      { userId: session.user.id },
      {
        $set: {
          ...data,
          'stats.lastUpdated': new Date()
        }
      },
      { upsert: true }
    )

    if (result.matchedCount === 0 && !result.upsertedId) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
