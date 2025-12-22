'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from 'recharts';
import { War } from '@/lib/types';
import { transformToStarsData, createChartLabel } from '@/lib/chart-utils';
import { colors } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { ChartSkeleton } from '@/components/ui/Skeleton';

interface StarsPerAttackChartProps {
  wars: War[];
  loading?: boolean;
}

export function StarsPerAttackChart({ wars, loading = false }: StarsPerAttackChartProps) {
  if (loading) {
    return (
      <Card>
        <ChartSkeleton />
      </Card>
    );
  }

  if (wars.length === 0) {
    return (
      <Card title="Average Stars Per Attack">
        <div className="flex items-center justify-center h-64 text-textMuted">
          No war data available. Start the data collector to begin tracking wars.
        </div>
      </Card>
    );
  }

  const data = transformToStarsData(wars).map(point => ({
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
          <p className="text-secondary text-sm">
            Avg Stars: <span className="font-semibold text-lg">{data.averageStars}</span>
          </p>
          <p className="text-textMuted text-sm">
            Total Attacks: {data.totalAttacks}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot with label
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={4} fill={colors.secondary} stroke={colors.background} strokeWidth={2} />
        <text
          x={cx}
          y={cy - 12}
          fill={colors.text}
          fontSize={12}
          textAnchor="middle"
          fontWeight="500"
        >
          {payload.averageStars}
        </text>
      </g>
    );
  };

  return (
    <Card title="Average Stars Per Attack">
      <div className="mb-3 flex items-center gap-2 text-sm text-textMuted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-secondary rounded-full" />
          <span>Your Performance</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <div className="w-8 h-0.5 bg-textMuted border-t-2 border-dashed" />
          <span>2.0 Benchmark</span>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 30, right: 30, left: 0, bottom: 60 }}
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
              domain={[0, 3]}
              ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]}
              tick={{ fill: colors.textMuted }}
              label={{
                value: 'Average Stars',
                angle: -90,
                position: 'insideLeft',
                style: { fill: colors.text, fontSize: 14 },
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.border }} />
            <ReferenceLine
              y={2.0}
              stroke={colors.textMuted}
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: 'Good (2.0)',
                position: 'right',
                fill: colors.textMuted,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="averageStars"
              stroke={colors.secondary}
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: colors.secondary }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
