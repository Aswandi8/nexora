"use client";

import type { DashboardActivityPoint } from "@nexora/contracts";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ShortlinkActivityChartProps {
  data: DashboardActivityPoint[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: DashboardActivityPoint & {
      label: string;
    };
  }>;
}

function formatDateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs text-muted-foreground">{point.label}</p>

      <p className="mt-1 text-sm font-medium text-popover-foreground">
        {point.count.toLocaleString()}{" "}
        {point.count === 1 ? "shortlink" : "shortlinks"}
      </p>
    </div>
  );
}

export function ShortlinkActivityChart({ data }: ShortlinkActivityChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatDateLabel(point.date),
  }));

  return (
    <div className="h-64 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 8,
            right: 8,
            bottom: 0,
            left: -20,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--border)"
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
            tickMargin={12}
          />

          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
            width={40}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "var(--border)",
              strokeDasharray: "3 3",
            }}
          />

          <Line
            type="monotone"
            dataKey="count"
            stroke="var(--brand-500)"
            strokeWidth={2}
            dot={{
              r: 3,
              fill: "var(--card)",
              stroke: "var(--brand-500)",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 5,
              fill: "var(--brand-500)",
              stroke: "var(--card)",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
