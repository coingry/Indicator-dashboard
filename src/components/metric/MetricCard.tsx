"use client";

type MetricCardProps = {
  label: string;
  value: string | number | null | undefined;
  sub?: string;
};

export default function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-md">
      <div className="text-sm/5 font-semibold">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">
        {value ?? "N/A"}
      </div>
      {sub && <div className="mt-1 text-xs opacity-90">{sub}</div>}
    </div>
  );
}
