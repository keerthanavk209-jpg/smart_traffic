import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from 'recharts';
import { RotateCw, BarChart3 } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';

export default function VisualPage() {
  const { incidents, loading, lastUpdated, refreshData } = useTrafficData();
  const [chartData, setChartData] = useState<any[]>([]);

  // Default fallback dataset (shown if no API data)
  const fallbackData = [
    { type: "Accident", count: 2 },
    { type: "Road Works", count: 2 },
    { type: "Traffic Jam", count: 1 },
    { type: "Lane Closed", count: 1 },
    { type: "Dangerous Conditions", count: 1 }
  ];

  useEffect(() => {
    if (incidents.length > 0) {
      const processed = incidents.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      setChartData(Object.entries(processed).map(([type, count]) => ({ type, count })));
    } else {
      setChartData(fallbackData);
    }
  }, [incidents]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-700" />
            <h1 className="text-3xl font-bold text-gray-900">Traffic Analytics — Karnataka</h1>
          </div>

          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <RotateCw className={`${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Last Updated */}
        <p className="text-gray-600 text-sm">
          Last Updated:{" "}
          <span className="font-semibold">{formatDateTime(lastUpdated)}</span>
        </p>

        {/* Chart Block */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Traffic Event Frequency</h2>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" angle={-15} textAnchor="middle" interval={0} style={{ fontSize: '12px' }} />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value} incidents`} />
              <Bar dataKey="count" fill="#2563eb" radius={[10, 10, 0, 0]}>
                <LabelList dataKey="count" position="top" style={{ fontWeight: 'bold', fontSize: '14px' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 text-center">
          This chart updates automatically when traffic changes from TomTom or Supabase.
        </div>
      </div>
    </div>
  );
}
