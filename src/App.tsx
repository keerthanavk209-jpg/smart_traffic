import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";   // <-- Added

import { Activity, RotateCw } from 'lucide-react';

import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import RoutePage from './pages/RoutePage';

import TrafficMap from './components/TrafficMap';
import TrafficTable from './components/TrafficTable';

import VisualPage from './pages/VisualPage';
import RegisterPage from "./pages/RegisterPage";  // <-- Added
import LoginPage from "./pages/LoginPage";        // <-- Added

import { useTrafficData } from './hooks/useTrafficData';

function TempVisual() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-white">
      <h1 className="text-3xl font-bold text-green-700">Visual Monitoring Coming Soon 🚦📡</h1>
    </div>
  );
}

function AppLayout() {   // <-- Wrapped your existing UI
  const [activeTab, setActiveTab] = useState<'home' | 'route' | 'alerts' | 'visual'>('home');

  const { incidents, districtTraffic: _districtTraffic, loading, lastUpdated, refreshData } = useTrafficData();

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'home' && <HomePage />}
      {activeTab === 'route' && <RoutePage />}

      {activeTab === 'alerts' && (
        <div className="min-h-screen bg-gray-50 flex">
          <div className="w-2/3 h-screen relative bg-gray-100">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading traffic data...</p>
                </div>
              </div>
            ) : (
              <TrafficMap incidents={incidents} />
            )}
          </div>

          <div className="w-1/3 h-screen bg-white shadow-xl flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8 text-red-600" />
                  <h1 className="text-2xl font-bold text-gray-900">Karnataka Traffic</h1>
                </div>
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <RotateCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <p className="text-sm text-gray-600">
                Last Updated: <span className="font-medium">{formatDateTime(lastUpdated)}</span>
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TrafficTable incidents={incidents} hasIncidents={incidents.length > 0} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'visual' && <VisualPage />}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ⬅ DEFAULT PAGE (Register FIRST SCREEN) */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* Authentication Pages */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Main Dashboard UI */}
        <Route path="/dashboard" element={<AppLayout />} />

      </Routes>
    </BrowserRouter>
  );
}
