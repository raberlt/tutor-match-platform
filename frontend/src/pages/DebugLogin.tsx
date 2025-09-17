import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export const DebugLogin: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "/api/auth/login", // Sử dụng proxy
        {
          username: "student2@gmail.com",
          password: "123456",
        }
      );

      setResult({
        success: true,
        data: response.data,
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Login API</h1>

        {/* Current User Info */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current User Info:</h2>
          <p>
            <strong>Authenticated:</strong> {isAuthenticated ? "Yes" : "No"}
          </p>
          {user && (
            <div>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
              <p>
                <strong>First Name:</strong> {user.firstName || "N/A"}
              </p>
              <p>
                <strong>Last Name:</strong> {user.lastName || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {user.email || "N/A"}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Login API"}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
