import FarmUpdateCard from "./components/FarmUpdateCard";
import LivestockTable from "./components/LivestockTable";
import PrivacyCard from "./components/PrivacyCard";
import ProfileCard from "./components/ProfileCard";
import ProfileTabs from "./components/ProfileTabs";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#f5f4f1] px-6 py-4">
      <div className="mx-auto max-w-[1100px]">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            <ProfileCard />
            <PrivacyCard />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* My Cows + Livestock Roster */}
            <div className="overflow-hidden rounded-2xl border border-gray-300 bg-white">
              <ProfileTabs />
              <LivestockTable />
            </div>

            {/* Latest Farm Update */}
            <FarmUpdateCard />
          </div>
        </div>
      </div>
    </div>
  );
}