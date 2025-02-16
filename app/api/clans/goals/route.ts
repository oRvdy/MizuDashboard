import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag é obrigatória' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('mizu')

    const clan = await db.collection('clans').findOne(
      { tag },
      { projection: { goals: 1 } }
    )

    return NextResponse.json(clan?.goals || [])
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { tag, goal } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    // Buscar clan atual
    const clan = await db.collection('clans').findOne({ tag })
    if (!clan) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    // Adicionar meta com ID único
    const newGoal = {
      _id: new ObjectId(),
      ...goal,
      progress: 0,
      completed: false,
      created_at: new Date()
    }

    const result = await db.collection('clans').updateOne(
      { tag },
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

export async function DELETE(request: Request) {
  try {
    const { tag, goalId } = await request.json()
    const client = await clientPromise
    const db = client.db('mizu')

    // Buscar clan atual
    const clan = await db.collection('clans').findOne({ tag })
    if (!clan) {
      return NextResponse.json({ error: 'Clan não encontrado' }, { status: 404 })
    }

    // Remover meta específica
    const updatedGoals = clan.goals.filter((g: any) => 
      g._id.toString() !== goalId.toString()
    )

    const result = await db.collection('clans').updateOne(
      { tag },
      { $set: { goals: updatedGoals } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Meta não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover meta:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
