import { War, AttacksPerWarDataPoint, StarsPerAttackDataPoint } from './types';
import { parseCoCTimestamp } from './date-utils';

/**
 * Transform wars data for the Attacks Per War chart
 */
export function transformToAttacksData(wars: War[]): AttacksPerWarDataPoint[] {
  return wars.map(war => ({
    warId: war.id,
    warEndTime: war.endTime,
    opponentName: war.opponentName,
    attacksUsed: war.clanStats.attacksUsed,
    attacksAvailable: war.clanStats.attacksAvailable,
    usageRate: war.clanStats.attacksAvailable > 0
      ? (war.clanStats.attacksUsed / war.clanStats.attacksAvailable) * 100
      : 0,
  }));
}

/**
 * Transform wars data for the Stars Per Attack chart
 */
export function transformToStarsData(wars: War[]): StarsPerAttackDataPoint[] {
  return wars.map(war => {
    const ourAttacks = war.attacks.filter(a => a.isOurClan);
    const totalAttacks = ourAttacks.length;
    const totalStars = ourAttacks.reduce((sum, a) => sum + a.stars, 0);
    const averageStars = totalAttacks > 0 ? totalStars / totalAttacks : 0;

    return {
      warId: war.id,
      warEndTime: war.endTime,
      opponentName: war.opponentName,
      averageStars: Number(averageStars.toFixed(2)),
      totalAttacks,
    };
  });
}

/**
 * Format date for chart axis
 */
export function formatChartDate(cocTimestamp: string): string {
  const date = parseCoCTimestamp(cocTimestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Create chart label combining opponent name and date
 */
export function createChartLabel(opponentName: string, endTime: string): string {
  const formattedDate = formatChartDate(endTime);
  // Truncate long opponent names
  const truncatedName = opponentName.length > 15
    ? opponentName.substring(0, 12) + '...'
    : opponentName;
  return `${truncatedName}\n${formattedDate}`;
}

/**
 * Sort wars by date
 */
export function sortWarsByDate(wars: War[], order: 'asc' | 'desc'): War[] {
  const sorted = [...wars].sort((a, b) => {
    const dateA = parseCoCTimestamp(a.endTime).getTime();
    const dateB = parseCoCTimestamp(b.endTime).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
  return sorted;
}

/**
 * Sort wars by attacks used
 */
export function sortWarsByAttacks(wars: War[], order: 'asc' | 'desc'): War[] {
  const sorted = [...wars].sort((a, b) => {
    const attacksA = a.clanStats.attacksUsed;
    const attacksB = b.clanStats.attacksUsed;
    return order === 'asc' ? attacksA - attacksB : attacksB - attacksA;
  });
  return sorted;
}

/**
 * Sort wars by average stars per attack
 */
export function sortWarsByStars(wars: War[], order: 'asc' | 'desc'): War[] {
  const sorted = [...wars].sort((a, b) => {
    const ourAttacksA = a.attacks.filter(att => att.isOurClan);
    const ourAttacksB = b.attacks.filter(att => att.isOurClan);

    const avgStarsA = ourAttacksA.length > 0
      ? ourAttacksA.reduce((sum, att) => sum + att.stars, 0) / ourAttacksA.length
      : 0;

    const avgStarsB = ourAttacksB.length > 0
      ? ourAttacksB.reduce((sum, att) => sum + att.stars, 0) / ourAttacksB.length
      : 0;

    return order === 'asc' ? avgStarsA - avgStarsB : avgStarsB - avgStarsA;
  });
  return sorted;
}

/**
 * Sort wars by the selected criteria
 */
export function sortWars(wars: War[], sortBy: 'date' | 'attacks' | 'stars', order: 'asc' | 'desc'): War[] {
  switch (sortBy) {
    case 'date':
      return sortWarsByDate(wars, order);
    case 'attacks':
      return sortWarsByAttacks(wars, order);
    case 'stars':
      return sortWarsByStars(wars, order);
    default:
      return wars;
  }
}

/**
 * Filter wars by search query (opponent name)
 */
export function filterWarsBySearch(wars: War[], searchQuery: string): War[] {
  if (!searchQuery.trim()) {
    return wars;
  }
  const query = searchQuery.toLowerCase();
  return wars.filter(war =>
    war.opponentName.toLowerCase().includes(query)
  );
}

/**
 * Filter wars by date range
 */
export function filterWarsByDateRange(
  wars: War[],
  dateRange: [Date | null, Date | null]
): War[] {
  const [startDate, endDate] = dateRange;

  if (!startDate && !endDate) {
    return wars;
  }

  return wars.filter(war => {
    const warDate = parseCoCTimestamp(war.endTime);

    if (startDate && warDate < startDate) {
      return false;
    }

    if (endDate && warDate > endDate) {
      return false;
    }

    return true;
  });
}

/**
 * Filter wars by selected war IDs
 */
export function filterWarsBySelection(wars: War[], selectedWarIds: string[]): War[] {
  if (selectedWarIds.length === 0) {
    return wars;
  }
  return wars.filter(war => selectedWarIds.includes(war.id));
}
