import { WarClanStats, WarMember, WarAttack, CoCWarClan, CoCWarMember, CoCAttack } from './types';

// Raw API response types from Clash of Clans API

/**
 * Response from /clans/{clanTag}/currentwar/leaguegroup endpoint
 */
export interface CoCLeagueGroupResponse {
  state: 'notInWar' | 'preparation' | 'inWar' | 'ended';
  season: string; // Format: "2026-01"
  clans: CoCLeagueClan[];
  rounds: CoCLeagueRound[];
}

export interface CoCLeagueClan {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: {
    small: string;
    medium: string;
    large: string;
  };
  members: CoCLeagueMember[];
}

export interface CoCLeagueMember {
  tag: string;
  name: string;
  townHallLevel: number;
}

export interface CoCLeagueRound {
  warTags: string[]; // Array of war tags, e.g., ["#8LPJLVQY2", "#0", ...]
}

/**
 * Response from /clanwarleagues/wars/{warTag} endpoint
 * Note: Uses same structure as regular war but accessed via different endpoint
 */
export interface CoCLeagueWarResponse {
  state: 'preparation' | 'inWar' | 'warEnded';
  teamSize: number;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  clan: CoCWarClan;
  opponent: CoCWarClan;
  attacksPerMember?: number;
  warTag?: string; // CWL wars have war tags
}

// Normalized storage schema

/**
 * Represents a complete CWL season with all wars for our clan
 */
export interface LeagueWarGroup {
  season: string; // "2026-01"
  state: string; // Current state of the league
  collectedAt: string; // ISO timestamp
  participatingClans: LeagueClanInfo[]; // All clans in the group
  wars: LeagueWar[]; // All wars our clan participated in this season
}

export interface LeagueClanInfo {
  tag: string;
  name: string;
  clanLevel: number;
}

/**
 * Individual league war - extends regular war structure with season and round info
 */
export interface LeagueWar {
  id: string; // War tag from API (e.g., "#8LPJLVQY2")
  season: string; // "2026-01"
  roundNumber: number; // 1-7
  clanTag: string;
  clanName: string;
  opponentTag: string;
  opponentName: string;
  teamSize: number;
  state: string;
  preparationStartTime: string;
  startTime: string;
  endTime: string;
  collectedAt: string;
  clanStats: WarClanStats; // Reuse from lib/types.ts
  opponentStats: WarClanStats;
  members: WarMember[]; // Reuse from lib/types.ts
  attacks: WarAttack[]; // Reuse from lib/types.ts
}

/**
 * Storage file structure for league wars
 */
export interface LeagueWarStorageData {
  version: number;
  lastUpdated: string;
  seasons: LeagueWarGroup[]; // Wars grouped by season
}
