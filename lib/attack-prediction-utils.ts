import { War } from './types';
import { LeagueWar } from './league-types';
import { parseCoCTimestamp } from './date-utils';
import {
  PlayerPrediction,
  PredictionConfig,
  PredictionSortOption,
  DEFAULT_PREDICTION_CONFIG,
} from './attack-prediction-types';

/**
 * Internal type for tracking player data during aggregation
 */
interface PlayerAggregation {
  tag: string;
  name: string;
  townhallLevel: number;
  totalWars: number;
  totalAttacksUsed: number;
  totalAttacksAvailable: number;
  recentWars: number;
  recentAttacksUsed: number;
  recentAttacksAvailable: number;
  lastWarDate: string | null;
}

/**
 * Check if a war end time is within the last N days
 */
function isWithinDays(endTime: string, days: number): boolean {
  const warDate = parseCoCTimestamp(endTime);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return warDate >= cutoffDate;
}

/**
 * Get reliability color based on prediction score
 */
export function getReliabilityColor(
  score: number,
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): 'green' | 'yellow' | 'red' {
  if (score >= config.highReliabilityThreshold) return 'green';
  if (score >= config.mediumReliabilityThreshold) return 'yellow';
  return 'red';
}

/**
 * Get confidence level based on war count
 */
export function getConfidenceLevel(
  warCount: number,
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): 'low' | 'medium' | 'high' {
  if (warCount >= config.minWarsForHighConfidence) return 'high';
  if (warCount >= config.minWarsForMediumConfidence) return 'medium';
  return 'low';
}

/**
 * Calculate prediction score from overall and recent rates
 */
export function calculatePredictionScore(
  overallRate: number,
  recentRate: number,
  hasRecentData: boolean,
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): number {
  if (!hasRecentData) {
    // If no recent data, use overall rate only
    return overallRate;
  }
  return overallRate * config.overallWeight + recentRate * config.recentWeight;
}

/**
 * Transform regular wars to player predictions
 */
export function transformToPredictions(
  wars: War[],
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): PlayerPrediction[] {
  if (wars.length === 0) {
    return [];
  }

  // Build player aggregation map
  const playerMap = new Map<string, PlayerAggregation>();

  for (const war of wars) {
    // Skip wars without member data
    if (!war.members || war.members.length === 0) continue;

    const warEndTime = war.endTime;
    const isRecent = isWithinDays(warEndTime, config.recentDays);
    const attacksPerMember = 2; // Regular wars have 2 attacks

    // Get our clan members
    const ourMembers = war.members.filter(m => m.isOurClan);

    for (const member of ourMembers) {
      // Initialize player if not seen before
      if (!playerMap.has(member.tag)) {
        playerMap.set(member.tag, {
          tag: member.tag,
          name: member.name,
          townhallLevel: member.townhallLevel,
          totalWars: 0,
          totalAttacksUsed: 0,
          totalAttacksAvailable: 0,
          recentWars: 0,
          recentAttacksUsed: 0,
          recentAttacksAvailable: 0,
          lastWarDate: null,
        });
      }

      const player = playerMap.get(member.tag)!;

      // Update name and TH level to latest
      player.name = member.name;
      player.townhallLevel = Math.max(player.townhallLevel, member.townhallLevel);

      // Update overall stats
      player.totalWars++;
      player.totalAttacksUsed += member.attacksUsed;
      player.totalAttacksAvailable += attacksPerMember;

      // Update recent stats if within date range
      if (isRecent) {
        player.recentWars++;
        player.recentAttacksUsed += member.attacksUsed;
        player.recentAttacksAvailable += attacksPerMember;
      }

      // Track last war date
      if (!player.lastWarDate || warEndTime > player.lastWarDate) {
        player.lastWarDate = warEndTime;
      }
    }
  }

  // Convert to PlayerPrediction array
  return Array.from(playerMap.values()).map(player => {
    const overallRate =
      player.totalAttacksAvailable > 0
        ? (player.totalAttacksUsed / player.totalAttacksAvailable) * 100
        : 0;

    const hasRecentData = player.recentAttacksAvailable > 0;
    const recentRate = hasRecentData
      ? (player.recentAttacksUsed / player.recentAttacksAvailable) * 100
      : -1;

    const predictionScore = calculatePredictionScore(
      overallRate,
      hasRecentData ? recentRate : overallRate,
      hasRecentData,
      config
    );

    return {
      tag: player.tag,
      name: player.name,
      townhallLevel: player.townhallLevel,
      totalWars: player.totalWars,
      totalAttacksUsed: player.totalAttacksUsed,
      totalAttacksAvailable: player.totalAttacksAvailable,
      overallRate,
      recentWars: player.recentWars,
      recentAttacksUsed: player.recentAttacksUsed,
      recentAttacksAvailable: player.recentAttacksAvailable,
      recentRate,
      predictionScore,
      confidenceLevel: getConfidenceLevel(player.totalWars, config),
      reliabilityColor: getReliabilityColor(predictionScore, config),
      lastWarDate: player.lastWarDate,
    };
  });
}

/**
 * Transform CWL wars to player predictions
 */
export function transformLeagueWarsToPredictions(
  wars: LeagueWar[],
  config: PredictionConfig = DEFAULT_PREDICTION_CONFIG
): PlayerPrediction[] {
  if (wars.length === 0) {
    return [];
  }

  // Build player aggregation map
  const playerMap = new Map<string, PlayerAggregation>();

  for (const war of wars) {
    // Skip wars without member data
    if (!war.members || war.members.length === 0) continue;

    const warEndTime = war.endTime;
    const isRecent = isWithinDays(warEndTime, config.recentDays);
    const attacksPerMember = 1; // CWL has 1 attack per member

    // Get our clan members
    const ourMembers = war.members.filter(m => m.isOurClan);

    for (const member of ourMembers) {
      // Initialize player if not seen before
      if (!playerMap.has(member.tag)) {
        playerMap.set(member.tag, {
          tag: member.tag,
          name: member.name,
          townhallLevel: member.townhallLevel,
          totalWars: 0,
          totalAttacksUsed: 0,
          totalAttacksAvailable: 0,
          recentWars: 0,
          recentAttacksUsed: 0,
          recentAttacksAvailable: 0,
          lastWarDate: null,
        });
      }

      const player = playerMap.get(member.tag)!;

      // Update name and TH level to latest
      player.name = member.name;
      player.townhallLevel = Math.max(player.townhallLevel, member.townhallLevel);

      // Update overall stats
      player.totalWars++;
      player.totalAttacksUsed += Math.min(member.attacksUsed, 1); // Cap at 1 for CWL
      player.totalAttacksAvailable += attacksPerMember;

      // Update recent stats if within date range
      if (isRecent) {
        player.recentWars++;
        player.recentAttacksUsed += Math.min(member.attacksUsed, 1);
        player.recentAttacksAvailable += attacksPerMember;
      }

      // Track last war date
      if (!player.lastWarDate || warEndTime > player.lastWarDate) {
        player.lastWarDate = warEndTime;
      }
    }
  }

  // Convert to PlayerPrediction array
  return Array.from(playerMap.values()).map(player => {
    const overallRate =
      player.totalAttacksAvailable > 0
        ? (player.totalAttacksUsed / player.totalAttacksAvailable) * 100
        : 0;

    const hasRecentData = player.recentAttacksAvailable > 0;
    const recentRate = hasRecentData
      ? (player.recentAttacksUsed / player.recentAttacksAvailable) * 100
      : -1;

    const predictionScore = calculatePredictionScore(
      overallRate,
      hasRecentData ? recentRate : overallRate,
      hasRecentData,
      config
    );

    return {
      tag: player.tag,
      name: player.name,
      townhallLevel: player.townhallLevel,
      totalWars: player.totalWars,
      totalAttacksUsed: player.totalAttacksUsed,
      totalAttacksAvailable: player.totalAttacksAvailable,
      overallRate,
      recentWars: player.recentWars,
      recentAttacksUsed: player.recentAttacksUsed,
      recentAttacksAvailable: player.recentAttacksAvailable,
      recentRate,
      predictionScore,
      confidenceLevel: getConfidenceLevel(player.totalWars, config),
      reliabilityColor: getReliabilityColor(predictionScore, config),
      lastWarDate: player.lastWarDate,
    };
  });
}

/**
 * Sort predictions by the specified option
 */
export function sortPredictions(
  predictions: PlayerPrediction[],
  sortBy: PredictionSortOption
): PlayerPrediction[] {
  const sorted = [...predictions];

  switch (sortBy) {
    case 'prediction-high':
      sorted.sort((a, b) => b.predictionScore - a.predictionScore || a.name.localeCompare(b.name));
      break;
    case 'prediction-low':
      sorted.sort((a, b) => a.predictionScore - b.predictionScore || a.name.localeCompare(b.name));
      break;
    case 'overall-high':
      sorted.sort((a, b) => b.overallRate - a.overallRate || a.name.localeCompare(b.name));
      break;
    case 'overall-low':
      sorted.sort((a, b) => a.overallRate - b.overallRate || a.name.localeCompare(b.name));
      break;
    case 'recent-high':
      sorted.sort((a, b) => {
        // Put players with no recent data at the end
        if (a.recentRate === -1 && b.recentRate === -1) return a.name.localeCompare(b.name);
        if (a.recentRate === -1) return 1;
        if (b.recentRate === -1) return -1;
        return b.recentRate - a.recentRate || a.name.localeCompare(b.name);
      });
      break;
    case 'recent-low':
      sorted.sort((a, b) => {
        // Put players with no recent data at the end
        if (a.recentRate === -1 && b.recentRate === -1) return a.name.localeCompare(b.name);
        if (a.recentRate === -1) return 1;
        if (b.recentRate === -1) return -1;
        return a.recentRate - b.recentRate || a.name.localeCompare(b.name);
      });
      break;
    case 'th-high':
      sorted.sort((a, b) => b.townhallLevel - a.townhallLevel || a.name.localeCompare(b.name));
      break;
    case 'th-low':
      sorted.sort((a, b) => a.townhallLevel - b.townhallLevel || a.name.localeCompare(b.name));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  return sorted;
}
