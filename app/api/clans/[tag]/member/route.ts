import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Document, WithId } from 'mongodb'

interface Member {
  nick: string;
  discordId: string;
}

interface Clan extends WithId<Document> {
  tag: string;
  members: Member[];
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const { nick, discordId } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const currentClan = await db.collection('clans').findOne({ tag: params.tag })
    if (!currentClan) {
      return NextResponse.json(
        { error: 'Clan não encontrado' },
        { status: 404 }
      )
    }

    const updatedMembers = [...currentClan.members, { nick, discordId }]

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $set: { members: updatedMembers } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Não foi possível adicionar o membro' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Membro adicionado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao adicionar membro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const { discordId } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const currentClan = await db.collection('clans').findOne({ tag: params.tag })
    if (!currentClan) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    const updatedMembers = currentClan.members.filter(
      (member: Member) => member.discordId !== discordId
    )

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $set: { members: updatedMembers } }
    )

    console.log('Debug - Remoção:', {
      originalMembers: currentClan.members.length,
      updatedMembers: updatedMembers.length,
      discordId,
      success: result.modifiedCount > 0
    })

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Não foi possível remover o membro' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Membro removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao remover membro:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
