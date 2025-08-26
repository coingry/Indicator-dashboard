"use client";

type MetricCardProps = {
  label: string;
  value: string | number | null | undefined;
  sub?: string;
};

export default function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-lg shadow-sm">
      <div className="text-sm/5 font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">
        {value ?? "N/A"}
      </div>
      {sub && <div className="mt-1 text-xs opacity-90">{sub}</div>}
    </div>
  );
}
