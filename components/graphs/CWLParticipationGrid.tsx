'use client';

import React, { useState, useMemo } from 'react';
import { LeagueWar } from '@/lib/league-types';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { gridColors } from '@/lib/constants';
import {
  transformToParticipationGrid,
  sortPlayers,
  getCellDisplay,
  ParticipationSortOption,
  PlayerRoundData,
} from '@/lib/cwl-participation-utils';

interface CWLParticipationGridProps {
  wars: LeagueWar[];
  loading?: boolean;
}

interface GridCellProps {
  round: PlayerRoundData;
  playerName: string;
}

function GridCell({ round, playerName }: GridCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getBackgroundColor = (): string => {
    if (!round.participated) return gridColors.notInRoster;
    if (!round.attacked) return gridColors.missed;
    switch (round.stars) {
      case 0:
        return gridColors.stars0;
      case 1:
        return gridColors.stars1;
      case 2:
        return gridColors.stars2;
      case 3:
        return gridColors.stars3;
      default:
        return gridColors.stars0;
    }
  };

  const getTextColor = (): string => {
    // Use dark text for bright backgrounds (2 stars, 3 stars)
    if (round.participated && round.attacked && (round.stars === 2 || round.stars === 3)) {
      return '#0f172a';
    }
    return '#e2e8f0';
  };

  const display = getCellDisplay(round);

  return (
    <div
      className="relative flex items-center justify-center h-10 w-12 rounded text-sm font-medium cursor-default transition-transform hover:scale-105"
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {display}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-surface border border-border rounded-lg p-3 shadow-lg whitespace-nowrap">
          <p className="text-text font-medium text-sm mb-1">{playerName}</p>
          <p className="text-textMuted text-xs">Round {round.roundNumber}</p>
          {!round.participated ? (
            <p className="text-textMuted text-xs">Not in roster</p>
          ) : !round.attacked ? (
            <p className="text-red-400 text-xs font-medium">Missed attack</p>
          ) : (
            <>
              <p className="text-primary text-xs">Stars: {round.stars}</p>
              {round.destructionPercentage !== null && (
                <p className="text-textMuted text-xs">
                  Destruction: {round.destructionPercentage.toFixed(0)}%
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CWLParticipationGrid({ wars, loading = false }: CWLParticipationGridProps) {
  const [sortBy, setSortBy] = useState<ParticipationSortOption>('stars');

  // Transform data
  const gridData = useMemo(() => transformToParticipationGrid(wars), [wars]);

  // Sort players
  const sortedPlayers = useMemo(
    () => sortPlayers(gridData.players, sortBy),
    [gridData.players, sortBy]
  );

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as ParticipationSortOption);
  };

  if (loading) {
    return (
      <Card>
        <ChartSkeleton />
      </Card>
    );
  }

  if (wars.length === 0) {
    return (
      <Card title="CWL Participation Grid">
        <div className="flex items-center justify-center h-32 text-textMuted">
          No CWL data available for this season.
        </div>
      </Card>
    );
  }

  if (gridData.players.length === 0) {
    return (
      <Card title="CWL Participation Grid">
        <div className="flex items-center justify-center h-32 text-textMuted">
          No player participation data available.
        </div>
      </Card>
    );
  }

  return (
    <Card title="CWL Participation Grid">
      {/* Controls */}
      <div className="mb-4 max-w-xs">
        <Select
          label="Sort Players By"
          options={[
            { value: 'stars', label: 'Total Stars (High to Low)' },
            { value: 'attacks', label: 'Total Attacks (High to Low)' },
            { value: 'missed', label: 'Missed Attacks (Most First)' },
            { value: 'name', label: 'Name (A-Z)' },
          ]}
          value={sortBy}
          onChange={handleSortChange}
        />
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.notInRoster, color: '#94a3b8' }}
          >
            -
          </div>
          <span className="text-textMuted">Not in roster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.missed, color: '#e2e8f0' }}
          >
            X
          </div>
          <span className="text-textMuted">Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.stars0, color: '#e2e8f0' }}
          >
            0
          </div>
          <span className="text-textMuted">0 stars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.stars1, color: '#e2e8f0' }}
          >
            1
          </div>
          <span className="text-textMuted">1 star</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.stars2, color: '#0f172a' }}
          >
            2
          </div>
          <span className="text-textMuted">2 stars</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
            style={{ backgroundColor: gridColors.stars3, color: '#0f172a' }}
          >
            3
          </div>
          <span className="text-textMuted">3 stars</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-fit">
          {/* Header Row */}
          <div className="flex items-center gap-1 mb-1">
            <div className="w-36 md:w-44 text-xs font-medium text-textMuted pr-2">Player</div>
            {gridData.roundsAvailable.map(round => (
              <div
                key={round}
                className="w-12 text-center text-xs font-medium text-textMuted"
              >
                R{round}
              </div>
            ))}
            <div className="w-16 text-center text-xs font-medium text-textMuted pl-2">Total</div>
          </div>

          {/* Player Rows */}
          {sortedPlayers.map(player => (
            <div key={player.tag} className="flex items-center gap-1 mb-1">
              {/* Player Name */}
              <div
                className="w-36 md:w-44 text-sm text-text truncate pr-2"
                title={player.name}
              >
                {player.missedAttacks > 0 && (
                  <span className="text-red-400 mr-1">*</span>
                )}
                {player.name}
              </div>

              {/* Round Cells */}
              {gridData.roundsAvailable.map(round => (
                <GridCell
                  key={`${player.tag}-${round}`}
                  round={player.rounds[round - 1]}
                  playerName={player.name}
                />
              ))}

              {/* Total Summary */}
              <div className="w-16 text-center text-xs text-textMuted pl-2">
                <span className="text-secondary font-medium">{player.totalStars}</span>
                <span className="text-textMuted">/{player.roundsParticipated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-textMuted flex flex-wrap gap-4">
        <span>Total players: {gridData.players.length}</span>
        <span>Rounds played: {gridData.roundsAvailable.length}</span>
        <span>
          Missed attacks:{' '}
          <span className="text-red-400 font-medium">
            {gridData.players.reduce((sum, p) => sum + p.missedAttacks, 0)}
          </span>
        </span>
      </div>
    </Card>
  );
}
