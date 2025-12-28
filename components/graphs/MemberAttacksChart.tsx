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
  const [sortBy, setSortBy] = useState<'position' | 'attacks-high' | 'attacks-low'>('attacks-high');

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

  // Split members for mobile two-column view
  const completedMembers = ourMembers.filter(m => m.attacksUsed === 2);
  const incompleteMembers = ourMembers.filter(m => m.attacksUsed === 0 || m.attacksUsed === 1);

  // Calculate synchronized heights for mobile view
  const completedHeight = Math.max(300, completedMembers.length * 40);
  const incompleteHeight = Math.max(300, incompleteMembers.length * 40);
  const mobileHeight = Math.max(completedHeight, incompleteHeight);

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

  // Mobile chart column component
  interface MobileChartColumnProps {
    data: typeof ourMembers;
    title: string;
  }

  const MobileChartColumn = ({ data, title }: MobileChartColumnProps) => {
    // Custom tick renderer for mobile
    const renderMobileTick = (props: any) => {
      const { x, y, payload } = props;
      const member = data.find(m => m.name === payload.value);
      const isNonAttacker = member?.attacksUsed === 0;

      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={3}
            textAnchor="end"
            fill={isNonAttacker ? '#ff3b3b' : colors.textMuted}
            fontSize={9}
            fontWeight={isNonAttacker ? 600 : 400}
          >
            {payload.value}
          </text>
        </g>
      );
    };

    return (
      <div className="flex flex-col h-full">
        <h3 className="text-xs font-medium text-textMuted mb-2 text-center">
          {title} ({data.length})
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 10, left: 60, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              type="number"
              domain={[0, 2]}
              ticks={[0, 1, 2]}
              tick={{ fill: colors.textMuted, fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={renderMobileTick}
              width={55}
            />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.surface }} />
          <Bar dataKey="attacksUsed" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="attacksUsed" position="right" fill={colors.text} fontSize={10} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.attacksUsed)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    );
  };

  // Color bars based on attack count
  const getBarColor = (attacksUsed: number) => {
    if (attacksUsed === 0) return '#ef4444'; // Red for no attacks
    if (attacksUsed === 1) return colors.secondary; // Amber for 1 attack
    return colors.primary; // Emerald for 2 attacks
  };

  // Custom Y-axis tick to highlight non-attackers
  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    const member = ourMembers.find(m => m.name === payload.value);
    const isNonAttacker = member?.attacksUsed === 0;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill={isNonAttacker ? '#ff3b3b' : colors.textMuted}
          fontSize={11}
          fontWeight={isNonAttacker ? 600 : 400}
        >
          {payload.value}
        </text>
      </g>
    );
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
      {/* Desktop View - Single Column */}
      <div className="hidden md:block" style={{ height: Math.max(400, ourMembers.length * 40) }}>
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
              tick={renderCustomTick}
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
      {/* Mobile View - Two Columns */}
      <div className="block md:hidden" style={{ height: mobileHeight }}>
        {completedMembers.length === 0 ? (
          <div>
            <p className="text-center text-textMuted text-sm mb-3">
              No members have completed all attacks yet
            </p>
            <MobileChartColumn data={incompleteMembers} title="Incomplete" />
          </div>
        ) : incompleteMembers.length === 0 ? (
          <div>
            <p className="text-center text-primary text-sm mb-3 font-medium">
              All members completed their attacks!
            </p>
            <MobileChartColumn data={completedMembers} title="Completed" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 h-full">
            <MobileChartColumn data={completedMembers} title="Completed (2/2)" />
            <MobileChartColumn data={incompleteMembers} title="Incomplete (0-1/2)" />
          </div>
        )}
      </div>
    </Card>
  );
}
