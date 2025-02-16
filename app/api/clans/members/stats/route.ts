export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import path from "path"
import fs from "fs/promises"
import axios from "axios"
import { ClanData } from '@/types/clans'
import { Goal } from '@/types/goals'

interface Progress {
  [key: string]: number;
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const clansPath = path.join(process.cwd(), '..', 'data', 'clans.json')
    const goalsPath = path.join(process.cwd(), '..', 'data', 'clan_goals.json')
    
    const clansData = JSON.parse(await fs.readFile(clansPath, 'utf8')) as { [key: string]: ClanData }
    const goalsData = JSON.parse(await fs.readFile(goalsPath, 'utf8'))

    const userClan = Object.entries(clansData).find(([_, clanData]: [string, ClanData]) => 
      clanData.clan?.owner_id === session.user.id
    )?.[1]

    if (!userClan) {
      return NextResponse.json({ error: "Você não é dono de nenhum clan" }, { status: 403 })
    }

    const getMemberStats = async (nick: string, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await axios.get(`https://mush.com.br/api/player/${nick}`, {
            timeout: 5000,
            headers: {
              'Accept': 'application/json'
            }
          })

          if (response.data?.response?.stats?.bedwars) {
            const bedwars = response.data.response.stats.bedwars
            return {
              nick,
              stats: {
                current: {
                  wins: bedwars.wins || 0,
                  final_kills: bedwars.final_kills || 0,
                  xp: bedwars.xp || 0
                },
                progress: {
                  wins: bedwars.wins_monthly || 0,
                  final_kills: bedwars.final_kills_monthly || 0,
                  xp: bedwars.xp_monthly || 0
                }
              }
            }
          }
        } catch (error) {
          console.error(`Tentativa ${i + 1} falhou para ${nick}:`, error)
          if (i === retries - 1) {
            return {
              nick,
              stats: {
                current: { wins: 0, final_kills: 0, xp: 0 },
                progress: { wins: 0, final_kills: 0, xp: 0 }
              }
            }
          }
          await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1s entre tentativas
        }
      }
    }

    const getMemberProgress = async (nick: string, goals: Goal[]) => {
      try {
        const response = await axios.get(`https://mush.com.br/api/player/${nick}`)
        const playerData = response.data.response
        
        if (!playerData?.stats?.bedwars) return null
  
        const bedwars = playerData.stats.bedwars
        const progress: Progress = {}
  
        goals.forEach(goal => {
          const createdAt = new Date(goal.createdAt)
          const now = new Date()
          const daysSinceCreation = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
          )
  
          let currentProgress = 0
          const type = goal.type === 'kills' ? 'final_kills' : goal.type
  
          if (daysSinceCreation <= 7) {
            currentProgress = bedwars[`${type}_weekly`] || 0
          } else if (daysSinceCreation <= 30) {
            currentProgress = bedwars[`${type}_monthly`] || 0
          }
  
          progress[type] = currentProgress
        })
  
        return {
          nick,
          stats: {
            current: {
              wins: bedwars.wins || 0,
              final_kills: bedwars.final_kills || 0,
              xp: bedwars.xp || 0
            },
            progress
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar stats de ${nick}:`, error)
        return null
      }
    }

    const membersStats = await Promise.all(
      userClan.clan.members.map(nick => getMemberStats(nick))
    )

    const validStats = membersStats
      .filter((stats): stats is NonNullable<typeof stats> => stats !== null && stats !== undefined)
      .map(stats => ({
        nick: stats.nick,
        stats: {
          current: stats?.stats?.current || { wins: 0, final_kills: 0, xp: 0 },
          progress: stats?.stats?.progress || { wins: 0, final_kills: 0, xp: 0 }
        }
      }))

    return NextResponse.json(validStats)
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
