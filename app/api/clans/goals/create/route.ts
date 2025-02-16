import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { v4 as uuidv4 } from 'uuid'

declare module 'uuid';

interface ClanData {
  clan: {
    owner_id: string;
  };
}

interface ClansData {
  [key: string]: ClanData;
}

interface Goal {
  id: string;
  clanTag: string;
  type: string;
  target: number;
  deadline: string;
  description: string;
  current: number;
  createdAt: string;
}

interface GoalsData {
  goals: Goal[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { type, target, deadline, description } = await request.json()
    
    const clansPath = path.join(process.cwd(), '..', 'data', 'clans.json')
    const clansData = JSON.parse(await fs.readFile(clansPath, 'utf8')) as ClansData
    
    const userClan = Object.entries(clansData).find(([_, clanData]) => 
      clanData.clan?.owner_id === session.user.id
    )

    if (!userClan) {
      return NextResponse.json({ error: "Você não é dono de nenhum clan" }, { status: 403 })
    }

    const [clanTag, clanData] = userClan

    const goalsPath = path.join(process.cwd(), '..', 'data', 'clan_goals.json')
    let goalsData: GoalsData = { goals: [] }
    try {
      const fileContent = await fs.readFile(goalsPath, 'utf8')
      goalsData = JSON.parse(fileContent) as GoalsData
    } catch {
      await fs.writeFile(goalsPath, JSON.stringify({ goals: [] }))
    }

    const newGoal: Goal = {
      id: uuidv4(),
      clanTag,
      type,
      target: Number(target),
      deadline,
      description,
      current: 0,
      createdAt: new Date().toISOString()
    }

    goalsData.goals.push(newGoal)
    await fs.writeFile(goalsPath, JSON.stringify(goalsData, null, 2))

    return NextResponse.json(newGoal)
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
