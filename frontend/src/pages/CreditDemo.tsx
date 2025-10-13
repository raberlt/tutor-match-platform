import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const CreditDemo: React.FC = () => {
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [topUpDescription, setTopUpDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load credit balance
  const loadCreditBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credit/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.balance || 0);
      }
    } catch (error) {
      console.error("Error loading credit balance:", error);
    }
  };

  // Handle top up
  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      setError("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/credit/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(topUpAmount),
          description: topUpDescription || "Nạp tín dụng demo",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(
          `Nạp tín dụng thành công! Số dư mới: ${result.newBalance.toLocaleString()} VNĐ`
        );
        setCreditBalance(result.newBalance);
        setTopUpAmount("");
        setTopUpDescription("");
      } else {
        setError(result.message || "Nạp tín dụng thất bại");
      }
    } catch (error) {
      setError("Có lỗi xảy ra khi nạp tín dụng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCreditBalance();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập để sử dụng chức năng này
          </h1>
          <a
            href="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h1 className="text-2xl font-bold text-gray-900">
              💳 Demo Nạp Tín Dụng
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Mô phỏng chức năng nạp tiền vào tài khoản tín dụng
            </p>
          </div>

          <div className="p-6">
            {/* Current Balance */}
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">
                      Số dư hiện tại
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {creditBalance.toLocaleString()} VNĐ
                    </p>
                  </div>
                  <button
                    onClick={loadCreditBalance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Top Up Form */}
            <form onSubmit={handleTopUp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền nạp (VNĐ)
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập số tiền muốn nạp"
                  min="1000"
                  step="1000"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Số tiền tối thiểu: 1,000 VNĐ
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn nhanh
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[50000, 100000, 200000, 500000, 1000000, 2000000].map(
                    (amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setTopUpAmount(amount.toString())}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      >
                        {amount.toLocaleString()}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  type="text"
                  value={topUpDescription}
                  onChange={(e) => setTopUpDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả cho giao dịch này"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={
                    loading || !topUpAmount || parseFloat(topUpAmount) < 1000
                  }
                  className="px-6 py-2 text-white rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium transition-all duration-200"
                  style={{ backgroundColor: "rgb(148, 204, 230)" }}
                >
                  {loading ? "Đang nạp..." : "Nạp tín dụng"}
                </button>
              </div>
            </form>

            {/* User Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Thông tin người dùng:
              </h4>
              <p className="text-sm text-gray-600">
                <strong>Tên:</strong> {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Vai trò:</strong> {user.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditDemo;

