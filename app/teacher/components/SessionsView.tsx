interface SessionsViewProps {
  userId?: string;
}

export default function SessionsView({ userId }: SessionsViewProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-3">My Sessions</h3>
      <div className="p-4 bg-white/5 border border-white/20 rounded">
        <p className="text-sm text-gray-200">List of sessions for {userId}</p>
      </div>
    </div>
  );
}
