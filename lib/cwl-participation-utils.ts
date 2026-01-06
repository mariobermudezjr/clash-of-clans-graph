import { LeagueWar } from './league-types';

/**
 * Data for a single round of CWL for a player
 */
export interface PlayerRoundData {
  roundNumber: number;
  participated: boolean; // Was the player in the roster for this round
  attacked: boolean; // Did they use their attack
  stars: number | null; // 0-3 if attacked, null if not
  destructionPercentage: number | null;
}

/**
 * Complete CWL participation data for a single player across all rounds
 */
export interface PlayerParticipation {
  tag: string;
  name: string;
  rounds: PlayerRoundData[]; // Array of 7 rounds
  totalAttacks: number; // Attacks used across all rounds participated
  totalStars: number; // Total stars earned
  roundsParticipated: number; // How many rounds they were in roster
  missedAttacks: number; // Rounds participated but did not attack
}

/**
 * Grid data structure for the participation grid
 */
export interface ParticipationGridData {
  players: PlayerParticipation[];
  season: string;
  roundsAvailable: number[]; // Which rounds have data (e.g., [1, 2, 3] if only 3 rounds played)
}

export type ParticipationSortOption = 'stars' | 'name' | 'missed' | 'attacks';

/**
 * Transform league wars into participation grid data
 */
export function transformToParticipationGrid(wars: LeagueWar[]): ParticipationGridData {
  if (wars.length === 0) {
    return {
      players: [],
      season: '',
      roundsAvailable: [],
    };
  }

  // Build a map of all unique players from our clan
  const playerMap = new Map<string, PlayerParticipation>();

  // Get available rounds (sorted)
  const roundsAvailable = [...new Set(wars.map(w => w.roundNumber))].sort((a, b) => a - b);

  // Iterate through each war/round
  for (const war of wars) {
    const roundNumber = war.roundNumber;

    // Get our clan members for this round
    const ourMembers = war.members.filter(m => m.isOurClan);

    for (const member of ourMembers) {
      // Initialize player if not seen before
      if (!playerMap.has(member.tag)) {
        playerMap.set(member.tag, {
          tag: member.tag,
          name: member.name,
          rounds: Array(7)
            .fill(null)
            .map((_, i) => ({
              roundNumber: i + 1,
              participated: false,
              attacked: false,
              stars: null,
              destructionPercentage: null,
            })),
          totalAttacks: 0,
          totalStars: 0,
          roundsParticipated: 0,
          missedAttacks: 0,
        });
      }

      const player = playerMap.get(member.tag)!;
      const roundIndex = roundNumber - 1;

      // Mark participation
      player.rounds[roundIndex].participated = true;
      player.roundsParticipated++;

      // Find attack for this player in this war
      const attack = war.attacks.find(a => a.attackerTag === member.tag && a.isOurClan);

      if (attack) {
        player.rounds[roundIndex].attacked = true;
        player.rounds[roundIndex].stars = attack.stars;
        player.rounds[roundIndex].destructionPercentage = attack.destructionPercentage;
        player.totalAttacks++;
        player.totalStars += attack.stars;
      } else if (member.attacksUsed > 0) {
        // Fallback: check attacksUsed if attack not in attacks array
        player.rounds[roundIndex].attacked = true;
        player.totalAttacks++;
      } else {
        // Participated but did not attack
        player.missedAttacks++;
      }
    }
  }

  // Convert to array
  const players = Array.from(playerMap.values());

  return {
    players,
    season: wars[0]?.season || '',
    roundsAvailable,
  };
}

/**
 * Sort players based on the selected sort option
 */
export function sortPlayers(
  players: PlayerParticipation[],
  sortBy: ParticipationSortOption
): PlayerParticipation[] {
  const sorted = [...players];

  switch (sortBy) {
    case 'stars':
      // Sort by total stars (descending), then by name
      sorted.sort((a, b) => b.totalStars - a.totalStars || a.name.localeCompare(b.name));
      break;
    case 'attacks':
      // Sort by total attacks (descending), then by name
      sorted.sort((a, b) => b.totalAttacks - a.totalAttacks || a.name.localeCompare(b.name));
      break;
    case 'missed':
      // Sort by missed attacks (descending - most missed first), then by name
      sorted.sort((a, b) => b.missedAttacks - a.missedAttacks || a.name.localeCompare(b.name));
      break;
    case 'name':
      // Sort alphabetically by name
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}

/**
 * Get the color for a grid cell based on its state
 */
export function getCellColor(round: PlayerRoundData): string {
  if (!round.participated) {
    return 'notInRoster';
  }
  if (!round.attacked) {
    return 'missed';
  }
  switch (round.stars) {
    case 0:
      return 'stars0';
    case 1:
      return 'stars1';
    case 2:
      return 'stars2';
    case 3:
      return 'stars3';
    default:
      return 'stars0';
  }
}

/**
 * Get display text for a grid cell
 */
export function getCellDisplay(round: PlayerRoundData): string {
  if (!round.participated) {
    return '-';
  }
  if (!round.attacked) {
    return 'X';
  }
  return round.stars?.toString() ?? '0';
}
