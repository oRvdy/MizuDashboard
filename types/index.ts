interface ClanMember {
  id: string;
  nick: string;
  discordId?: string;
  stats: {
    wins: number;
    final_kills: number;
    xp: number;
    monthly_wins: number;
    monthly_kills: number;
    monthly_xp: number;
  };
}

interface Clan {
  tag: string;
  name: string;
  owner: string;
  members: ClanMember[];
  isOwner?: boolean;
  tag_color: string; 

interface ClanGoal {
  id: string;
  type: 'wins' | 'kills' | 'xp';
  target: number;
  deadline: string;
  description: string;
  createdAt: string;
  progress?: number;
}

export type { ClanMember, Clan, ClanGoal };
