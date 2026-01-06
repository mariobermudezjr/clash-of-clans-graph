/**
 * Types for the Attack Prediction feature
 */

/**
 * War type for prediction (affects attacks per war calculation)
 */
export type WarType = 'regular' | 'cwl';

/**
 * Player prediction data aggregated across wars
 */
export interface PlayerPrediction {
  tag: string;
  name: string;
  townhallLevel: number;

  // Overall statistics (all time)
  totalWars: number;
  totalAttacksUsed: number;
  totalAttacksAvailable: number;
  overallRate: number; // Percentage 0-100

  // Recent statistics (last 30 days)
  recentWars: number;
  recentAttacksUsed: number;
  recentAttacksAvailable: number;
  recentRate: number; // Percentage 0-100, or -1 if no recent data

  // Prediction
  predictionScore: number; // Weighted combination 0-100
  confidenceLevel: 'low' | 'medium' | 'high';
  reliabilityColor: 'green' | 'yellow' | 'red';

  // Metadata
  lastWarDate: string | null; // ISO timestamp of most recent war
}

/**
 * Sort options for the prediction table
 */
export type PredictionSortOption =
  | 'prediction-high'
  | 'prediction-low'
  | 'overall-high'
  | 'overall-low'
  | 'recent-high'
  | 'recent-low'
  | 'th-high'
  | 'th-low'
  | 'name';

/**
 * Configuration for the prediction algorithm
 */
export interface PredictionConfig {
  overallWeight: number; // Default: 0.4
  recentWeight: number; // Default: 0.6
  recentDays: number; // Default: 30
  minWarsForHighConfidence: number; // Default: 5
  minWarsForMediumConfidence: number; // Default: 3
  highReliabilityThreshold: number; // Default: 80
  mediumReliabilityThreshold: number; // Default: 50
}

/**
 * Default prediction configuration
 */
export const DEFAULT_PREDICTION_CONFIG: PredictionConfig = {
  overallWeight: 0.4,
  recentWeight: 0.6,
  recentDays: 30,
  minWarsForHighConfidence: 5,
  minWarsForMediumConfidence: 3,
  highReliabilityThreshold: 80,
  mediumReliabilityThreshold: 50,
};
