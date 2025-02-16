export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { ClanData } from '@/types/clans'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const clansPath = path.join(process.cwd(), '..', 'data', 'clans.json')
    const data = JSON.parse(await fs.readFile(clansPath, 'utf8')) as { [key: string]: ClanData }

    const userClan = Object.entries(data).find(([_, clanData]: [string, ClanData]) => 
      clanData.clan?.owner_id === session.user.id
    )?.[1]

    if (!userClan) {
      return NextResponse.json({ error: "Você não é dono de nenhum clan" }, { status: 403 })
    }

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Vitórias',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: 'rgb(147, 51, 234)',
          tension: 0.1
        },
        {
          label: 'Kills',
          data: [65, 59, 80, 81, 56, 55],
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        }
      ]
    }

    return NextResponse.json({
      totalWins: 1234,
      monthlyWins: 123,
      totalKills: 5678,
      monthlyKills: 567,
      totalXP: 98765,
      monthlyXP: 9876,
      chartData
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
