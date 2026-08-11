interface StatusBadgeProps {
  status: "Optimal" | "Alert" | "Critical";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    Optimal: "bg-green-100 text-green-700",
    Alert: "bg-yellow-100 text-yellow-700",
    Critical: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}