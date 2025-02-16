import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { GoalsData, Goal } from '@/types/goals'

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { goalId } = await request.json()
    const goalsPath = path.join(process.cwd(), '..', 'data', 'clan_goals.json')
    
    const goalsData: GoalsData = JSON.parse(await fs.readFile(goalsPath, 'utf8'))
    goalsData.goals = goalsData.goals.filter((goal: Goal) => goal.id !== goalId)

    await fs.writeFile(goalsPath, JSON.stringify(goalsData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
