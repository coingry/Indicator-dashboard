"use client";

type MetricCardProps = {
  label: string;
  value: string | number | null | undefined;
  sub?: string;
  badge?: string;
  cardKey?: string;
};

export default function MetricCard({
  label,
  value,
  sub,
  badge,
  cardKey,
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between bg-white text-black p-4 rounded-lg shadow-md h-full">
      <div className="flex items-center justify-center">
        <div className="text-sm/5 font-semibold">{label}</div>
        {badge && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {badge}
          </span>
        )}
      </div>

      <div
        className={`mt-1 font-bold tabular-nums ${
          cardKey === "oi" ? "text-sm" : "text-xl"
        }`}
      >
        {value ?? "N/A"}
      </div>
      {sub && (
        <div
          className="mt-1 text-xs opacity-90 leading-snug"
          dangerouslySetInnerHTML={{ __html: sub }}
        />
      )}
    </div>
  );
}
