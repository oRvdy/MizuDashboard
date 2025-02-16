import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function PATCH(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const { logo_url } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $set: { logo_url } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar logo:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
