import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import { ClanData, ClansData } from '@/types/clans'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { nick } = await request.json()
    if (!nick) {
      return NextResponse.json({ error: "Nick não fornecido" }, { status: 400 })
    }

    const clansPath = path.join(process.cwd(), '..', 'data', 'clans.json')
    const rawData = await fs.readFile(clansPath, 'utf8')
    const data = JSON.parse(rawData) as { [key: string]: ClanData }

    const userClan = Object.entries(data).find(([_, clanData]: [string, ClanData]) => 
      clanData.clan?.owner_id === session.user.id
    )?.[1]

    if (!userClan) {
      return NextResponse.json({ error: "Você não é dono de nenhum clan" }, { status: 403 })
    }

    const memberIndex = userClan.clan.members.indexOf(nick)
    if (memberIndex === -1) {
      return NextResponse.json({ error: "Membro não encontrado no clan" }, { status: 404 })
    }

    userClan.clan.members.splice(memberIndex, 1)
    await fs.writeFile(clansPath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao remover membro:', error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}