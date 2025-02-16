export interface ClanData {
  clan: {
    owner_id: string;
    members: string[];
  };
}

export interface ClansData {
  [key: string]: ClanData;
}
