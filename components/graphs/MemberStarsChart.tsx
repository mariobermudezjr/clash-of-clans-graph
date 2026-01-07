'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { War } from '@/lib/types';
import { colors } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { parseCoCTimestamp } from '@/lib/date-utils';

interface MemberStarsChartProps {
  wars: War[];
  loading?: boolean;
  isCWL?: boolean; // True for CWL wars (1 attack max = 3 stars max)
}

interface MemberStarsData {
  name: string;
  totalStars: number;
  attacksUsed: number;
  townhallLevel: number;
  mapPosition: number;
}

export function MemberStarsChart({ wars, loading = false, isCWL = false }: MemberStarsChartProps) {
  // Find the most recent war by date
  const getDefaultWarId = (wars: War[]): string => {
    if (wars.length === 0) return '';

    // Sort wars by endTime to find the most recent
    const sortedWars = [...wars].sort((a, b) => {
      const dateA = parseCoCTimestamp(a.endTime).getTime();
      const dateB = parseCoCTimestamp(b.endTime).getTime();
      return dateB - dateA; // Most recent first
    });

    return sortedWars[0].id;
  };

  // State for selected war and sort order
  const [selectedWarId, setSelectedWarId] = useState<string>(getDefaultWarId(wars));
  const [sortBy, setSortBy] = useState<'position' | 'stars-high' | 'stars-low'>('stars-high');

  // Update selected war when wars change
  React.useEffect(() => {
    if (wars.length > 0 && !selectedWarId) {
      setSelectedWarId(getDefaultWarId(wars));
    }
  }, [wars, selectedWarId]);

  const handleWarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarId(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'position' | 'stars-high' | 'stars-low');
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
      <Card title="Member Stars Earned">
        <div className="flex items-center justify-center h-64 text-textMuted">
          No wars available. Start the data collector to begin tracking wars.
        </div>
      </Card>
    );
  }

  const war = wars.find(w => w.id === selectedWarId) || wars[0];

  // Check if war has members data (older wars might not have this)
  if (!war.members || war.members.length === 0) {
    return (
      <Card title="Member Stars Earned">
        <div className="flex items-center justify-center h-64 text-textMuted">
          Member data not available for this war. Recollect war data to see member stars.
        </div>
      </Card>
    );
  }

  // Calculate stars earned per member
  let memberStarsData: MemberStarsData[] = war.members
    .filter(member => member.isOurClan)
    .map(member => {
      // Get all attacks by this member
      const memberAttacks = war.attacks.filter(attack =>
        attack.attackerTag === member.tag && attack.isOurClan
      );

      // Calculate total stars
      const totalStars = memberAttacks.reduce((sum, attack) => sum + attack.stars, 0);

      return {
        name: member.name,
        totalStars,
        attacksUsed: member.attacksUsed,
        townhallLevel: member.townhallLevel,
        mapPosition: member.mapPosition,
      };
    });

  // Sort based on selection
  if (sortBy === 'position') {
    memberStarsData = memberStarsData.sort((a, b) => a.mapPosition - b.mapPosition);
  } else if (sortBy === 'stars-high') {
    memberStarsData = memberStarsData.sort((a, b) => b.totalStars - a.totalStars || a.mapPosition - b.mapPosition);
  } else if (sortBy === 'stars-low') {
    memberStarsData = memberStarsData.sort((a, b) => a.totalStars - b.totalStars || a.mapPosition - b.mapPosition);
  }

  if (memberStarsData.length === 0) {
    return (
      <Card title="Member Stars Earned">
        <div className="flex items-center justify-center h-64 text-textMuted">
          No member data available for this war.
        </div>
      </Card>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text font-medium mb-1">{data.name}</p>
          <p className="text-textMuted text-sm mb-1">
            Town Hall Level: {data.townhallLevel}
          </p>
          <p className="text-textMuted text-sm mb-1">
            Position: #{data.mapPosition}
          </p>
          <p className="text-primary text-sm">
            Total Stars: <span className="font-semibold">{data.totalStars}</span>
          </p>
          <p className="text-textMuted text-sm">
            Attacks Used: {data.attacksUsed}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine max value for X-axis
  // CWL: 1 attack * 3 stars = 3 max
  // Regular wars: 2 attacks * 3 stars = 6 max
  const defaultMax = isCWL ? 3 : 6;
  const maxStars = Math.max(...memberStarsData.map(m => m.totalStars), defaultMax);

  return (
    <Card title="Member Stars Earned">
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Select War"
          options={wars.map(w => ({
            value: w.id,
            label: `${w.opponentName} (${parseCoCTimestamp(w.endTime).toLocaleDateString()})`,
          }))}
          value={selectedWarId}
          onChange={handleWarChange}
        />
        <Select
          label="Sort Members By"
          options={[
            { value: 'position', label: 'Map Position' },
            { value: 'stars-high', label: 'Most Stars First' },
            { value: 'stars-low', label: 'Least Stars First' },
          ]}
          value={sortBy}
          onChange={handleSortChange}
        />
      </div>
      <div style={{ height: Math.max(400, memberStarsData.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={memberStarsData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              type="number"
              domain={[0, maxStars]}
              tick={{ fill: colors.textMuted }}
              label={{
                value: 'Stars Earned',
                position: 'insideBottom',
                offset: -10,
                style: { fill: colors.text, fontSize: 14 },
              }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: colors.textMuted, fontSize: 11 }}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.surface }} />
            <Bar dataKey="totalStars" fill={colors.secondary} radius={[0, 4, 4, 0]}>
              <LabelList dataKey="totalStars" position="right" fill={colors.text} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
