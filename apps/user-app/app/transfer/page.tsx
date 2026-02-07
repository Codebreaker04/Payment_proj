"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function TransferPage() {
  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverId || !amount) {
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }

    if (parseFloat(amount) <= 0) {
      setMessage({ type: "error", text: "Amount must be greater than 0" });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // In real app, get token from session
      const mockToken = "mock-jwt-token";

      const result = await api.sendP2PTransaction(
        {
          receiverId,
          amount: parseFloat(amount),
          description,
          idempotencyKey: `txn-${Date.now()}-${Math.random()}`,
        },
        mockToken,
      );

      if (result.success) {
        setMessage({
          type: "success",
          text: "Transfer successful!",
        });
        setReceiverId("");
        setAmount("");
        setDescription("");
      } else {
        setMessage({
          type: "error",
          text: result.message || "Transfer failed",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Send Money</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="receiverId"
              className="block text-sm font-medium mb-2"
            >
              Recipient User ID *
            </label>
            <input
              id="receiverId"
              type="text"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter recipient user ID"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount ($) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's this for?"
              rows={3}
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? "Processing..." : "Send Money"}
          </button>
        </form>
      </div>
    </div>
  );
}
