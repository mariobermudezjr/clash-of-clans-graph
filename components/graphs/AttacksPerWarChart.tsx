'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { War } from '@/lib/types';
import { transformToAttacksData, createChartLabel } from '@/lib/chart-utils';
import { colors } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';

interface AttacksPerWarChartProps {
  wars: War[];
  loading?: boolean;
}

export function AttacksPerWarChart({ wars, loading = false }: AttacksPerWarChartProps) {
  if (loading) {
    return (
      <Card>
        <ChartSkeleton />
      </Card>
    );
  }

  if (wars.length === 0) {
    return (
      <Card title="Attacks Per War">
        <div className="flex items-center justify-center h-64 text-textMuted">
          No war data available. Start the data collector to begin tracking wars.
        </div>
      </Card>
    );
  }

  const data = transformToAttacksData(wars).map(point => ({
    ...point,
    label: createChartLabel(point.opponentName, point.warEndTime),
    name: point.opponentName,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-text font-medium mb-1">{data.name}</p>
          <p className="text-textMuted text-sm mb-1">
            {new Date(data.warEndTime).toLocaleDateString()}
          </p>
          <p className="text-primary text-sm">
            Attacks Used: <span className="font-semibold">{data.attacksUsed}</span>
          </p>
          <p className="text-textMuted text-sm">
            Available: {data.attacksAvailable}
          </p>
          <p className="text-secondary text-sm mt-1">
            Usage Rate: <span className="font-semibold">{data.usageRate.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title="Attacks Per War">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey="label"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: colors.textMuted, fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: colors.textMuted }}
              label={{
                value: 'Number of Attacks',
                angle: -90,
                position: 'insideLeft',
                style: { fill: colors.text, fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.surface }} />
            <Bar dataKey="attacksAvailable" fill={colors.border} name="Available" radius={[4, 4, 0, 0]} />
            <Bar dataKey="attacksUsed" fill={colors.primary} name="Used" radius={[4, 4, 0, 0]}>
              <LabelList dataKey="attacksUsed" position="top" fill={colors.text} fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
