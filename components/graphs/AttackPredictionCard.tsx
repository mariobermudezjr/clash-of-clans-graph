'use client';

import React, { useState, useMemo } from 'react';
import { War } from '@/lib/types';
import { LeagueWar } from '@/lib/league-types';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  WarType,
  PredictionSortOption,
  PlayerPrediction,
} from '@/lib/attack-prediction-types';
import {
  transformToPredictions,
  transformLeagueWarsToPredictions,
  sortPredictions,
} from '@/lib/attack-prediction-utils';

interface AttackPredictionCardProps {
  regularWars: War[];
  leagueWars: LeagueWar[];
  loading?: boolean;
}

interface PredictionRowProps {
  prediction: PlayerPrediction;
  rank: number;
}

function PredictionRow({ prediction, rank }: PredictionRowProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const confidenceBadgeColor = {
    high: 'bg-green-900/50 text-green-400 border-green-700',
    medium: 'bg-amber-900/50 text-amber-400 border-amber-700',
    low: 'bg-slate-800 text-slate-400 border-slate-600',
  };

  return (
    <div
      className="grid grid-cols-12 gap-2 py-3 px-3 border-b border-border hover:bg-surface/50 transition-colors items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Rank */}
      <div className="col-span-1 text-sm text-textMuted font-medium">
        #{rank}
      </div>

      {/* Player Name + TH */}
      <div className="col-span-3 flex items-center gap-2">
        <span
          className={`text-sm font-medium truncate ${
            prediction.reliabilityColor === 'red' ? 'text-red-400' : 'text-text'
          }`}
          title={prediction.name}
        >
          {prediction.name}
        </span>
        <span className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">
          TH{prediction.townhallLevel}
        </span>
      </div>

      {/* Overall Rate */}
      <div className="col-span-2">
        <ProgressBar value={prediction.overallRate} size="sm" />
      </div>

      {/* Recent Rate */}
      <div className="col-span-2">
        <ProgressBar
          value={prediction.recentRate}
          size="sm"
          showNA={prediction.recentRate === -1}
        />
      </div>

      {/* Prediction Score */}
      <div className="col-span-2">
        <ProgressBar value={prediction.predictionScore} size="md" />
      </div>

      {/* Sample Size */}
      <div className="col-span-2 relative">
        <span
          className={`text-xs px-2 py-1 rounded border ${confidenceBadgeColor[prediction.confidenceLevel]}`}
        >
          {prediction.totalWars} war{prediction.totalWars !== 1 ? 's' : ''}
        </span>
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 z-50 bg-surface border border-border rounded-lg p-3 shadow-lg whitespace-nowrap text-xs">
            <p className="text-text font-medium mb-2">{prediction.name}</p>
            <p className="text-textMuted">
              Overall: {prediction.totalAttacksUsed}/{prediction.totalAttacksAvailable} attacks (
              {prediction.totalWars} wars)
            </p>
            {prediction.recentWars > 0 && (
              <p className="text-textMuted">
                Recent (30d): {prediction.recentAttacksUsed}/{prediction.recentAttacksAvailable}{' '}
                attacks ({prediction.recentWars} wars)
              </p>
            )}
            <p className="text-textMuted mt-1">
              Confidence: {prediction.confidenceLevel}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MobilePredictionRow({ prediction, rank }: PredictionRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border">
      <div
        className="flex items-center justify-between py-3 px-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-textMuted font-medium w-8">#{rank}</span>
          <div>
            <span
              className={`text-sm font-medium ${
                prediction.reliabilityColor === 'red' ? 'text-red-400' : 'text-text'
              }`}
            >
              {prediction.name}
            </span>
            <span className="text-xs text-textMuted ml-2">TH{prediction.townhallLevel}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20">
            <ProgressBar value={prediction.predictionScore} size="sm" />
          </div>
          <span className="text-textMuted">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-surface/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-textMuted">Overall</span>
            <div className="w-32">
              <ProgressBar value={prediction.overallRate} size="sm" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-textMuted">Recent (30d)</span>
            <div className="w-32">
              <ProgressBar
                value={prediction.recentRate}
                size="sm"
                showNA={prediction.recentRate === -1}
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-textMuted">
            <span>Sample</span>
            <span>
              {prediction.totalWars} war{prediction.totalWars !== 1 ? 's' : ''} (
              {prediction.recentWars} recent)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AttackPredictionCard({
  regularWars,
  leagueWars,
  loading = false,
}: AttackPredictionCardProps) {
  const [warType, setWarType] = useState<WarType>('regular');
  const [sortBy, setSortBy] = useState<PredictionSortOption>('prediction-high');

  // Transform data based on war type
  const predictions = useMemo(() => {
    if (warType === 'regular') {
      return transformToPredictions(regularWars);
    }
    return transformLeagueWarsToPredictions(leagueWars);
  }, [regularWars, leagueWars, warType]);

  // Sort predictions
  const sortedPredictions = useMemo(
    () => sortPredictions(predictions, sortBy),
    [predictions, sortBy]
  );

  // Calculate summary stats
  const stats = useMemo(() => {
    if (predictions.length === 0) return null;

    const reliable = predictions.filter(p => p.predictionScore >= 80).length;
    const moderate = predictions.filter(p => p.predictionScore >= 50 && p.predictionScore < 80).length;
    const unreliable = predictions.filter(p => p.predictionScore < 50).length;
    const avgScore = predictions.reduce((sum, p) => sum + p.predictionScore, 0) / predictions.length;

    return { reliable, moderate, unreliable, avgScore, total: predictions.length };
  }, [predictions]);

  const handleWarTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWarType(e.target.value as WarType);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as PredictionSortOption);
  };

  if (loading) {
    return (
      <Card>
        <ChartSkeleton />
      </Card>
    );
  }

  const hasData = warType === 'regular' ? regularWars.length > 0 : leagueWars.length > 0;

  if (!hasData) {
    return (
      <Card title="Attack Prediction">
        <div className="mb-4">
          <Select
            label="Data Source"
            options={[
              { value: 'regular', label: 'Regular Wars (2 attacks)' },
              { value: 'cwl', label: 'CWL (1 attack)' },
            ]}
            value={warType}
            onChange={handleWarTypeChange}
          />
        </div>
        <div className="flex items-center justify-center h-32 text-textMuted">
          No {warType === 'regular' ? 'regular war' : 'CWL'} data available.
          {warType === 'regular'
            ? ' Start collecting war data to see predictions.'
            : ' CWL data will be available during league wars.'}
        </div>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card title="Attack Prediction">
        <div className="mb-4">
          <Select
            label="Data Source"
            options={[
              { value: 'regular', label: 'Regular Wars (2 attacks)' },
              { value: 'cwl', label: 'CWL (1 attack)' },
            ]}
            value={warType}
            onChange={handleWarTypeChange}
          />
        </div>
        <div className="flex items-center justify-center h-32 text-textMuted">
          No player data available for predictions.
        </div>
      </Card>
    );
  }

  return (
    <Card title="Attack Prediction">
      {/* Controls */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Data Source"
          options={[
            { value: 'regular', label: 'Regular Wars (2 attacks)' },
            { value: 'cwl', label: 'CWL (1 attack)' },
          ]}
          value={warType}
          onChange={handleWarTypeChange}
        />
        <Select
          label="Sort By"
          options={[
            { value: 'prediction-high', label: 'Prediction (High to Low)' },
            { value: 'prediction-low', label: 'Prediction (Low to High)' },
            { value: 'overall-high', label: 'Overall % (High to Low)' },
            { value: 'recent-high', label: 'Recent % (High to Low)' },
            { value: 'th-high', label: 'Town Hall (High to Low)' },
            { value: 'name', label: 'Name (A-Z)' },
          ]}
          value={sortBy}
          onChange={handleSortChange}
        />
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ backgroundColor: '#10b981' }} />
          <span className="text-textMuted">Reliable (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ backgroundColor: '#f59e0b' }} />
          <span className="text-textMuted">Moderate (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 rounded" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-textMuted">Unreliable (&lt;50%)</span>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Total Players</div>
            <div className="text-lg font-bold text-text">{stats.total}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Reliable</div>
            <div className="text-lg font-bold text-green-500">{stats.reliable}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Moderate</div>
            <div className="text-lg font-bold text-amber-500">{stats.moderate}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Unreliable</div>
            <div className="text-lg font-bold text-red-500">{stats.unreliable}</div>
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 py-2 px-3 bg-surface text-xs font-medium text-textMuted">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2">Overall</div>
          <div className="col-span-2">Recent (30d)</div>
          <div className="col-span-2">Prediction</div>
          <div className="col-span-2">Sample</div>
        </div>

        {/* Rows */}
        <div className="max-h-[500px] overflow-y-auto">
          {sortedPredictions.map((prediction, index) => (
            <PredictionRow key={prediction.tag} prediction={prediction} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Mobile List */}
      <div className="md:hidden border border-border rounded-lg overflow-hidden">
        <div className="py-2 px-3 bg-surface text-xs font-medium text-textMuted flex justify-between">
          <span>Player</span>
          <span>Prediction</span>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {sortedPredictions.map((prediction, index) => (
            <MobilePredictionRow key={prediction.tag} prediction={prediction} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-textMuted">
        <p>
          Prediction = 40% Overall + 60% Recent (30 days). Higher scores indicate more reliable
          attackers.
        </p>
      </div>
    </Card>
  );
}
