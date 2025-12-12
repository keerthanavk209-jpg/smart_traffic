import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "../lib/supabase";
import { Car } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    vehicleId: "",
    vehicleName: "",
  });

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.vehicleId || !form.vehicleName) {
      return Swal.fire("Missing Fields", "All fields are required!", "warning");
    }

    setLoading(true);

    try {
      // 1️⃣ Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      // 2️⃣ Store vehicle record linked to user
      const { error: dbError } = await supabase.from("vehicles").insert({
        vehicle_id: form.vehicleId,
        speed: 0,
        direction: 0,
        status: "active",
        current_location: "(0,0)",
      });

      if (dbError) throw dbError;

      Swal.fire({
        icon: "success",
        title: "Registration Successful 🎉",
        text: "You can now login!",
      });

      setForm({ email: "", password: "", vehicleId: "", vehicleName: "" });
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <Car className="text-blue-600 h-10 w-10 mr-3" />
          <h1 className="text-3xl font-bold">Register Vehicle</h1>
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

          <input
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="Vehicle ID (ex: KA-09-MH-4582)"
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          />

          <input
            className="w-full px-4 py-3 rounded-lg border"
            placeholder="Vehicle Name (ex: Scorpio N / Creta / Bus etc.)"
            value={form.vehicleName}
            onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
          />

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered?{" "}
          <a href="/login" className="text-blue-700 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
