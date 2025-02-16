import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db('mizu')

    const profile = await db.collection('profiles').findOne({
      username: params.username
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    await db.collection('profiles').updateOne(
      { username: params.username },
      { $inc: { 'stats.views': 1 } }
    )

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
