import React from "react";
import Card from "../Card";

interface DeleteModalProps {
  open: boolean;
  actionLoading: boolean;
  actionError: string | null;
  onDelete: () => void;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  actionLoading,
  actionError,
  onDelete,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 bg-opacity-90 backdrop-blur-sm">
      <div className="flex items-center justify-center w-full min-h-screen">
        <Card className="border border-white/20 shadow-2xl rounded-2xl p-0 bg-white/95">
          <div className="p-10">
            <h3 className="text-2xl font-bold mb-8 text-blue-900">
              Delete Session?
            </h3>
            {actionError && (
              <div className="text-red-600 mb-5 text-sm font-medium">
                {actionError}
              </div>
            )}
            <div className="flex gap-4 mt-8 justify-end">
              <button
                onClick={onDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 shadow"
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 text-blue-900 rounded-lg font-semibold hover:bg-gray-200 border border-blue-200 shadow"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeleteModal;
