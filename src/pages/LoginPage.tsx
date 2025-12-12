import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    if (!form.email || !form.password)
      return Swal.fire("Missing Info", "Please fill both fields", "warning");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      Swal.fire("Login Failed", error.message, "error");
    } else {
      Swal.fire({
        icon: "success",
        title: "Login Successful 🎉",
        text: "Redirecting to dashboard...",
        timer: 2000,
        showConfirmButton: false,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <LogIn className="text-green-600 h-10 w-10 mr-3" />
          <h1 className="text-3xl font-bold">Login</h1>
        </div>

        <div className="space-y-4">
          <input
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Login
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-700 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
