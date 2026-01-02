'use client';

import React, { useEffect, useState } from 'react';
import { LeagueWar } from '@/lib/league-types';
import { War } from '@/lib/types';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { MemberAttacksChart } from './graphs/MemberAttacksChart';
import { MemberStarsChart } from './graphs/MemberStarsChart';
import { AttacksPerWarChart } from './graphs/AttacksPerWarChart';
import { StarsPerAttackChart } from './graphs/StarsPerAttackChart';

function LeagueWarsDashboardContent() {
  const [leagueWars, setLeagueWars] = useState<LeagueWar[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch league wars from API
  useEffect(() => {
    async function fetchLeagueWars() {
      try {
        setLoading(true);
        const response = await fetch('/api/league-wars');
        const data = await response.json();

        if (data.success) {
          setLeagueWars(data.wars);
          // Set most recent season as default
          if (data.seasons.length > 0) {
            setSelectedSeason(data.seasons[0].season);
          }
        } else {
          setError(data.error || 'Failed to fetch league wars');
        }
      } catch (err) {
        console.error('Error fetching league wars:', err);
        setError('Failed to fetch league war data');
      } finally {
        setLoading(false);
      }
    }

    fetchLeagueWars();
  }, []);

  // Error state
  if (error && !loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-text mb-2">Error Loading CWL Data</h2>
          <p className="text-textMuted mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  // Empty state
  if (!loading && leagueWars.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-semibold text-text mb-2">No CWL Data Yet</h2>
          <p className="text-textMuted mb-2 text-center max-w-md">
            No CWL data has been collected yet. The scheduler will automatically collect CWL data during days 1-8 of each month.
          </p>
          <div className="bg-surface border border-border rounded-lg p-4 mt-6 max-w-xl">
            <p className="text-sm text-textMuted mb-2">CWL data is collected:</p>
            <ul className="text-xs text-textMuted space-y-1 list-disc list-inside">
              <li>Every 6 hours on days 1-8 of each month</li>
              <li>Automatically when the scheduler is running</li>
              <li>Includes all 7 rounds of CWL wars</li>
            </ul>
            <p className="text-xs text-textMuted mt-4">
              To manually collect CWL data, run: <code className="bg-background px-2 py-1 rounded">npx tsx scripts/league-collector.ts</code>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Get unique seasons from league wars
  const seasons = Array.from(new Set(leagueWars.map(w => w.season))).sort().reverse();

  // Filter wars by selected season
  const filteredWars = selectedSeason
    ? leagueWars.filter(w => w.season === selectedSeason)
    : leagueWars;

  // Convert LeagueWar[] to War[] for chart compatibility
  // LeagueWar extends/matches War structure, so we map the fields
  const warsForCharts: War[] = filteredWars.map(lw => ({
    id: lw.id,
    clanTag: lw.clanTag,
    clanName: lw.clanName,
    opponentTag: lw.opponentTag,
    opponentName: `${lw.opponentName} (Round ${lw.roundNumber})`, // Add round number to opponent name
    teamSize: lw.teamSize,
    state: lw.state,
    preparationStartTime: lw.preparationStartTime,
    startTime: lw.startTime,
    endTime: lw.endTime,
    collectedAt: lw.collectedAt,
    clanStats: lw.clanStats,
    opponentStats: lw.opponentStats,
    members: lw.members,
    attacks: lw.attacks,
  }));

  // Calculate season statistics
  const seasonWins = filteredWars.filter(w => w.clanStats.totalStars > w.opponentStats.totalStars).length;
  const seasonLosses = filteredWars.filter(w => w.clanStats.totalStars < w.opponentStats.totalStars).length;
  const seasonTies = filteredWars.filter(w => w.clanStats.totalStars === w.opponentStats.totalStars).length;

  return (
    <div className="space-y-6 py-6">
      {/* Season Selector and Stats */}
      <Card title="Clan War League Data">
        <div className="mb-4">
          <Select
            label="Select CWL Season"
            options={seasons.map(season => ({
              value: season,
              label: season,
            }))}
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          />
        </div>

        {/* Season Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Wars Played</div>
            <div className="text-2xl font-bold text-text">{filteredWars.length}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Wins</div>
            <div className="text-2xl font-bold text-green-500">{seasonWins}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Losses</div>
            <div className="text-2xl font-bold text-red-500">{seasonLosses}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3">
            <div className="text-xs text-textMuted mb-1">Ties</div>
            <div className="text-2xl font-bold text-yellow-500">{seasonTies}</div>
          </div>
        </div>

        <div className="text-sm text-textMuted mt-4">
          <p>
            CWL consists of 7 rounds, with each clan playing up to 7 wars total. Wars are played with 1 attack per member.
          </p>
        </div>
      </Card>

      {/* Reuse existing chart components */}
      <MemberAttacksChart wars={warsForCharts} loading={loading} isCWL={true} />
      <MemberStarsChart wars={warsForCharts} loading={loading} />
      <AttacksPerWarChart wars={warsForCharts} loading={loading} />
      <StarsPerAttackChart wars={warsForCharts} loading={loading} />

      {filteredWars.length > 0 && (
        <div className="text-center text-xs text-textMuted">
          Total CWL wars tracked: {leagueWars.length} across {seasons.length} season(s)
        </div>
      )}
    </div>
  );
}

export function LeagueWarsDashboard() {
  return <LeagueWarsDashboardContent />;
}
