import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    console.log('Buscando metas para o clan:', params.tag)
    
    const client = await clientPromise
    const db = client.db('mizu')

    const clan = await db.collection('clans').findOne(
      { tag: params.tag },
      { projection: { goals: 1, name: 1, tag: 1, owner_id: 1 } }
    )

    console.log('Clan encontrado:', clan)

    if (!clan) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      goals: clan.goals || [],
      clanInfo: {
        name: clan.name,
        tag: clan.tag,
        owner_id: clan.owner_id
      }
    })
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const mushResponse = await fetch(`https://mush.com.br/api/player/${data.memberNick}`)
    const mushData = await mushResponse.json()

    if (!mushData.success) {
      return NextResponse.json(
        { error: 'Falha ao buscar dados do jogador' },
        { status: 400 }
      )
    }

    let initialValue = 0
    if (data.type === 'wins') {
      initialValue = mushData.response.stats.bedwars.wins
    } else if (data.type === 'final_kills') {
      initialValue = mushData.response.stats.bedwars.final_kills
    } else if (data.type === 'xp') {
      initialValue = mushData.response.stats.bedwars.xp
    }

    const newGoal = {
      _id: new ObjectId(),
      ...data,
      progress: 0,
      completed: false,
      created_at: new Date(),
      initial_stats: {
        [data.type]: initialValue
      }
    }

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $push: { goals: newGoal } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Falha ao criar meta' }, { status: 400 })
    }

    return NextResponse.json({ success: true, goal: newGoal })
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const { goalId } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    const clan = await db.collection('clans').findOne({ tag: params.tag })
    if (!clan) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    const updatedGoals = (clan.goals || []).filter((g: any) => 
      g._id.toString() !== goalId
    )

    const result = await db.collection('clans').updateOne(
      { tag: params.tag },
      { $set: { goals: updatedGoals } }
    )

    console.log('Debug remoção:', { goalId, resultado: result })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover meta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
