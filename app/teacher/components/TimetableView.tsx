interface TimetableViewProps {
  userId?: string;
}

export default function TimetableView({ userId }: TimetableViewProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-3">My Timetable</h3>
      <div className="p-4 bg-white/5 border border-white/20 rounded">
        <p className="text-sm text-gray-200">
          Timetable content for user {userId}
        </p>
      </div>
    </div>
  );
}
