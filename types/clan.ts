export interface MemberStats {
  wins: number
  final_kills: number
  xp: number
  monthly_wins: number
  monthly_kills: number
  monthly_xp: number
}

export interface ClanMember {
  nick: string
  discordId: string
  stats: MemberStats
}

export interface Clan {
  tag: string
  name: string
  tag_color: string
  owner_id: string
  members: ClanMember[]
  isOwner?: boolean
}

export interface ClanStats {
  totalWins: number;
  totalKills: number;
  totalXP: number;
  monthlyWins: number;
  monthlyKills: number;
  monthlyXP: number;
}

export interface TopClan {
  _id: string;
  tag: string;
  name: string;
  tag_color: string;
  logo_url: string;
  stats: ClanStats;
  position?: number;
  totalScore: number;
}
