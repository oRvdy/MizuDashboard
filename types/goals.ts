
export interface Goal {
  id: string;
  clanTag: string;
  type: string;
  target: number;
  deadline: string;
  description: string;
  current: number;
  createdAt: string;
}

export interface GoalsData {
  goals: Goal[];
}