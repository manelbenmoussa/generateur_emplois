interface DashboardViewProps {
  userName?: string | null;
}

export default function DashboardView({ userName }: DashboardViewProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Welcome, {userName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white/10 border border-white/20 rounded-lg">
          <h3 className="font-semibold text-white">Today's Classes</h3>
          <p className="text-sm text-gray-300">
            Quick view of today's schedule.
          </p>
        </div>
        <div className="p-6 bg-white/10 border border-white/20 rounded-lg">
          <h3 className="font-semibold text-white">Notifications</h3>
          <p className="text-sm text-gray-300">
            Latest messages and announcements.
          </p>
        </div>
        <div className="p-6 bg-white/10 border border-white/20 rounded-lg">
          <h3 className="font-semibold text-white">Stats</h3>
          <p className="text-sm text-gray-300">
            Assigned hours / availability.
          </p>
        </div>
      </div>
    </div>
  );
}
