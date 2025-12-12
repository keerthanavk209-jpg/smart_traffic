interface NavigationProps {
  activeTab: 'home' | 'route' | 'alerts' | 'visual';  // <-- Added visual here
  onTabChange: (tab: 'home' | 'route' | 'alerts' | 'visual') => void; // <-- Updated function type
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Project Title */}
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-700 tracking-wide">
              VANET Traffic System
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">

            <button
              onClick={() => onTabChange('home')}
              className={`px-3 py-2 border-b-2 text-sm font-medium transition duration-200 ${
                activeTab === 'home'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onTabChange('route')}
              className={`px-3 py-2 border-b-2 text-sm font-medium transition duration-200 ${
                activeTab === 'route'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              Route
            </button>

            {/* 🚨 Existing Tab: Live Alerts */}
            <button
              onClick={() => onTabChange('alerts')}
              className={`px-3 py-2 border-b-2 text-sm font-medium transition duration-200 ${
                activeTab === 'alerts'
                  ? 'border-red-500 text-red-600 font-semibold'
                  : 'border-transparent text-gray-600 hover:border-red-300 hover:text-red-600'
              }`}
            >
              Traffic
            </button>

            {/* 🆕 NEW TAB: Visual Monitoring */}
            <button
              onClick={() => onTabChange('visual')}
              className={`px-3 py-2 border-b-2 text-sm font-medium transition duration-200 ${
                activeTab === 'visual'
                  ? 'border-green-500 text-green-700 font-semibold'
                  : 'border-transparent text-gray-600 hover:border-green-300 hover:text-green-700'
              }`}
            >
              Visual
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}
