import { CoCWarResponse, War, WarClanStats, WarAttack, WarMember } from './types';
import { CLAN_TAG } from './constants';

/**
 * Generate a unique ID for a war based on end time and clan tags
 */
function generateWarId(endTime: string, clanTag: string, opponentTag: string): string {
  // Create a hash-like string from the end time and tags
  const combined = `${endTime}-${clanTag}-${opponentTag}`;
  return combined.replace(/[:#]/g, '-').toLowerCase();
}

/**
 * Calculate clan stats from war data
 */
function calculateClanStats(
  members: CoCWarResponse['clan']['members'],
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
 * Extract all attacks from both clans
 */
function extractAttacks(
  warId: string,
  clanMembers: CoCWarResponse['clan']['members'],
  opponentMembers: CoCWarResponse['opponent']['members'],
  ourClanTag: string
): WarAttack[] {
  const attacks: WarAttack[] = [];

  // Helper to find member name by tag
  const findMemberName = (tag: string, members: typeof clanMembers): string => {
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

  // Sort by attack order
  return attacks.sort((a, b) => a.order - b.order);
}

/**
 * Extract all members from both clans
 */
function extractMembers(
  clanMembers: CoCWarResponse['clan']['members'],
  opponentMembers: CoCWarResponse['opponent']['members']
): WarMember[] {
  const members: WarMember[] = [];

  // Process our clan's members
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

  // Process opponent's members
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

  // Sort by clan (our clan first) then by map position
  return members.sort((a, b) => {
    if (a.isOurClan !== b.isOurClan) {
      return a.isOurClan ? -1 : 1;
    }
    return a.mapPosition - b.mapPosition;
  });
}

/**
 * Transform CoC API response to our War schema
 */
export function transformWarData(apiResponse: CoCWarResponse, clanTag: string = CLAN_TAG): War {
  // Default to 2 attacks per member if not specified
  const attacksPerMember = apiResponse.attacksPerMember || 2;

  const warId = generateWarId(
    apiResponse.endTime,
    apiResponse.clan.tag,
    apiResponse.opponent.tag
  );

  const clanStats = calculateClanStats(
    apiResponse.clan.members,
    attacksPerMember,
    apiResponse.teamSize
  );

  const opponentStats = calculateClanStats(
    apiResponse.opponent.members,
    attacksPerMember,
    apiResponse.teamSize
  );

  const attacks = extractAttacks(
    warId,
    apiResponse.clan.members,
    apiResponse.opponent.members,
    clanTag
  );

  const members = extractMembers(
    apiResponse.clan.members,
    apiResponse.opponent.members
  );

  const war: War = {
    id: warId,
    clanTag: apiResponse.clan.tag,
    clanName: apiResponse.clan.name,
    opponentTag: apiResponse.opponent.tag,
    opponentName: apiResponse.opponent.name,
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

  return war;
}

/**
 * Check if a war should be collected based on its state
 */
export function shouldCollectWar(state: CoCWarResponse['state']): boolean {
  // Collect wars that are in progress or have ended
  // This allows real-time tracking and final results
  return state === 'inWar' || state === 'warEnded';
}

/**
 * Check if a war is currently in progress
 */
export function isWarInProgress(state: CoCWarResponse['state']): boolean {
  return state === 'inWar';
}
