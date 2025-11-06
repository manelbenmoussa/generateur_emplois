import RoomsCRUD from "./components/RoomsCRUD";

export default async function RoomsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Rooms Management
          </h1>
          <p className="text-gray-300">
            Manage your school rooms and their capacities
          </p>
        </div>

        <RoomsCRUD />
      </div>
    </div>
  );
}
