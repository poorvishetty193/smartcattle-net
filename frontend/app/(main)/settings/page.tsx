"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [milkDrop, setMilkDrop] = useState(35);
  const [heatStress, setHeatStress] = useState(72);
  const [scc, setScc] = useState(60);
  const [priority, setPriority] = useState(85);

  return (
    <div className="min-h-screen bg-[#f5fbf5] text-[#171d1a]">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[82px] flex-col items-center border-r border-[#d8e1db] bg-white py-7">
        <div className="mb-12 text-3xl">🐄</div>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ⌂
        </button>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ♧
        </button>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ♢
        </button>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ◈
        </button>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ✦
        </button>

        <button className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-gray-500 hover:bg-[#e8f0e9]">
          ▤
        </button>

        <button className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#dff0e6] text-2xl text-[#008560]">
          ⚙
        </button>
      </aside>

      {/* TOP BAR */}
      <header className="fixed left-[82px] right-0 top-0 z-40 flex h-[82px] items-center border-b border-[#d8e1db] bg-white px-12">
        <div className="flex items-center gap-5">
          <span className="text-2xl font-extrabold text-[#008560]">
            SmartCattle Net
          </span>

          <span className="text-xl text-gray-400">/</span>

          <span className="text-xl font-semibold text-gray-600">
            Settings
          </span>
        </div>

        <div className="ml-auto flex items-center gap-9">
          <span className="text-2xl text-gray-500">◉</span>
          <span className="text-2xl text-gray-500">♨</span>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#008560] text-base font-bold text-white">
            SB
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="ml-[82px] pt-[82px]">
        <div className="w-full px-12 py-12">
          <div className="grid grid-cols-[300px_minmax(0,1fr)] gap-12">
            {/* SETTINGS MENU */}
            <nav className="sticky top-28 h-fit">
              <a
                href="#farm"
                className="mb-4 flex min-h-[64px] items-center rounded-xl bg-[#008560] px-6 text-lg font-bold text-white shadow-sm"
              >
                🏠
                <span className="ml-3">Farm profile</span>
              </a>

              <a
                href="#notifications"
                className="mb-4 flex min-h-[64px] items-center rounded-xl px-6 text-lg font-semibold text-gray-700 transition hover:bg-[#e8f0e9]"
              >
                ♢
                <span className="ml-3">Notifications</span>
              </a>

              <a
                href="#thresholds"
                className="mb-4 flex min-h-[64px] items-center rounded-xl px-6 text-lg font-semibold text-gray-700 transition hover:bg-[#e8f0e9]"
              >
                ⚙
                <span className="ml-3">Model thresholds</span>
              </a>

              <a
                href="#data"
                className="mb-4 flex min-h-[64px] items-center rounded-xl px-6 text-lg font-semibold text-gray-700 transition hover:bg-[#e8f0e9]"
              >
                ▣
                <span className="ml-3">Data & export</span>
              </a>

              <div className="my-9 h-px bg-[#d8e1db]" />

              <button className="flex min-h-[64px] w-full items-center rounded-xl px-6 text-left text-lg font-semibold text-red-600 hover:bg-red-50">
                ↪
                <span className="ml-3">Logout</span>
              </button>
            </nav>

            {/* RIGHT CONTENT */}
            <section className="min-w-0 space-y-10">
              {/* FARM PROFILE */}
              <div
                id="farm"
                className="overflow-hidden rounded-2xl border border-[#d8e1db] bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#dce4de] px-10 py-8">
                  <div>
                    <h2 className="text-3xl font-extrabold">
                      Farm profile
                    </h2>

                    <p className="mt-3 text-lg text-gray-500">
                      Basic information about your dairy farm.
                    </p>
                  </div>

                  <button className="rounded-xl px-6 py-4 text-lg font-bold text-[#008560] hover:bg-[#edf6ef]">
                    Edit details
                  </button>
                </div>

                <div className="grid min-h-[340px] grid-cols-2 gap-16 p-10">
                  <div className="flex flex-col justify-center gap-10">
                    <div>
                      <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gray-500">
                        FARM NAME
                      </p>

                      <p className="text-2xl font-bold">
                        Green Valley Precision Dairy
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-16">
                      <div>
                        <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gray-500">
                          HERD SIZE
                        </p>

                        <p className="text-xl font-semibold">1,250 Head</p>
                      </div>

                      <div>
                        <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gray-500">
                          TIMEZONE
                        </p>

                        <p className="text-xl font-semibold">
                          CST (UTC -6)
                        </p>
                      </div>
                    </div>

                    <p className="text-lg leading-8 text-gray-500">
                      📍 4428 County Road 12,
                      <br />
                      Spring Valley, WI 54767
                    </p>
                  </div>

                  <div className="relative min-h-[280px] overflow-hidden rounded-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
                      alt="Farm"
                      className="h-full w-full object-cover"
                    />

                    <span className="absolute bottom-6 right-6 rounded-xl bg-white px-5 py-3 text-sm font-bold shadow-lg">
                      MAP VIEW
                    </span>
                  </div>
                </div>
              </div>

              {/* MODEL THRESHOLDS */}
              <div
                id="thresholds"
                className="overflow-hidden rounded-2xl border border-[#d8e1db] bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#dce4de] px-10 py-8">
                  <div>
                    <h2 className="text-3xl font-extrabold">
                      Model thresholds
                    </h2>

                    <p className="mt-3 text-lg text-gray-500">
                      Tune the AI sensitivity for alerts and risk scoring.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setMilkDrop(35);
                      setHeatStress(72);
                      setScc(60);
                      setPriority(85);
                    }}
                    className="rounded-xl px-6 py-4 text-lg font-bold text-[#0060a8] hover:bg-blue-50"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-8 p-10">
                  <ThresholdBox
                    title="Milk drop alert"
                    value="-15%"
                    color="text-[#008560]"
                    description="Triggers when daily yield falls below rolling 7-day average."
                    range={milkDrop}
                    setRange={setMilkDrop}
                  />

                  <ThresholdBox
                    title="Heat stress THI"
                    value={`${heatStress} THI`}
                    color="text-[#ba1a1a]"
                    description="Temperature-Humidity Index threshold for heat intervention."
                    range={heatStress}
                    setRange={setHeatStress}
                  />

                  <ThresholdBox
                    title="SCC mastitis"
                    value={`${scc}k+`}
                    color="text-[#574eb1]"
                    description="Somatic Cell Count cutoff for predictive mastitis detection."
                    range={scc}
                    setRange={setScc}
                  />

                  <ThresholdBox
                    title="Priority score cutoff"
                    value={`${(priority / 10).toFixed(1)} / 10`}
                    color="text-[#0060a8]"
                    description="Global sensitivity for High Priority dashboard categorization."
                    range={priority}
                    setRange={setPriority}
                  />
                </div>

                <div className="border-t border-[#e3e9e4] bg-[#f1efff] px-10 py-6 text-lg leading-7 text-[#514a99]">
                  ✦ AI Thresholds are currently being auto-tuned based on
                  historical farm performance from the last 90 days.
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div
                id="notifications"
                className="overflow-hidden rounded-2xl border border-[#d8e1db] bg-white shadow-sm"
              >
                <div className="border-b border-[#dce4de] px-10 py-8">
                  <h2 className="text-3xl font-extrabold">
                    Notification preferences
                  </h2>

                  <p className="mt-3 text-lg text-gray-500">
                    Choose how you want to receive important farm alerts.
                  </p>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f1f5f1]">
                      <th className="px-10 py-6 text-left text-sm font-bold tracking-widest text-gray-500">
                        ALERT TYPE
                      </th>

                      <th className="px-10 py-6 text-center text-sm font-bold tracking-widest text-gray-500">
                        PUSH
                      </th>

                      <th className="px-10 py-6 text-center text-sm font-bold tracking-widest text-gray-500">
                        EMAIL
                      </th>

                      <th className="px-10 py-6 text-center text-sm font-bold tracking-widest text-gray-500">
                        SMS
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <NotificationRow
                      title="Critical Health Alerts"
                      push
                      email
                      sms
                    />

                    <NotificationRow
                      title="Daily Insight Reports"
                      email
                    />

                    <NotificationRow
                      title="Heat Detection Windows"
                      push
                    />
                  </tbody>
                </table>
              </div>

              {/* DATA MANAGEMENT */}
              <div
                id="data"
                className="overflow-hidden rounded-2xl border border-[#d8e1db] bg-white shadow-sm"
              >
                <div className="border-b border-[#dce4de] px-10 py-8">
                  <h2 className="text-3xl font-extrabold">
                    Data management
                  </h2>

                  <p className="mt-3 text-lg text-gray-500">
                    Manage your farm data and prediction runs.
                  </p>
                </div>

                <div className="flex items-center gap-14 p-10">
                  <div className="flex-1">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm font-bold tracking-widest text-gray-500">
                        CLOUD STORAGE USAGE
                      </span>

                      <span className="text-lg font-bold">
                        4.2 GB / 10 GB
                      </span>
                    </div>

                    <div className="h-5 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full w-[42%] rounded-full bg-[#0060a8]" />
                    </div>

                    <p className="mt-6 text-lg text-gray-500">
                      Last full prediction run:
                      <strong className="ml-2 text-gray-700">
                        Today, 04:30 AM
                      </strong>
                    </p>
                  </div>

                  <div className="flex gap-5">
                    <button className="rounded-xl border border-gray-300 bg-gray-100 px-8 py-5 text-lg font-bold text-gray-700 hover:bg-gray-200">
                      ↓ Export CSV
                    </button>

                    <button className="rounded-xl bg-[#008560] px-8 py-5 text-lg font-bold text-white hover:bg-[#006e4f]">
                      ↻ Re-run predictions
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="ml-[82px] flex h-16 items-center justify-between border-t border-[#d8e1db] bg-white px-12 text-base text-gray-500">
        <span>© 2024 SmartCattle AI • v2.4.0</span>

        <div className="flex gap-10">
          <span>Powered by AgriPredict</span>
          <span>API Status</span>
        </div>
      </footer>
    </div>
  );
}

/* THRESHOLD BOX */

function ThresholdBox({
  title,
  value,
  color,
  description,
  range,
  setRange,
}: {
  title: string;
  value: string;
  color: string;
  description: string;
  range: number;
  setRange: (value: number) => void;
}) {
  return (
    <div className="min-h-[230px] rounded-2xl border border-[#d8e1db] bg-[#fbfdfb] p-8 shadow-sm">
      <div className="mb-7 flex items-center justify-between">
        <span className="text-xl font-extrabold">{title}</span>

        <strong className={`text-xl ${color}`}>{value}</strong>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={range}
        onChange={(e) => setRange(Number(e.target.value))}
        className="h-4 w-full cursor-pointer accent-[#008560]"
      />

      <p className="mt-7 text-lg leading-7 text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* NOTIFICATION ROW */

function NotificationRow({
  title,
  push = false,
  email = false,
  sms = false,
}: {
  title: string;
  push?: boolean;
  email?: boolean;
  sms?: boolean;
}) {
  return (
    <tr className="border-t border-gray-100">
      <td className="px-10 py-8 text-xl font-semibold">{title}</td>

      <td className="text-center">
        <input
          type="checkbox"
          defaultChecked={push}
          className="h-6 w-6 accent-[#008560]"
        />
      </td>

      <td className="text-center">
        <input
          type="checkbox"
          defaultChecked={email}
          className="h-6 w-6 accent-[#008560]"
        />
      </td>

      <td className="text-center">
        <input
          type="checkbox"
          defaultChecked={sms}
          className="h-6 w-6 accent-[#008560]"
        />
      </td>
    </tr>
  );
}