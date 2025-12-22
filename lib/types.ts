// Raw API response types (what we get from CoC API)
export interface CoCWarResponse {
  state: 'notInWar' | 'preparation' | 'inWar' | 'warEnded';
  teamSize: number;
  preparationStartTime: string; // ISO timestamp
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  clan: CoCWarClan;
  opponent: CoCWarClan;
  attacksPerMember?: number;
}

export interface CoCWarClan {
  tag: string;
  name: string;
  badgeUrls: { small: string; medium: string; large: string };
  clanLevel: number;
  attacks?: number;
  stars: number;
  destructionPercentage: number;
  members: CoCWarMember[];
}

export interface CoCWarMember {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacks?: CoCAttack[];
  bestOpponentAttack?: CoCAttack;
}

export interface CoCAttack {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order: number;
}

// Our normalized schema (what we store)
export interface War {
  id: string; // UUID or timestamp-based unique identifier
  clanTag: string;
  clanName: string;
  opponentTag: string;
  opponentName: string;
  teamSize: number;
  state: string;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  collectedAt: string; // When we fetched this data
  clanStats: WarClanStats;
  opponentStats: WarClanStats;
  members: WarMember[]; // All members from both clans
  attacks: WarAttack[]; // Flattened attacks from both sides
}

export interface WarClanStats {
  totalAttacks: number;
  totalStars: number;
  destructionPercentage: number;
  attacksUsed: number; // Actual attacks made
  attacksAvailable: number; // teamSize * attacksPerMember
}

export interface WarMember {
  tag: string;
  name: string;
  townhallLevel: number;
  mapPosition: number;
  attacksUsed: number; // 0, 1, or 2
  isOurClan: boolean;
}

export interface WarAttack {
  warId: string;
  attackerTag: string;
  attackerName: string;
  defenderTag: string;
  defenderName: string;
  stars: number;
  destructionPercentage: number;
  order: number;
  isOurClan: boolean; // true if attacker is from our clan
}

// LocalStorage/File structure
export interface WarStorageData {
  version: number; // Schema version for migrations
  lastUpdated: string;
  wars: War[];
}

// Chart data types
export interface AttacksPerWarDataPoint {
  warId: string;
  warEndTime: string;
  opponentName: string;
  attacksUsed: number;
  attacksAvailable: number;
  usageRate: number; // Percentage
}

export interface StarsPerAttackDataPoint {
  warId: string;
  warEndTime: string;
  opponentName: string;
  averageStars: number;
  totalAttacks: number;
}

export interface MemberAttacksDataPoint {
  memberName: string;
  attacksUsed: number; // 0, 1, or 2
  townhallLevel: number;
  mapPosition: number;
}

// Filter state
export interface FilterState {
  selectedWars: string[];
  sortBy: 'date' | 'attacks' | 'stars';
  sortOrder: 'asc' | 'desc';
  dateRange: [Date | null, Date | null];
  searchQuery: string;
}
