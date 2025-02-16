export interface MushPlayerStats {
  bedwars: {
    wins: number
    final_kills: number
    xp: number
    wins_monthly: number
    final_kills_monthly: number
    xp_monthly: number
  }
}

export interface MushApiResponse {
  success: boolean
  error_code: number
  response: {
    stats: MushPlayerStats
  }
}
