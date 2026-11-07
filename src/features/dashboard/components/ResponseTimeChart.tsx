"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "../types";

interface ResponseTimeChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function ResponseTimeChart({
  data,
  height = 240,
}: ResponseTimeChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(150, 150, 150, 0.15)"
            vertical={false}
          />
          <XAxis
            dataKey="time"
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-popover p-2.5 shadow-md text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      Time: {label}
                    </p>
                    <p className="text-blue-500 font-mono">
                      Latency: {payload[0].value} ms
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#latencyGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
