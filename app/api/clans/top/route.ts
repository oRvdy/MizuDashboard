import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

interface ProcessedClan {
  _id: ObjectId;
  tag: string;
  name: string;
  tag_color: string;
  logo_url: string;
  stats: {
    totalWins: number;
    totalKills: number;
    totalXP: number;
    monthlyWins: number;
    monthlyKills: number;
    monthlyXP: number;
  };
  totalScore: number;
  position?: number;
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('mizu')

    const clans = await db.collection('clans').find({}).toArray()

    const processedClans: ProcessedClan[] = await Promise.all(
      clans.map(async (clan) => {
        const membersStats = await Promise.all(
          (clan.members || []).map(async (member: any) => {
            try {
              const mushResponse = await fetch(`https://mush.com.br/api/player/${member.nick}`)
              const mushData = await mushResponse.json()
              
              if (!mushData.success) {
                console.error(`Erro ao buscar stats de ${member.nick}:`, mushData)
                return null
              }

              return mushData.response.stats.bedwars
            } catch (error) {
              console.error(`Erro ao buscar stats de ${member.nick}:`, error)
              return null
            }
          })
        )

        const stats = membersStats
          .filter(Boolean)
          .reduce((acc, memberStats) => ({
            totalWins: (acc.totalWins || 0) + (memberStats?.wins || 0),
            totalKills: (acc.totalKills || 0) + (memberStats?.final_kills || 0),
            totalXP: (acc.totalXP || 0) + (memberStats?.xp || 0),
            monthlyWins: (acc.monthlyWins || 0) + (memberStats?.wins_monthly || 0),
            monthlyKills: (acc.monthlyKills || 0) + (memberStats?.final_kills_monthly || 0),
            monthlyXP: (acc.monthlyXP || 0) + (memberStats?.xp_monthly || 0)
          }), {
            totalWins: 0,
            totalKills: 0,
            totalXP: 0,
            monthlyWins: 0,
            monthlyKills: 0,
            monthlyXP: 0
          })

        const totalScore = 
          stats.totalKills * 100 + 
          stats.totalWins * 50 + 
          Math.floor(stats.totalXP / 1000)

        return {
          _id: clan._id,
          tag: clan.tag,
          name: clan.name,
          tag_color: clan.tag_color,
          logo_url: clan.logo_url || '/images/default-clan.png',
          stats,
          totalScore
        }
      })
    )

    const topClans = processedClans
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10)
      .map((clan, index) => ({
        ...clan,
        position: index + 1
      }))

    return NextResponse.json(topClans)
  } catch (error) {
    console.error('Erro ao buscar top clans:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
