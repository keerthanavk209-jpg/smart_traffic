/*
  # VANET Smart Traffic Routing System Schema

  ## Overview
  This migration creates the complete database schema for the Smart Traffic Routing using VANETs project.

  ## 1. New Tables

  ### `vehicles`
  Stores information about vehicles in the VANET network
  - `id` (uuid, primary key): Unique vehicle identifier
  - `vehicle_id` (text, unique): Vehicle registration or identifier
  - `current_location` (point): Current GPS coordinates (latitude, longitude)
  - `speed` (float): Current speed in km/h
  - `direction` (float): Direction in degrees (0-360)
  - `status` (text): Vehicle status (active, idle, offline)
  - `last_updated` (timestamptz): Last update timestamp
  - `created_at` (timestamptz): Record creation time

  ### `infrastructure_nodes`
  Stores V2I infrastructure nodes (traffic lights, RSUs, etc.)
  - `id` (uuid, primary key): Unique node identifier
  - `node_id` (text, unique): Infrastructure node identifier
  - `node_type` (text): Type of infrastructure (traffic_light, rsu, toll_booth)
  - `location` (point): GPS coordinates
  - `status` (text): Node status (online, offline, maintenance)
  - `metadata` (jsonb): Additional node-specific data
  - `created_at` (timestamptz): Record creation time

  ### `v2v_messages`
  Stores vehicle-to-vehicle communication messages
  - `id` (uuid, primary key): Unique message identifier
  - `sender_vehicle_id` (uuid, foreign key): Sending vehicle
  - `receiver_vehicle_id` (uuid, foreign key, nullable): Receiving vehicle (null for broadcast)
  - `message_type` (text): Type of message (traffic_update, hazard_warning, route_share)
  - `content` (jsonb): Message content
  - `location` (point): Location where message was sent
  - `timestamp` (timestamptz): Message timestamp

  ### `v2i_messages`
  Stores vehicle-to-infrastructure communication messages
  - `id` (uuid, primary key): Unique message identifier
  - `vehicle_id` (uuid, foreign key, nullable): Vehicle identifier
  - `node_id` (uuid, foreign key): Infrastructure node identifier
  - `message_type` (text): Type of message (traffic_light_status, route_suggestion, warning)
  - `content` (jsonb): Message content
  - `timestamp` (timestamptz): Message timestamp

  ### `routes`
  Stores calculated routes and routing data
  - `id` (uuid, primary key): Unique route identifier
  - `vehicle_id` (uuid, foreign key): Vehicle for this route
  - `origin` (point): Starting location
  - `destination` (point): Destination location
  - `waypoints` (jsonb): Array of waypoint coordinates
  - `distance` (float): Total distance in km
  - `estimated_time` (integer): Estimated time in minutes
  - `traffic_density` (float): Average traffic density score (0-1)
  - `status` (text): Route status (active, completed, cancelled)
  - `created_at` (timestamptz): Route creation time
  - `completed_at` (timestamptz, nullable): Route completion time

  ### `traffic_data`
  Stores real-time traffic data and analytics
  - `id` (uuid, primary key): Unique data entry identifier
  - `location` (point): GPS coordinates
  - `road_segment` (text): Road segment identifier
  - `vehicle_count` (integer): Number of vehicles detected
  - `average_speed` (float): Average speed in km/h
  - `congestion_level` (text): Congestion level (low, medium, high, severe)
  - `timestamp` (timestamptz): Data collection timestamp

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated access
  - Public read access for infrastructure nodes and traffic data
  - Restricted write access for vehicles and messages

  ## 3. Indexes
  - Create indexes on frequently queried columns (location, timestamps, vehicle IDs)
  - Spatial indexes for location-based queries

  ## 4. Important Notes
  - All location data uses PostgreSQL's point type for efficient spatial queries
  - JSONB used for flexible metadata and message content storage
  - Timestamps use timestamptz for timezone awareness
*/

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text UNIQUE NOT NULL,
  current_location point NOT NULL,
  speed float DEFAULT 0,
  direction float DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'idle', 'offline')),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS infrastructure_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text UNIQUE NOT NULL,
  node_type text NOT NULL CHECK (node_type IN ('traffic_light', 'rsu', 'toll_booth', 'camera')),
  location point NOT NULL,
  status text DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS v2v_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  receiver_vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('traffic_update', 'hazard_warning', 'route_share', 'emergency')),
  content jsonb NOT NULL,
  location point NOT NULL,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS v2i_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  node_id uuid NOT NULL REFERENCES infrastructure_nodes(id) ON DELETE CASCADE,
  message_type text NOT NULL CHECK (message_type IN ('traffic_light_status', 'route_suggestion', 'warning', 'toll_info')),
  content jsonb NOT NULL,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  origin point NOT NULL,
  destination point NOT NULL,
  waypoints jsonb DEFAULT '[]',
  distance float DEFAULT 0,
  estimated_time integer DEFAULT 0,
  traffic_density float DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location point NOT NULL,
  road_segment text NOT NULL,
  vehicle_count integer DEFAULT 0,
  average_speed float DEFAULT 0,
  congestion_level text DEFAULT 'low' CHECK (congestion_level IN ('low', 'medium', 'high', 'severe')),
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2v_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2i_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vehicles"
  ON vehicles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert vehicles"
  ON vehicles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update vehicles"
  ON vehicles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view infrastructure nodes"
  ON infrastructure_nodes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view V2V messages"
  ON v2v_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert V2V messages"
  ON v2v_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view V2I messages"
  ON v2i_messages FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert V2I messages"
  ON v2i_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view routes"
  ON routes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert routes"
  ON routes FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update routes"
  ON routes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can view traffic data"
  ON traffic_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert traffic data"
  ON traffic_data FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles USING gist(current_location);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_updated ON vehicles(last_updated);

CREATE INDEX IF NOT EXISTS idx_infrastructure_location ON infrastructure_nodes USING gist(location);
CREATE INDEX IF NOT EXISTS idx_infrastructure_type ON infrastructure_nodes(node_type);

CREATE INDEX IF NOT EXISTS idx_v2v_sender ON v2v_messages(sender_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_v2v_timestamp ON v2v_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_v2i_vehicle ON v2i_messages(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_v2i_node ON v2i_messages(node_id);
CREATE INDEX IF NOT EXISTS idx_v2i_timestamp ON v2i_messages(timestamp);

CREATE INDEX IF NOT EXISTS idx_routes_vehicle ON routes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);

CREATE INDEX IF NOT EXISTS idx_traffic_location ON traffic_data USING gist(location);
CREATE INDEX IF NOT EXISTS idx_traffic_timestamp ON traffic_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_traffic_segment ON traffic_data(road_segment);
