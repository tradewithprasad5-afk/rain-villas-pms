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
    <div
      className={`
        ${bgColor}
        rounded-2xl
        shadow-md
        hover:shadow-xl
        transition-all
        duration-300
        p-5
        sm:p-6
        min-h-[160px]
        flex
        flex-col
        justify-between
      `}
    >
      <div className="text-3xl sm:text-4xl">
        {icon}
      </div>

      <div>
        <h3 className="mt-4 text-sm font-medium text-gray-600">
          {title}
        </h3>

        <h2 className="mt-2 text-2xl sm:text-3xl font-bold break-words">
          {value}
        </h2>
      </div>
    </div>
  );
}