"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/services/authApi";

export default function LoginPage({
  onLoginSuccess,
}: {
  onLoginSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login({ email, password }).unwrap();

      // Check if user role is admin
      if (result.user.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        return;
      }

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      onLoginSuccess();
      router.push("/");
    } catch (err: any) {
      setError(err.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex min-h-screen bg-gray-100 bg-cover bg-center items-center justify-center"
      style={{ backgroundImage: "url('/images/background2.jpg')" }}
    >
      <div className="bg-white/30 backdrop-blur-md p-10 rounded-xl shadow-xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="flex flex-col items-center">
            <img
              src="/ignot-logo.png"
              alt="Ignite Logo"
              className="h-16 w-auto"
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Admin Login
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white p-3 w-full rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-4 text-center">
          Forgot your password?{" "}
          <a href="#" className="text-indigo-600 hover:underline">
            Reset
          </a>
        </p>
      </div>
    </div>
  );
}
