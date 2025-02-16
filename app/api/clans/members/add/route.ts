import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import axios from "axios"
import { ClanData, ClansData } from '@/types/clans'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { nick } = await request.json()
    if (!nick) {
      return NextResponse.json({ error: "Nick não fornecido" }, { status: 400 })
    }

    const playerResponse = await axios.get(`https://mush.com.br/api/player/${nick}`)
    if (!playerResponse.data.response) {
      return NextResponse.json({ error: "Jogador não encontrado" }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), '..', 'data', 'clans.json')
    const data: ClansData = JSON.parse(await fs.readFile(filePath, 'utf8'))

    const userClan = Object.values(data).find((clan: ClanData) => 
      clan.clan?.owner_id === session.user.id
    )

    if (!userClan) {
      return NextResponse.json({ error: "Você não é dono de nenhum clan" }, { status: 403 })
    }

    if (userClan.clan.members.includes(nick)) {
      return NextResponse.json({ error: "Jogador já está no clan" }, { status: 400 })
    }

    userClan.clan.members.push(nick)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao adicionar membro:', error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
