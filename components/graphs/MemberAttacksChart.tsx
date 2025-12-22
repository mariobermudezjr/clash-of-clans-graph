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
  Cell,
} from 'recharts';
import { War } from '@/lib/types';
import { colors } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import { Select } from '@/components/ui/Select';
import { parseCoCTimestamp } from '@/lib/date-utils';

interface MemberAttacksChartProps {
  wars: War[];
  loading?: boolean;
}

export function MemberAttacksChart({ wars, loading = false }: MemberAttacksChartProps) {
  // State for selected war and sort order
  const [selectedWarId, setSelectedWarId] = useState<string>(wars.length > 0 ? wars[0].id : '');
  const [sortBy, setSortBy] = useState<'position' | 'attacks-high' | 'attacks-low'>('attacks-high');

  // Update selected war when wars change
  React.useEffect(() => {
    if (wars.length > 0 && !selectedWarId) {
      setSelectedWarId(wars[0].id);
    }
  }, [wars, selectedWarId]);

  const handleWarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedWarId(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'position' | 'attacks-high' | 'attacks-low');
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
      <Card title="Member Attack Participation">
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
      <Card title="Member Attack Participation">
        <div className="flex items-center justify-center h-64 text-textMuted">
          Member data not available for this war. Recollect war data to see member participation.
        </div>
      </Card>
    );
  }

  // Filter to only show our clan members
  let ourMembers = war.members
    .filter(member => member.isOurClan)
    .map(member => ({
      name: member.name,
      attacksUsed: member.attacksUsed,
      townhallLevel: member.townhallLevel,
      mapPosition: member.mapPosition,
    }));

  // Sort based on selection
  if (sortBy === 'position') {
    ourMembers = ourMembers.sort((a, b) => a.mapPosition - b.mapPosition);
  } else if (sortBy === 'attacks-high') {
    ourMembers = ourMembers.sort((a, b) => b.attacksUsed - a.attacksUsed || a.mapPosition - b.mapPosition);
  } else if (sortBy === 'attacks-low') {
    ourMembers = ourMembers.sort((a, b) => a.attacksUsed - b.attacksUsed || a.mapPosition - b.mapPosition);
  }

  if (ourMembers.length === 0) {
    return (
      <Card title="Member Attack Participation">
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
            Attacks Used: <span className="font-semibold">{data.attacksUsed}</span> / 2
          </p>
        </div>
      );
    }
    return null;
  };

  // Color bars based on attack count
  const getBarColor = (attacksUsed: number) => {
    if (attacksUsed === 0) return '#ef4444'; // Red for no attacks
    if (attacksUsed === 1) return colors.secondary; // Amber for 1 attack
    return colors.primary; // Emerald for 2 attacks
  };

  return (
    <Card title="Member Attack Participation">
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
            { value: 'attacks-high', label: 'Most Attacks First' },
            { value: 'attacks-low', label: 'Least Attacks First' },
          ]}
          value={sortBy}
          onChange={handleSortChange}
        />
      </div>
      <div className="mb-4 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.primary }}></div>
          <span className="text-textMuted">2 attacks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: colors.secondary }}></div>
          <span className="text-textMuted">1 attack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-textMuted">0 attacks</span>
        </div>
      </div>
      <div style={{ height: Math.max(400, ourMembers.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ourMembers}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              type="number"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tick={{ fill: colors.textMuted }}
              label={{
                value: 'Attacks Used',
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
            <Bar dataKey="attacksUsed" radius={[0, 4, 4, 0]}>
              <LabelList dataKey="attacksUsed" position="right" fill={colors.text} fontSize={12} />
              {ourMembers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.attacksUsed)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
