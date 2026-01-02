import { CoCLeagueWarResponse, LeagueWar, LeagueWarGroup, CoCLeagueGroupResponse } from './league-types';
import { WarClanStats, WarAttack, WarMember, CoCWarMember } from './types';
import { CLAN_TAG } from './constants';

/**
 * Calculate clan stats from league war data
 * Adapted from calculateClanStats in data-transformer.ts
 */
function calculateClanStats(
  members: CoCWarMember[],
  attacksPerMember: number,
  teamSize: number
): WarClanStats {
  let totalStars = 0;
  let totalDestructionPercentage = 0;
  let attacksUsed = 0;

  members.forEach(member => {
    if (member.attacks) {
      attacksUsed += member.attacks.length;
      member.attacks.forEach(attack => {
        totalStars += attack.stars;
        totalDestructionPercentage += attack.destructionPercentage;
      });
    }
  });

  const attacksAvailable = teamSize * attacksPerMember;

  return {
    totalAttacks: attacksUsed,
    totalStars,
    destructionPercentage: attacksUsed > 0 ? totalDestructionPercentage / attacksUsed : 0,
    attacksUsed,
    attacksAvailable,
  };
}

/**
 * Extract all attacks from both clans in a league war
 */
function extractAttacks(
  warId: string,
  clanMembers: CoCWarMember[],
  opponentMembers: CoCWarMember[],
  ourClanTag: string
): WarAttack[] {
  const attacks: WarAttack[] = [];

  const findMemberName = (tag: string, members: CoCWarMember[]): string => {
    const member = members.find(m => m.tag === tag);
    return member?.name || 'Unknown';
  };

  // Process our clan's attacks
  clanMembers.forEach(member => {
    if (member.attacks) {
      member.attacks.forEach(attack => {
        attacks.push({
          warId,
          attackerTag: attack.attackerTag,
          attackerName: member.name,
          defenderTag: attack.defenderTag,
          defenderName: findMemberName(attack.defenderTag, opponentMembers),
          stars: attack.stars,
          destructionPercentage: attack.destructionPercentage,
          order: attack.order,
          isOurClan: true,
        });
      });
    }
  });

  // Process opponent's attacks
  opponentMembers.forEach(member => {
    if (member.attacks) {
      member.attacks.forEach(attack => {
        attacks.push({
          warId,
          attackerTag: attack.attackerTag,
          attackerName: member.name,
          defenderTag: attack.defenderTag,
          defenderName: findMemberName(attack.defenderTag, clanMembers),
          stars: attack.stars,
          destructionPercentage: attack.destructionPercentage,
          order: attack.order,
          isOurClan: false,
        });
      });
    }
  });

  return attacks.sort((a, b) => a.order - b.order);
}

/**
 * Extract all members from both clans
 */
function extractMembers(
  clanMembers: CoCWarMember[],
  opponentMembers: CoCWarMember[]
): WarMember[] {
  const members: WarMember[] = [];

  clanMembers.forEach(member => {
    members.push({
      tag: member.tag,
      name: member.name,
      townhallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
      attacksUsed: member.attacks?.length || 0,
      isOurClan: true,
    });
  });

  opponentMembers.forEach(member => {
    members.push({
      tag: member.tag,
      name: member.name,
      townhallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
      attacksUsed: member.attacks?.length || 0,
      isOurClan: false,
    });
  });

  return members.sort((a, b) => {
    if (a.isOurClan !== b.isOurClan) {
      return a.isOurClan ? -1 : 1;
    }
    return a.mapPosition - b.mapPosition;
  });
}

/**
 * Transform a single league war from API response to our schema
 */
export function transformLeagueWar(
  apiResponse: CoCLeagueWarResponse,
  season: string,
  roundNumber: number,
  clanTag: string = CLAN_TAG
): LeagueWar {
  // CWL typically has 1 attack per member
  const attacksPerMember = apiResponse.attacksPerMember || 1;

  // Determine which clan is ours and which is opponent
  // The API might return our clan as either 'clan' or 'opponent'
  const isOurClanFirst = apiResponse.clan.tag === clanTag;
  const ourClan = isOurClanFirst ? apiResponse.clan : apiResponse.opponent;
  const opponentClan = isOurClanFirst ? apiResponse.opponent : apiResponse.clan;

  const clanStats = calculateClanStats(
    ourClan.members,
    attacksPerMember,
    apiResponse.teamSize
  );

  const opponentStats = calculateClanStats(
    opponentClan.members,
    attacksPerMember,
    apiResponse.teamSize
  );

  // Use warTag as ID (it's already unique for CWL wars)
  // If warTag is not available (e.g., during preparation), create a stable ID
  // based on season, round, and opponent to prevent duplicates
  const warId = apiResponse.warTag || `${season}-round${roundNumber}-${opponentClan.tag}`;

  const attacks = extractAttacks(
    warId,
    ourClan.members,
    opponentClan.members,
    clanTag
  );

  const members = extractMembers(
    ourClan.members,
    opponentClan.members
  );

  return {
    id: warId,
    season,
    roundNumber,
    clanTag: ourClan.tag,
    clanName: ourClan.name,
    opponentTag: opponentClan.tag,
    opponentName: opponentClan.name,
    teamSize: apiResponse.teamSize,
    state: apiResponse.state,
    preparationStartTime: apiResponse.preparationStartTime,
    startTime: apiResponse.startTime,
    endTime: apiResponse.endTime,
    collectedAt: new Date().toISOString(),
    clanStats,
    opponentStats,
    members,
    attacks,
  };
}

/**
 * Transform league group and all wars into storage format
 */
export function transformLeagueGroup(
  leagueGroup: CoCLeagueGroupResponse,
  wars: Array<{ war: CoCLeagueWarResponse; roundNumber: number }>,
  clanTag: string = CLAN_TAG
): LeagueWarGroup {
  const transformedWars = wars.map(({ war, roundNumber }) =>
    transformLeagueWar(war, leagueGroup.season, roundNumber, clanTag)
  );

  return {
    season: leagueGroup.season,
    state: leagueGroup.state,
    collectedAt: new Date().toISOString(),
    participatingClans: leagueGroup.clans.map(clan => ({
      tag: clan.tag,
      name: clan.name,
      clanLevel: clan.clanLevel,
    })),
    wars: transformedWars,
  };
}

/**
 * Check if we should collect league wars based on state
 */
export function shouldCollectLeagueWars(state: CoCLeagueGroupResponse['state']): boolean {
  // Collect during preparation, inWar, and ended states
  // Only skip if notInWar
  return state !== 'notInWar';
}
