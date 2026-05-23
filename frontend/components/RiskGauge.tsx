"use client";

import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";

type RiskGaugeProps = {
  value: number;
};

export function RiskGauge({ value }: RiskGaugeProps) {
  const color = value >= 75 ? "#EF4444" : value >= 45 ? "#F59E0B" : "#10B981";
  const data = [{ name: "risk", value, fill: color }];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="95%" data={data} startAngle={215} endAngle={-35}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={22} animationDuration={900} />
          <text x="50%" y="49%" textAnchor="middle" dominantBaseline="middle" className="fill-veil-text text-5xl font-semibold">
            {Math.round(value)}
          </text>
          <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="fill-veil-muted text-xs uppercase tracking-[0.22em]">
            Trust risk
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
