"use client";

import { useState, useEffect } from "react";

interface Message {
  id: number;
  title: string;
  content: string;
  type: "announcement" | "reminder" | "grade" | "absence" | "general";
  read: boolean;
  createdAt: string;
  sender?: string;
}

const messageTypeConfig = {
  announcement: { emoji: "📢", color: "blue", label: "Announcement" },
  reminder: { emoji: "⏰", color: "yellow", label: "Reminder" },
  grade: { emoji: "📊", color: "green", label: "Grade" },
  absence: { emoji: "⚠️", color: "red", label: "Absence" },
  general: { emoji: "📬", color: "gray", label: "General" },
};

export default function MessagesView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/student/messages");

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load messages"
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/student/messages/${messageId}/read`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to mark message as read");
      }

      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error("Failed to mark message as read:", error);
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id);
    }
  };

  const filteredMessages =
    filter === "all"
      ? messages
      : filter === "unread"
      ? messages.filter((msg) => !msg.read)
      : messages.filter((msg) => msg.type === filter);

  const unreadCount = messages.filter((msg) => !msg.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-6">
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            🔔 Notifications
          </h2>
          <p className="text-gray-300">
            {unreadCount > 0
              ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-200"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          All ({messages.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          Unread ({unreadCount})
        </button>
        {Object.entries(messageTypeConfig).map(([type, config]) => {
          const count = messages.filter((msg) => msg.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {config.emoji} {config.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <p className="text-lg mb-2">📭 No messages</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredMessages.map((message) => {
                  const config = messageTypeConfig[message.type];
                  return (
                    <button
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={`w-full text-left p-4 hover:bg-white/10 transition-all duration-200 ${
                        !message.read ? "bg-blue-500/10" : ""
                      } ${
                        selectedMessage?.id === message.id ? "bg-white/15" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{config.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 bg-${config.color}-500/20 text-${config.color}-300 text-xs rounded-full`}
                            >
                              {config.label}
                            </span>
                            {!message.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <h3
                            className={`text-sm font-semibold mb-1 truncate ${
                              !message.read ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {message.title}
                          </h3>
                          <p className="text-xs text-gray-400 truncate mb-1">
                            {message.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          {selectedMessage ? (
            <>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">
                    {messageTypeConfig[selectedMessage.type].emoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 bg-${
                          messageTypeConfig[selectedMessage.type].color
                        }-500/20 text-${
                          messageTypeConfig[selectedMessage.type].color
                        }-300 text-sm rounded-full`}
                      >
                        {messageTypeConfig[selectedMessage.type].label}
                      </span>
                      {!selectedMessage.read && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedMessage.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {selectedMessage.sender && (
                        <span>From: {selectedMessage.sender}</span>
                      )}
                      <span>
                        {new Date(selectedMessage.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.content}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                  Reply
                </button>
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all duration-200">
                  Archive
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <span className="text-6xl mb-4">📬</span>
              <h3 className="text-xl font-semibold text-white mb-2">
                Select a notification
              </h3>
              <p className="text-gray-400">
                Choose a message from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
