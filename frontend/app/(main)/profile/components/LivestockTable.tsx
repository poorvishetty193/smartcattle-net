import { Plus } from "lucide-react";
import { cattle } from "../data/cattle";
import StatusBadge from "./StatusBadge";

export default function LivestockTable() {
  return (
    <div>
      {/* Livestock Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Livestock Roster
        </h2>

        <button className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800">
          <Plus size={16} />
          Add Cow
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300 text-left">
              <th className="px-5 pb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Cow ID
              </th>

              <th className="px-5 pb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Breed
              </th>

              <th className="px-5 pb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-5 pb-2 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {cattle.map((cow) => (
              <tr
                key={cow.id}
                className="border-b border-gray-200 last:border-b-0"
              >
                <td className="px-5 py-3 text-sm font-medium text-gray-900">
                  {cow.id}
                </td>

                <td className="px-5 py-3 text-sm text-gray-700">
                  {cow.breed}
                </td>

                <td className="px-5 py-3">
                  <StatusBadge status={cow.status} />
                </td>

                <td className="px-5 py-3 text-right">
                  <button className="text-sm font-medium text-green-700 hover:underline">
                    Monitor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 text-center">
        <button className="text-sm font-semibold text-green-700 hover:underline">
          View All 482 Cattle
        </button>
      </div>
    </div>
  );
}