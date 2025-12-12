import { useEffect, useState } from "react";
import { AlertTriangle, Clock, MapPin } from "lucide-react";

interface AlertItem {
  id: number;
  type: string;
  location: string;
  time: string;
  severity: "low" | "medium" | "high";
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 1,
      type: "Accident Reported",
      location: "NH 48 - Bengaluru Highway",
      time: "2 min ago",
      severity: "high",
    },
    {
      id: 2,
      type: "Heavy Traffic",
      location: "Mysuru Outer Ring Road",
      time: "8 min ago",
      severity: "medium",
    },
    {
      id: 3,
      type: "Road Blocked",
      location: "MG Road - Bengaluru",
      time: "15 min ago",
      severity: "high",
    },
    {
      id: 4,
      type: "Signal Failure",
      location: "Hebbal Flyover",
      time: "20 min ago",
      severity: "low",
    },
  ]);

  // OPTIONAL: Simulated automatic alert updates every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert: AlertItem = {
        id: Date.now(),
        type: "Emergency Vehicle Incoming",
        location: "Koramangala 4th Block",
        time: "Just now",
        severity: "high",
      };

      setAlerts((prev) => [newAlert, ...prev]);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Severity Color Logic
  const severityColor = (level: string) => {
    switch (level) {
      case "high":
        return "border-red-600 bg-red-50 text-red-700";
      case "medium":
        return "border-yellow-500 bg-yellow-50 text-yellow-700";
      case "low":
        return "border-green-600 bg-green-50 text-green-700";
      default:
        return "border-gray-300 bg-gray-100";
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <h1 className="text-3xl font-semibold text-red-600 mb-6 flex items-center gap-2">
        🚨 Live Traffic Alerts
      </h1>

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-xl border-l-8 shadow-md flex items-start justify-between ${severityColor(
              alert.severity
            )}`}
          >
            <div>
              <p className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 text-red-500" />
                {alert.type}
              </p>

              <p className="flex items-center gap-2 text-gray-700 mt-1">
                <MapPin className="w-4" /> {alert.location}
              </p>

              <p className="flex items-center gap-2 text-sm mt-1 text-gray-500">
                <Clock className="w-4" /> {alert.time}
              </p>
            </div>

            {/* Severity Badge */}
            <span
              className={`ml-4 text-xs font-bold px-3 py-1 rounded-full uppercase ${
                alert.severity === "high"
                  ? "bg-red-600 text-white"
                  : alert.severity === "medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-600 text-white"
              }`}
            >
              {alert.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
