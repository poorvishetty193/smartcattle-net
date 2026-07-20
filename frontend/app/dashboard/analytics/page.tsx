"use client";

const cows = [
  {
    id: "Cow #05",
    score: 94,
    issue: "Mastitis Alert",
    action: "Dispatch Vet",
  },
  {
    id: "Cow #22",
    score: 76,
    issue: "Reduced Feed Intake",
    action: "Adjust Feed",
  },
  {
    id: "Cow #18",
    score: 68,
    issue: "Thermal Stress",
    action: "Activate Fan",
  },
  {
    id: "Cow #41",
    score: 52,
    issue: "Late Pregnancy",
    action: "Monitor",
  },
];

export default function Analytics() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b">
        <h2 className="text-xl font-bold">High Priority Attention Ranking</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Cow</th>

              <th className="text-left p-4">Score</th>

              <th className="text-left p-4">Issue</th>

              <th className="text-left p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {cows.map((cow) => (
              <tr key={cow.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-semibold">{cow.id}</td>

                <td className="p-4 text-red-600 font-bold">{cow.score}</td>

                <td className="p-4">{cow.issue}</td>

                <td className="p-4">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    {cow.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
