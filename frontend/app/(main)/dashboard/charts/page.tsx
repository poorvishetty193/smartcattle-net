"use client";

const cows = [
  { id: "C01", score: 92 },
  { id: "C02", score: 88 },
  { id: "C03", score: 64 },
  { id: "C04", score: 81 },
  { id: "C05", score: 42 },
  { id: "C06", score: 95 },
  { id: "C07", score: 86 },
  { id: "C08", score: 72 },
  { id: "C09", score: 58 },
  { id: "C10", score: 91 },
  { id: "C11", score: 74 },
  { id: "C12", score: 49 },
  { id: "C13", score: 83 },
  { id: "C14", score: 89 },
  { id: "C15", score: 69 },
  { id: "C16", score: 36 },
  { id: "C17", score: 80 },
  { id: "C18", score: 66 },
  { id: "C19", score: 90 },
  { id: "C20", score: 54 },
  { id: "C21", score: 78 },
  { id: "C22", score: 45 },
  { id: "C23", score: 97 },
  { id: "C24", score: 84 },
  { id: "C25", score: 73 },
  { id: "C26", score: 60 },
  { id: "C27", score: 82 },
  { id: "C28", score: 39 },
  { id: "C29", score: 87 },
  { id: "C30", score: 76 },
  { id: "C31", score: 55 },
  { id: "C32", score: 91 },
  { id: "C33", score: 68 },
  { id: "C34", score: 47 },
  { id: "C35", score: 94 },
  { id: "C36", score: 70 },
  { id: "C37", score: 63 },
  { id: "C38", score: 81 },
  { id: "C39", score: 57 },
  { id: "C40", score: 99 },
  { id: "C41", score: 52 },
  { id: "C42", score: 77 },
  { id: "C43", score: 65 },
  { id: "C44", score: 40 },
  { id: "C45", score: 93 },
  { id: "C46", score: 85 },
  { id: "C47", score: 71 },
  { id: "C48", score: 59 },
];

function getColor(score: number) {
  if (score >= 80) return "bg-green-600";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default function Charts() {
  
 return (
  <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">

    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

      <h2 className="text-xl font-bold text-gray-800">
        Herd Productivity Heatmap
      </h2>

      <div className="flex gap-5 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-600"></div>
          <span>80–100</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span>50–79</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span>0–49</span>
        </div>

      </div>

    </div>

    <div className="p-6">

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">

        {cows.map((cow) => (

          <div
            key={cow.id}
            className={`${getColor(cow.score)} rounded-xl text-white h-20 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm`}
          >

            <span className="text-xs opacity-80">
              {cow.id}
            </span>

            <span className="text-lg font-bold">
              {cow.score}
            </span>

          </div>

        ))}

      </div>

    </div>

  </section>
);
}