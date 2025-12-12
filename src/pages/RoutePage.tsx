import { useState, useEffect } from 'react';
import {
  Radio,
  Navigation,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  Zap,
  Trash2,
  CloudRain,
  Sun,
  Wind,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Vehicle {
  id: string;
  vehicle_id: string;
  current_location: string;
  speed: number;
  direction: number;
  status: string;
}

interface InfrastructureNode {
  id: string;
  node_id: string;
  node_type: string;
  location: string;
  status: string;
  metadata: any;
}

interface RouteInfo {
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  trafficDensity: number;
}

interface WeatherApiResponse {
  weather?: { main?: string; description?: string }[];
  main?: { temp?: number; humidity?: number };
  wind?: { speed?: number };
  name?: string;
}

export default function RoutePage() {
  const [activeTab, setActiveTab] = useState<'v2v' | 'v2i' | 'route'>('v2v');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [infrastructureNodes, setInfrastructureNodes] = useState<InfrastructureNode[]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const [v2vForm, setV2vForm] = useState({
    senderId: '',
    receiverId: '',
    messageType: 'traffic_update',
    content: '',
  });

  const [routeForm, setRouteForm] = useState({
    vehicleId: '',
  });

  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [destinationQuery, setDestinationQuery] = useState('');

  // NEW: toggle for using live location and start place input
  const [useLiveLocation, setUseLiveLocation] = useState(true);
  const [startQuery, setStartQuery] = useState('');

  // Weather states
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    loadVehicles();
    loadInfrastructureNodes();
    detectCurrentLocation();
  }, []);

  // When we have a current location, fetch weather for it
  useEffect(() => {
    if (currentLocation?.lat && currentLocation?.lng) {
      fetchWeather(currentLocation.lat, currentLocation.lng);
    }
  }, [currentLocation]);

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadInfrastructureNodes = async () => {
    try {
      const { data, error } = await supabase
        .from('infrastructure_nodes')
        .select('*')
        .eq('status', 'online')
        .limit(10);

      if (error) throw error;
      setInfrastructureNodes(data || []);
    } catch (error) {
      console.error('Error loading infrastructure nodes:', error);
    }
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let address: string | undefined = undefined;

        try {
          const key =
            import.meta.env.VITE_OPENCAGE_API_KEY ||
            'e2e4ae2d3a9544f5bd5b8dcda2e6da90';
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${key}`
          );
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            address = data.results[0].formatted;
          }
        } catch (err) {
          console.error('Error reverse geocoding current location:', err);
        }

        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          address,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting current location:', error);
        alert('Failed to get current location. Please allow location access in your browser.');
        setIsLocating(false);
      }
    );
  };

  const fetchWeather = async (lat: number, lng: number) => {
    try {
      setIsWeatherLoading(true);
      setWeatherError(null);

      const key =
        import.meta.env.VITE_WEATHER_API_KEY || '215e7c4cdbb9fe2d891ff850e020fc16';

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${key}`
      );
      const data: WeatherApiResponse & { cod?: number; message?: string } = await res.json();

      if (data.cod && data.cod !== 200) {
        console.error('Weather API error:', data);
        setWeatherError(data.message || 'Failed to fetch weather data');
        setWeatherData(null);
      } else {
        setWeatherData(data);
      }
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setWeatherError('Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (error) throw error;

      setVehicles((prev) => prev.filter((v) => v.vehicle_id !== vehicleId));

      alert('Vehicle removed successfully!');
    } catch (error) {
      console.error('Error removing vehicle:', error);
      alert('Failed to remove vehicle');
    }
  };

  const handleSendV2VMessage = async () => {
    if (!v2vForm.senderId || !v2vForm.content) {
      alert('Please fill in sender and message content');
      return;
    }

    try {
      const { error } = await supabase.from('v2v_messages').insert({
        sender_vehicle_id: v2vForm.senderId,
        receiver_vehicle_id: v2vForm.receiverId || null,
        message_type: v2vForm.messageType,
        content: { message: v2vForm.content },
        // you can optionally use currentLocation here if you want live coords
        location: `(40.7589,-73.9851)`,
      });

      if (error) throw error;

      alert('V2V message sent successfully!');
      setV2vForm({ ...v2vForm, content: '' });
    } catch (error) {
      console.error('Error sending V2V message:', error);
      alert('Failed to send message');
    }
  };

  // *** UPDATED: demo vehicles are stored in Supabase and reflected in local state ***
  const handleAddDemoVehicle = async () => {
    try {
      const demoVehiclePayload = {
        vehicle_id: `VH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        current_location: `(${(40.7 + Math.random() * 0.1).toFixed(
          4
        )},${(-74 + Math.random() * 0.1).toFixed(4)})`,
        speed: Math.floor(Math.random() * 60) + 20,
        direction: Math.floor(Math.random() * 360),
        status: 'active',
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(demoVehiclePayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setVehicles((prev) => [data as Vehicle, ...prev]);
      }

      alert('Demo vehicle added and stored in the database.');
    } catch (error) {
      console.error('Error adding demo vehicle:', error);
      alert('Failed to add demo vehicle.');
    }
  };

  // Derive road condition text from weather
  const getRoadConditionText = (): string => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]?.main) {
      return 'Weather data not available for route advisory.';
    }

    const main = weatherData.weather[0].main.toLowerCase();

    if (main.includes('rain')) return '⚠ Slippery roads detected – reduce speed and maintain distance.';
    if (main.includes('snow')) return '❄ Snowy conditions – use caution, braking distance increased.';
    if (main.includes('fog')) return '🌫 Low visibility – use fog lights and drive slowly.';
    if (main.includes('storm') || main.includes('thunder'))
      return '⛈ Storm conditions – avoid unnecessary travel if possible.';
    if (main.includes('clear')) return '✔ Clear skies – normal driving conditions.';
    if (main.includes('cloud')) return '☁ Cloudy – standard caution recommended.';

    return '🚗 Standard route conditions – drive safely.';
  };

  const handleCalculateRoute = async () => {
    if (!routeForm.vehicleId) {
      alert('Please select a vehicle');
      return;
    }

    if (!destinationQuery.trim()) {
      alert('Please enter a destination place name');
      return;
    }

    if (useLiveLocation) {
      if (!currentLocation) {
        alert('Current location not available. Please enable location and try again.');
        return;
      }
    } else {
      if (!startQuery.trim()) {
        alert('Please enter a start place');
        return;
      }
    }

    setIsCalculating(true);

    try {
      const key =
        import.meta.env.VITE_OPENCAGE_API_KEY ||
        'e2e4ae2d3a9544f5bd5b8dcda2e6da90';

      // 1) Determine origin (either live location or geocoded start place)
      let originLat: number;
      let originLng: number;
      let originFormatted: string;

      if (useLiveLocation && currentLocation) {
        originLat = currentLocation.lat;
        originLng = currentLocation.lng;
        originFormatted =
          currentLocation.address ||
          `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
      } else {
        const startRes = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            startQuery
          )}&key=${key}`
        );
        const startData = await startRes.json();

        if (!startData.results || startData.results.length === 0) {
          alert('Start place not found. Please enter a valid start location.');
          setIsCalculating(false);
          return;
        }

        originLat = startData.results[0].geometry.lat;
        originLng = startData.results[0].geometry.lng;
        originFormatted = startData.results[0].formatted;
      }

      // 2) Geocode destination
      const geoRes = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          destinationQuery
        )}&key=${key}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert('Destination not found. Please enter a valid place name.');
        setIsCalculating(false);
        return;
      }

      const destLat = geoData.results[0].geometry.lat;
      const destLng = geoData.results[0].geometry.lng;
      const destFormatted: string = geoData.results[0].formatted;

      // 3) Call backend function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-route`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicle_id: routeForm.vehicleId,
            origin: { lat: originLat, lng: originLng },
            destination: { lat: destLat, lng: destLng },
          }),
        }
      );

      const result = await response.json();

      // 4) Update UI route info
      setRouteInfo({
        origin: originFormatted,
        destination: destFormatted || destinationQuery,
        distance: result.distance || 0,
        estimatedTime: result.estimated_time || 0,
        trafficDensity: result.traffic_density || 0,
      });

      // 5) Store in Supabase
      const { error } = await supabase.from('routes').insert({
        vehicle_id: routeForm.vehicleId,
        origin: `(${originLat},${originLng})`,
        destination: `(${destLat},${destLng})`,
        waypoints: result.waypoints || [],
        distance: result.distance || 0,
        estimated_time: result.estimated_time || 0,
        traffic_density: result.traffic_density || 0,
        status: 'active',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Failed to calculate route. Make sure the backend function is deployed.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">VANET Routing System</h1>
          <p className="text-lg text-gray-600">
            Vehicle-to-Vehicle and Vehicle-to-Infrastructure Communication
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('v2v')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'v2v'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Car className="h-5 w-5 inline-block mr-2" />
              V2V Communication
            </button>
            <button
              onClick={() => setActiveTab('v2i')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'v2i'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Radio className="h-5 w-5 inline-block mr-2" />
              V2I Communication
            </button>
            <button
              onClick={() => setActiveTab('route')}
              className={`flex-1 py-4 px-6 font-semibold text-center transition-colors ${
                activeTab === 'route'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Navigation className="h-5 w-5 inline-block mr-2" />
              Route Calculation
            </button>
          </div>

          <div className="p-8">
            {/* ========== V2V TAB ========== */}
            {activeTab === 'v2v' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Vehicle-to-Vehicle (V2V) Communication
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Send messages directly between vehicles to share traffic information, hazard warnings, and route data.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Send V2V Message</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sender Vehicle
                          </label>
                          <select
                            value={v2vForm.senderId}
                            onChange={(e) =>
                              setV2vForm({ ...v2vForm, senderId: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select sender vehicle</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.vehicle_id} (Speed: {v.speed} km/h)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Receiver Vehicle (Optional - leave empty for broadcast)
                          </label>
                          <select
                            value={v2vForm.receiverId}
                            onChange={(e) =>
                              setV2vForm({ ...v2vForm, receiverId: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Broadcast to all</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.vehicle_id}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Message Type
                          </label>
                          <select
                            value={v2vForm.messageType}
                            onChange={(e) =>
                              setV2vForm({ ...v2vForm, messageType: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="traffic_update">Traffic Update</option>
                            <option value="hazard_warning">Hazard Warning</option>
                            <option value="route_share">Route Share</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Message Content
                          </label>
                          <textarea
                            value={v2vForm.content}
                            onChange={(e) =>
                              setV2vForm({ ...v2vForm, content: e.target.value })
                            }
                            rows={4}
                            placeholder="Enter your message..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <button
                          onClick={handleSendV2VMessage}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Active Vehicles</h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-blue-600">
                            {vehicles.length}
                          </span>
                          <button
                            onClick={handleAddDemoVehicle}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
                          >
                            Add Demo Vehicle
                          </button>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">
                                  {vehicle.vehicle_id}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleRemoveVehicle(vehicle.vehicle_id)
                                    }
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                                    title="Remove vehicle"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <span className="text-sm text-green-600 font-semibold">
                                    {vehicle.status}
                                  </span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Speed: {vehicle.speed} km/h</div>
                                <div>Direction: {vehicle.direction}°</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-6">
                        <div className="flex items-start">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold mb-1">V2V Protocol</p>
                            <p>
                              V2V communication uses DSRC (Dedicated Short-Range Communications) or C-V2X
                              technology to enable real-time information exchange between vehicles within
                              a 300-500 meter range.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== V2I TAB ========== */}
            {activeTab === 'v2i' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Vehicle-to-Infrastructure (V2I) Communication
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Infrastructure nodes provide vehicles with traffic light status, road conditions, and routing information.
                  </p>

                  {/* Weather-based route condition */}
                  <div className="bg-blue-50 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        Weather-Based Route Condition
                      </h3>
                      {currentLocation && (
                        <button
                          onClick={() =>
                            fetchWeather(currentLocation.lat, currentLocation.lng)
                          }
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Refresh Weather
                        </button>
                      )}
                    </div>

                    {isWeatherLoading && (
                      <p className="text-gray-500 text-sm">
                        Fetching live weather data for your current route area...
                      </p>
                    )}

                    {!isWeatherLoading && weatherError && (
                      <p className="text-red-600 text-sm">{weatherError}</p>
                    )}

                    {!isWeatherLoading && !weatherError && !weatherData && (
                      <p className="text-gray-500 text-sm">
                        Weather data not available yet. Make sure location is enabled.
                      </p>
                    )}

                    {!isWeatherLoading && !weatherError && weatherData && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <Sun className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-gray-900">
                            {weatherData.main?.temp !== undefined
                              ? `${weatherData.main.temp.toFixed(1)}°C`
                              : '--'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Temperature</p>
                        </div>

                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <CloudRain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-gray-900">
                            {weatherData.weather?.[0]?.main || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {weatherData.weather?.[0]?.description || 'Condition'}
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                          <Wind className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-lg font-semibold text-gray-900">
                            {weatherData.wind?.speed !== undefined
                              ? `${weatherData.wind.speed} km/h`
                              : '--'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Wind Speed</p>
                        </div>

                        <div className="bg-green-100 rounded-lg p-4 md:col-span-1 flex items-center justify-center text-center shadow-sm">
                          <p className="text-sm font-semibold text-gray-800">
                            🚦 {getRoadConditionText()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Existing V2I infrastructure cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {infrastructureNodes.map((node) => (
                      <div
                        key={node.id}
                        className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-blue-100 rounded-full p-3">
                            <Radio className="h-6 w-6 text-blue-600" />
                          </div>
                          <span
                            className={`text-sm font-semibold px-3 py-1 rounded-full ${
                              node.status === 'online'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {node.node_id}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-semibold min-w-[80px]">Type:</span>
                            <span className="capitalize">
                              {node.node_type.replace('_', ' ')}
                            </span>
                          </div>
                          {node.metadata && Object.keys(node.metadata).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              {Object.entries(node.metadata).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between"
                                >
                                  <span className="capitalize">
                                    {key.replace('_', ' ')}:
                                  </span>
                                  <span className="font-semibold">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {infrastructureNodes.length === 0 && (
                    <div className="text-center py-12">
                      <Radio className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No infrastructure nodes available</p>
                    </div>
                  )}

                  <div className="mt-8 bg-green-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      V2I Infrastructure Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Real-time Traffic Light Status
                          </p>
                          <p className="text-sm text-gray-600">
                            Optimize speed to hit green lights
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Road Condition Updates
                          </p>
                          <p className="text-sm text-gray-600">
                            Weather, construction, and hazards
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Parking Availability
                          </p>
                          <p className="text-sm text-gray-600">
                            Real-time parking spot information
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Zap className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            Emergency Alerts
                          </p>
                          <p className="text-sm text-gray-600">
                            Instant notifications from authorities
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========== ROUTE TAB ========== */}
            {activeTab === 'route' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Smart Route Calculation
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Calculate optimal routes using real-time VANET data and traffic information from the network.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Route Parameters
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Vehicle
                          </label>
                          <select
                            value={routeForm.vehicleId}
                            onChange={(e) =>
                              setRouteForm({ ...routeForm, vehicleId: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select a vehicle</option>
                            {vehicles.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.vehicle_id}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Origin card with toggle */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <MapPin className="h-5 w-5 text-green-600 mr-2" />
                              <span className="font-semibold text-gray-900">
                                Current Location (Origin)
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-600">
                                  Use Live Location
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setUseLiveLocation((prev) => {
                                      const next = !prev;
                                      if (next) {
                                        setStartQuery('');
                                      }
                                      return next;
                                    })
                                  }
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    useLiveLocation ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                      useLiveLocation ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                              <button
                                onClick={detectCurrentLocation}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                              >
                                Refresh
                              </button>
                            </div>
                          </div>

                          {useLiveLocation ? (
                            <p className="text-xs text-gray-500 mb-2">
                              Using your live GPS location as the route start point.
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mb-2">
                              Live location is not used. Enter a custom start place below.
                            </p>
                          )}

                          {isLocating && (
                            <p className="text-sm text-gray-500">
                              Detecting your current location...
                            </p>
                          )}
                          {!isLocating && currentLocation && (
                            <div className="text-sm text-gray-700">
                              {currentLocation.address && (
                                <p className="mb-1">{currentLocation.address}</p>
                              )}
                              <p>
                                {currentLocation.lat.toFixed(4)},{' '}
                                {currentLocation.lng.toFixed(4)}
                              </p>
                            </div>
                          )}
                          {!isLocating && !currentLocation && (
                            <p className="text-sm text-gray-500">
                              Location not available. Please allow location access and click
                              Refresh.
                            </p>
                          )}
                        </div>

                        {/* NEW: Start Place input */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Place
                            {useLiveLocation && (
                              <span className="ml-2 text-xs font-normal text-gray-500">
                                (Disabled while using live location)
                              </span>
                            )}
                          </label>
                          <input
                            type="text"
                            value={startQuery}
                            onChange={(e) => setStartQuery(e.target.value)}
                            placeholder={
                              useLiveLocation
                                ? 'Turn off "Use Live Location" to enter a custom start point'
                                : 'e.g., Bengaluru Railway Station, Shimla Mall Road'
                            }
                            disabled={useLiveLocation}
                            className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              useLiveLocation
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400'
                                : 'border-gray-300 bg-white'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Destination Place Name
                          </label>
                          <input
                            type="text"
                            value={destinationQuery}
                            onChange={(e) => setDestinationQuery(e.target.value)}
                            placeholder="e.g., Manali Bus Stand, Shimla Mall Road"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <button
                          onClick={handleCalculateRoute}
                          disabled={isCalculating}
                          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                            isCalculating
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {isCalculating ? 'Calculating...' : 'Calculate Route'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {routeInfo ? (
                        <div className="bg-green-50 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Route Information
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <MapPin className="h-5 w-5 text-green-600 mr-2" />
                                <span className="font-semibold text-gray-900">
                                  Origin
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 ml-7">
                                {routeInfo.origin}
                              </p>
                            </div>

                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center mb-2">
                                <MapPin className="h-5 w-5 text-red-600 mr-2" />
                                <span className="font-semibold text-gray-900">
                                  Destination
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 ml-7">
                                {routeInfo.destination}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <Navigation className="h-5 w-5 text-blue-600 mr-2" />
                                  <span className="font-semibold text-gray-900">
                                    Distance
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600 ml-7">
                                  {routeInfo.distance.toFixed(2)} km
                                </p>
                              </div>

                              <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                  <span className="font-semibold text-gray-900">
                                    Time
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600 ml-7">
                                  {routeInfo.estimatedTime} min
                                </p>
                              </div>
                            </div>

                            <div className="bg-white rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-gray-900">
                                  Traffic Density
                                </span>
                                <span className="text-sm font-semibold text-gray-600">
                                  {(routeInfo.trafficDensity * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${
                                    routeInfo.trafficDensity > 0.7
                                      ? 'bg-red-500'
                                      : routeInfo.trafficDensity > 0.4
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{
                                    width: `${routeInfo.trafficDensity * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-6 text-center">
                          <Navigation className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            Enter start/destination and click Calculate Route to see results
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          Routing Algorithm
                        </h3>
                        <p className="text-sm text-gray-700 mb-3">
                          The VANET routing system uses a Python-based backend that implements advanced algorithms:
                        </p>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Dijkstra&apos;s algorithm for shortest path calculation</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Real-time traffic density analysis</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>V2V and V2I data integration</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>Dynamic rerouting based on network conditions</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
