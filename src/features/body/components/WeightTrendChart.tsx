"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BodyMetric } from "@/types";
import { formatDateAxis } from "@/utils/date";

/** 体重推移の折れ線グラフ（日付昇順） */
export function WeightTrendChart({ metrics }: { metrics: BodyMetric[] }) {
  const data = [...metrics]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, weightKg: m.weightKg }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="#2a2a2e" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateAxis}
            tick={{ fill: "#8e8e93", fontSize: 11 }}
            axisLine={{ stroke: "#2a2a2e" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#8e8e93", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 1", "dataMax + 1"]}
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
            formatter={(value) => [`${value}kg`, "体重"]}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#bfff00"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#bfff00", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
