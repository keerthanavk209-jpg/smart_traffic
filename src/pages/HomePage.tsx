import { Car, Radio, Network, Zap, Shield, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Traffic Routing Using VANETs
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Vehicular Ad-hoc Networks for Intelligent Transportation Systems
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Overview</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This project implements an intelligent traffic routing system powered by Vehicular Ad-hoc Networks (VANETs).
            By leveraging real-time vehicle-to-vehicle (V2V) and vehicle-to-infrastructure (V2I) communication,
            the system optimizes traffic flow, reduces congestion, and improves overall road safety.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            The system combines cutting-edge computer vision technology using YOLO (You Only Look Once) object detection
            for real-time traffic analysis with dynamic routing algorithms that adapt to current road conditions,
            ensuring the most efficient path selection for all vehicles in the network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">V2V Communication</h3>
            <p className="text-gray-600">
              Vehicles exchange information directly with each other, sharing traffic conditions,
              speed data, and potential hazards in real-time.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Radio className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">V2I Communication</h3>
            <p className="text-gray-600">
              Infrastructure nodes provide vehicles with traffic light status, road conditions,
              and optimal routing suggestions based on network-wide data.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Network className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Dynamic Routing</h3>
            <p className="text-gray-600">
              Advanced algorithms process network data to calculate optimal routes,
              adapting to changing traffic patterns and road conditions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Detection</h3>
            <p className="text-gray-600">
              YOLO-based object detection analyzes traffic video feeds to identify vehicles,
              pedestrians, and obstacles with high accuracy and speed.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Safety First</h3>
            <p className="text-gray-600">
              Enhanced road safety through collision avoidance warnings,
              emergency vehicle prioritization, and hazard notifications.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
            <div className="bg-cyan-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Traffic Optimization</h3>
            <p className="text-gray-600">
              Reduce congestion and travel time by distributing traffic across optimal routes
              based on real-time network conditions.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6">Key Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">For Drivers</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Reduced travel time and fuel consumption</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Enhanced safety through collision warnings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Real-time traffic updates and route suggestions</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">For Cities</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Reduced traffic congestion and emissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Improved emergency response times</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-300 mr-2">•</span>
                  <span>Data-driven infrastructure planning</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
