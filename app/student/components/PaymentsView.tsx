"use client";

import { useState, useEffect } from "react";

interface PaymentsViewProps {
  userId?: string;
}

interface Payment {
  id: number;
  amount: string;
  description: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
}

interface Summary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function PaymentsView({ userId }: PaymentsViewProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/payments");
      const data = await response.json();

      setPayments(data.payments);
      setSummary(data.summary);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading payments...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          Payments & Fees 💳
        </h2>
        <p className="text-gray-300">Invoices and payment records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
          <h3 className="text-gray-300 text-sm font-medium mb-2">
            Total Amount
          </h3>
          <p className="text-3xl font-bold text-white">
            ${summary.totalAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-500/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-6">
          <h3 className="text-green-200 text-sm font-medium mb-2">Paid</h3>
          <p className="text-3xl font-bold text-green-300">
            ${summary.paidAmount.toFixed(2)}
          </p>
        </div>
        <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-500/30 rounded-xl p-6">
          <h3 className="text-yellow-200 text-sm font-medium mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-300">
            ${summary.pendingAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Payment History
        </h3>
        {payments.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No payment records</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white/5 border border-white/10 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {payment.description}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      ${payment.amount}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        payment.status === "PAID"
                          ? "bg-green-500/20 text-green-300"
                          : payment.status === "OVERDUE"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
                {payment.paidDate && (
                  <div className="text-sm text-green-300">
                    ✓ Paid on {new Date(payment.paidDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
