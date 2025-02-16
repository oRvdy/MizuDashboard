
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function DELETE(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const { type } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $pull: { goals: { type } } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Nenhuma meta encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}