type StatsCardProps = {
  title: string;
  value: string;
  icon: string;
  bgColor: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  bgColor,
}: StatsCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl shadow-lg p-6`}>
      <div className="text-4xl">{icon}</div>

      <h3 className="mt-4 text-gray-700 text-sm font-semibold">
        {title}
      </h3>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}