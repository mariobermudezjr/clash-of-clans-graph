'use client';

import React, { useEffect, useState } from 'react';
import { War } from '@/lib/types';
import { Header } from './layout/Header';
import { StatsOverview } from './layout/StatsOverview';
import { AttacksPerWarChart } from './graphs/AttacksPerWarChart';
import { StarsPerAttackChart } from './graphs/StarsPerAttackChart';
import { MemberAttacksChart } from './graphs/MemberAttacksChart';
import { MemberStarsChart } from './graphs/MemberStarsChart';
import { Card } from './ui/Card';
import { TabNavigation } from './ui/TabNavigation';
import { LeagueWarsDashboard } from './LeagueWarsDashboard';

function DashboardContent() {
  const [wars, setWars] = useState<War[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined);

  // Fetch wars from API
  useEffect(() => {
    async function fetchWars() {
      try {
        setLoading(true);
        const response = await fetch('/api/wars');
        const data = await response.json();

        if (data.success) {
          setWars(data.wars);
          setLastUpdated(data.stats?.lastUpdated);
        } else {
          setError(data.error || 'Failed to fetch wars');
        }
      } catch (err) {
        console.error('Error fetching wars:', err);
        setError('Failed to fetch war data');
      } finally {
        setLoading(false);
      }
    }

    fetchWars();
  }, []);

  // Get clan name from first war
  const clanName = wars.length > 0 ? wars[0].clanName : undefined;

  // Error state
  if (error && !loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <Header lastUpdated={lastUpdated} />
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
        <Header clanName={clanName} lastUpdated={lastUpdated} />
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
      <Header clanName={clanName} lastUpdated={lastUpdated} />

      <TabNavigation defaultTab="league-wars">
        {(activeTab) => (
          <>
            {activeTab === 'stats' && (
              <div className="py-6">
                <StatsOverview wars={wars} loading={loading} />
              </div>
            )}

            {activeTab === 'graphs' && (
              <div className="space-y-6 py-6">
                <MemberAttacksChart wars={wars} loading={loading} />
                <MemberStarsChart wars={wars} loading={loading} />
                <AttacksPerWarChart wars={wars} loading={loading} />
                <StarsPerAttackChart wars={wars} loading={loading} />
              </div>
            )}

            {activeTab === 'league-wars' && (
              <LeagueWarsDashboard />
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
