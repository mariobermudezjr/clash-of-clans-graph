'use client';

import React, { useEffect, useState } from 'react';
import { War } from '@/lib/types';
import { LeagueWar } from '@/lib/league-types';
import { Header } from './layout/Header';
import { StatsOverview } from './layout/StatsOverview';
import { AttacksPerWarChart } from './graphs/AttacksPerWarChart';
import { StarsPerAttackChart } from './graphs/StarsPerAttackChart';
import { MemberAttacksChart } from './graphs/MemberAttacksChart';
import { MemberStarsChart } from './graphs/MemberStarsChart';
import { AttackPredictionCard } from './graphs/AttackPredictionCard';
import { Card } from './ui/Card';
import { TabNavigation } from './ui/TabNavigation';
import { LeagueWarsDashboard } from './LeagueWarsDashboard';

function DashboardContent() {
  const [wars, setWars] = useState<War[]>([]);
  const [leagueWars, setLeagueWars] = useState<LeagueWar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);
  const [cwlLastUpdated, setCwlLastUpdated] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('league-wars');

  // Fetch wars and league wars from API
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);

        // Fetch both regular wars and league wars in parallel
        const [warsResponse, leagueResponse] = await Promise.all([
          fetch('/api/wars'),
          fetch('/api/league-wars'),
        ]);

        const warsData = await warsResponse.json();
        const leagueData = await leagueResponse.json();

        if (warsData.success) {
          setWars(warsData.wars);
          setLastUpdated(warsData.stats?.lastUpdated);
        } else {
          setError(warsData.error || 'Failed to fetch wars');
        }

        if (leagueData.success) {
          setLeagueWars(leagueData.wars || []);
        }
        // Don't set error for league wars - they may not exist yet
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch war data');
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Fetch CWL data for lastUpdated timestamp
  useEffect(() => {
    async function fetchCWLData() {
      try {
        const response = await fetch('/api/league-wars');
        const data = await response.json();

        if (data.success && data.stats) {
          setCwlLastUpdated(data.stats.lastUpdated);
        }
      } catch (err) {
        console.error('Error fetching CWL data:', err);
      }
    }

    fetchCWLData();
  }, []);

  // Get clan name from first war
  const clanName = wars.length > 0 ? wars[0].clanName : undefined;

  // Error state
  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header lastUpdated={lastUpdated} cwlLastUpdated={cwlLastUpdated} activeTab={activeTab} />
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-text mb-2">Error Loading Data</h2>
            <p className="text-textMuted mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state (no wars collected yet)
  if (!loading && wars.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header clanName={clanName} lastUpdated={lastUpdated} cwlLastUpdated={cwlLastUpdated} activeTab={activeTab} />
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-text mb-2">No Wars Yet</h2>
            <p className="text-textMuted mb-2 text-center max-w-md">
              No war data has been collected yet. Start the data collector to begin tracking your clan&apos;s wars.
            </p>
            <div className="bg-surface border border-border rounded-lg p-4 mt-6 max-w-xl">
              <p className="text-sm text-textMuted mb-2">To start collecting data, run:</p>
              <code className="block bg-background px-3 py-2 rounded text-primary text-sm">
                npm run scheduler
              </code>
              <p className="text-xs text-textMuted mt-3">
                The scheduler will automatically collect war data when wars end and check daily at 9 AM.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Header clanName={clanName} lastUpdated={lastUpdated} cwlLastUpdated={cwlLastUpdated} activeTab={activeTab} />

      <TabNavigation defaultTab="league-wars" onTabChange={setActiveTab}>
        {(currentTab) => (
          <>
            {currentTab === 'stats' && (
              <div className="py-6">
                <StatsOverview wars={wars} loading={loading} />
              </div>
            )}

            {currentTab === 'graphs' && (
              <div className="space-y-6 py-6">
                <MemberAttacksChart wars={wars} loading={loading} />
                <MemberStarsChart wars={wars} loading={loading} />
                <AttacksPerWarChart wars={wars} loading={loading} />
                <StarsPerAttackChart wars={wars} loading={loading} />
              </div>
            )}

            {currentTab === 'league-wars' && (
              <LeagueWarsDashboard />
            )}

            {activeTab === 'predictions' && (
              <div className="py-6">
                <AttackPredictionCard
                  regularWars={wars}
                  leagueWars={leagueWars}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </TabNavigation>

      {wars.length > 0 && (
        <div className="mt-8 mb-4 text-center text-xs text-textMuted">
          Total wars tracked: {wars.length}
        </div>
      )}
    </div>
  );
}

export function ClientDashboard() {
  return <DashboardContent />;
}
