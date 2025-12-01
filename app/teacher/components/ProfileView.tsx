interface ProfileViewProps {
  userId?: string;
}

export default function ProfileView({ userId }: ProfileViewProps) {
  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-3">Profile</h3>
      <div className="p-4 bg-white/5 border border-white/20 rounded">
        <p className="text-sm text-gray-200">Profile details for {userId}</p>
      </div>
    </div>
  );
}
