"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProgressPoint } from "@/services/statsService";
import { formatDateAxis } from "@/utils/date";

/** 種目ごとの最大重量・推定1RMの推移グラフ */
export function WeightChart({ series }: { series: ProgressPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2a2a2e" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateAxis}
            tick={{ fill: "#8e8e93", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a2e" }}
            tickLine={false}
          />
          <YAxis
            unit=""
            tick={{ fill: "#8e8e93", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e21",
              border: "1px solid #2a2a2e",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: "#f5f5f7" }}
            labelFormatter={(label) =>
              typeof label === "string" ? formatDateAxis(label) : label
            }
            formatter={(value, name) => [`${value}kg`, name]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => <span style={{ color: "#8e8e93" }}>{value}</span>}
          />
          <Line
            name="最大重量"
            type="monotone"
            dataKey="maxWeight"
            stroke="#bfff00"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#bfff00", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            name="推定1RM"
            type="monotone"
            dataKey="est1rm"
            stroke="#ff9f0a"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
