interface HeaderProps {
  total?: number;
}

export default function Header({ total = 48 }: HeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-3xl font-bold text-gray-900">
        All cows
      </h1>

      <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-sm font-medium">
        {total} total
      </span>
    </div>
  );
}