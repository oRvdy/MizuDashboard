import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log('Buscando clan para userId:', userId)

    const client = await clientPromise
    const db = client.db('mizu')

    const collections = await db.listCollections().toArray()
    console.log('Collections disponíveis:', collections.map(c => c.name))

    const allClans = await db.collection('clans').find().toArray()
    console.log('Total de clans encontrados:', allClans.length)
    console.log('Primeiro clan encontrado:', allClans[0])

    const clan = await db.collection('clans').findOne({
      $or: [
        { owner_id: userId },
        { "members": {
            $elemMatch: {
              "discordId": userId
            }
          }
        }
      ]
    })

    if (!clan) {
      console.log('Clan não encontrado para', {
        userId,
        totalClans: allClans.length,
        membersDosPrimeiroClan: allClans[0]?.members
      })
      return NextResponse.json(null)
    }

    return NextResponse.json({
      ...clan,
      isOwner: clan.owner_id === userId
    })

  } catch (error) {
    console.error('Erro detalhado:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
