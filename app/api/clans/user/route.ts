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
      return NextResponse.json({ error: "Clan não encontrado" }, { status: 404 })
    }

    return NextResponse.json(userClan)
  } catch (error) {
    console.error('Erro ao buscar clan do usuário:', error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
