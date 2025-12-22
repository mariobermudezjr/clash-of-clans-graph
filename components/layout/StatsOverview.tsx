import React from 'react';
import { War } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface StatsOverviewProps {
  wars: War[];
  loading?: boolean;
}

export function StatsOverview({ wars, loading = false }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (wars.length === 0) {
    return null;
  }

  // Calculate overall statistics
  const totalWars = wars.length;
  const totalAttacks = wars.reduce((sum, war) => sum + war.clanStats.attacksUsed, 0);
  const totalStars = wars.reduce((sum, war) => sum + war.clanStats.totalStars, 0);
  const averageStarsPerAttack = totalAttacks > 0 ? (totalStars / totalAttacks).toFixed(2) : '0.00';

  // Calculate win rate (assuming we won if we got more stars than opponent)
  const wins = wars.filter(war => war.clanStats.totalStars > war.opponentStats.totalStars).length;
  const winRate = totalWars > 0 ? ((wins / totalWars) * 100).toFixed(1) : '0.0';

  const stats = [
    {
      label: 'Total Wars',
      value: totalWars,
      suffix: '',
      color: 'text-primary',
    },
    {
      label: 'Win Rate',
      value: winRate,
      suffix: '%',
      color: 'text-primary',
    },
    {
      label: 'Avg Stars/Attack',
      value: averageStarsPerAttack,
      suffix: '',
      color: 'text-secondary',
    },
    {
      label: 'Total Attacks',
      value: totalAttacks,
      suffix: '',
      color: 'text-text',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="text-textMuted text-sm font-medium mb-1">{stat.label}</div>
          <div className={`text-3xl font-semibold ${stat.color}`}>
            {stat.value}{stat.suffix}
          </div>
        </Card>
      ))}
    </div>
  );
}
