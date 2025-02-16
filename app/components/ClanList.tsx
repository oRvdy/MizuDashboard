'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface ClanMember {
  nick: string;
  discordId: string;
}

interface ClanStats {
  wins: number;
  kills: number;
  xp: number;
}

interface Clan {
  _id?: string;
  tag: string;
  name: string;
  tag_color: string;
  owner_id: string;
  members: ClanMember[];
  stats?: ClanStats;
}

export default function ClanList() {
  const { data: clans, isLoading, error } = useQuery<Clan[], Error>({
    queryKey: ['clans'],
    queryFn: () => api.clans.getAll()
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar clans: {error.message}</div>;
  if (!clans || clans.length === 0) return <div>Nenhum clan encontrado</div>;

  return (
    <div className="grid gap-4 p-4">
      {Array.isArray(clans) && clans.map((clan: Clan) => (
        <div 
          key={clan.tag} 
          className="border rounded p-4 shadow-sm"
          style={{ borderColor: clan.tag_color }}
        >
          <h3 className="text-lg font-bold">{clan.name}</h3>
          <p className="text-sm">Tag: {clan.tag}</p>
          <p className="text-sm">Membros: {clan.members.length}</p>
          {clan.stats && (
            <div className="mt-2 text-sm">
              <p>Wins: {clan.stats.wins}</p>
              <p>Kills: {clan.stats.kills}</p>
              <p>XP: {clan.stats.xp}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}