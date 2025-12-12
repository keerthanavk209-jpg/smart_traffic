import { useState, useEffect } from 'react';
import { TrafficIncident, DistrictTraffic } from '../types/traffic';

const TOMTOM_API_KEY = 'CEvpEx1HV90gkqNmR9VcBjSamrrZCaD7';

const KARNATAKA_BOUNDS = {
  minLat: 11.5,
  maxLat: 18.5,
  minLon: 74.0,
  maxLon: 78.5
};

const MOCK_INCIDENTS: TrafficIncident[] = [
  {
    id: 'incident-1',
    type: 'Accident',
    severity: 4,
    severityLabel: 'High',
    location: 'Bengaluru',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    district: 'Bengaluru Urban'
  },
  {
    id: 'incident-2',
    type: 'Road Works',
    severity: 3,
    severityLabel: 'Medium',
    location: 'Mysuru',
    coordinates: { lat: 12.2958, lng: 76.6394 },
    district: 'Mysuru'
  },
  {
    id: 'incident-3',
    type: 'Traffic Jam',
    severity: 3,
    severityLabel: 'Medium',
    location: 'Hubballi',
    coordinates: { lat: 15.3647, lng: 75.1240 },
    district: 'Hubballi-Dharwad'
  },
  {
    id: 'incident-4',
    type: 'Lane Closed',
    severity: 2,
    severityLabel: 'Low',
    location: 'Mangaluru',
    coordinates: { lat: 12.9141, lng: 74.8560 },
    district: 'Mangaluru'
  },
  {
    id: 'incident-5',
    type: 'Dangerous Conditions',
    severity: 4,
    severityLabel: 'High',
    location: 'Bengaluru',
    coordinates: { lat: 13.0326, lng: 77.6209 },
    district: 'Bengaluru Urban'
  },
  {
    id: 'incident-6',
    type: 'Road Works',
    severity: 2,
    severityLabel: 'Low',
    location: 'Belagavi',
    coordinates: { lat: 15.8497, lng: 74.4977 },
    district: 'Belagavi'
  }
];

export function useTrafficData() {
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [districtTraffic, setDistrictTraffic] = useState<DistrictTraffic[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchTrafficData();
    const interval = setInterval(fetchTrafficData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrafficData = async () => {
    try {
      const { minLat, maxLat, minLon, maxLon } = KARNATAKA_BOUNDS;
      const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;

      const response = await fetch(
        `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TOMTOM_API_KEY}&bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,delay,roadNumbers}}}&language=en-GB&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14&timeValidityFilter=present`,
        { mode: 'cors' }
      );

      if (!response.ok) {
        console.warn('TomTom API returned:', response.status);
        throw new Error('Failed to fetch traffic data');
      }

      const data = await response.json();
      console.log('API Response:', data);

      const processedIncidents: TrafficIncident[] = [];
      const districtMap = new Map<string, { count: number; totalSeverity: number }>();

      if (data.incidents && Array.isArray(data.incidents)) {
        data.incidents.forEach((incident: any, index: number) => {
          const coords = incident.geometry?.coordinates;
          if (!coords || coords.length < 2) return;

          const lat = coords[1];
          const lng = coords[0];

          const severity = incident.properties?.magnitudeOfDelay || 2;
          const type = getIncidentType(incident.properties?.iconCategory);
          const location = getLocationFromCoords(lat, lng);
          const district = getDistrictFromCoords(lat, lng);
          const severityLabel = getSeverityLabel(severity);

          processedIncidents.push({
            id: `incident-${index}`,
            type,
            severity,
            severityLabel,
            location,
            coordinates: { lat, lng },
            district
          });

          if (district) {
            const current = districtMap.get(district) || { count: 0, totalSeverity: 0 };
            districtMap.set(district, {
              count: current.count + 1,
              totalSeverity: current.totalSeverity + severity
            });
          }
        });

        if (processedIncidents.length > 0) {
          setIncidents(processedIncidents);
        } else {
          setIncidents(MOCK_INCIDENTS);
        }
      } else {
        console.warn('No incidents in response, using mock data');
        setIncidents(MOCK_INCIDENTS);
      }

      const incidentsToUse = processedIncidents.length > 0 ? processedIncidents : MOCK_INCIDENTS;
      const districtMapToUse = new Map<string, { count: number; totalSeverity: number }>();

      incidentsToUse.forEach(incident => {
        if (incident.district) {
          const current = districtMapToUse.get(incident.district) || { count: 0, totalSeverity: 0 };
          districtMapToUse.set(incident.district, {
            count: current.count + 1,
            totalSeverity: current.totalSeverity + incident.severity
          });
        }
      });

      const topDistricts: DistrictTraffic[] = Array.from(districtMapToUse.entries())
        .map(([district, data]) => ({
          district,
          incidentCount: data.count,
          severity: getSeverityLevel(data.totalSeverity / data.count)
        }))
        .sort((a, b) => b.incidentCount - a.incidentCount)
        .slice(0, 10);

      setDistrictTraffic(topDistricts);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      setIncidents(MOCK_INCIDENTS);

      const districtMap = new Map<string, { count: number; totalSeverity: number }>();
      MOCK_INCIDENTS.forEach(incident => {
        if (incident.district) {
          const current = districtMap.get(incident.district) || { count: 0, totalSeverity: 0 };
          districtMap.set(incident.district, {
            count: current.count + 1,
            totalSeverity: current.totalSeverity + incident.severity
          });
        }
      });

      const topDistricts: DistrictTraffic[] = Array.from(districtMap.entries())
        .map(([district, data]) => ({
          district,
          incidentCount: data.count,
          severity: getSeverityLevel(data.totalSeverity / data.count)
        }))
        .sort((a, b) => b.incidentCount - a.incidentCount)
        .slice(0, 10);

      setDistrictTraffic(topDistricts);
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    fetchTrafficData();
  };

  return { incidents, districtTraffic, loading, lastUpdated, refreshData };
}

function getIncidentType(category: number): string {
  const types: { [key: number]: string } = {
    0: 'Unknown',
    1: 'Accident',
    2: 'Fog',
    3: 'Dangerous Conditions',
    4: 'Rain',
    5: 'Ice',
    6: 'Jam',
    7: 'Lane Closed',
    8: 'Road Closed',
    9: 'Road Works',
    10: 'Wind',
    11: 'Flooding',
    14: 'Broken Down Vehicle'
  };
  return types[category] || 'Traffic';
}

function getLocationFromCoords(lat: number, lng: number): string {
  const districts = [
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, radius: 0.3 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394, radius: 0.2 },
    { name: 'Hubballi', lat: 15.3647, lng: 75.1240, radius: 0.2 },
    { name: 'Mangaluru', lat: 12.9141, lng: 74.8560, radius: 0.2 },
    { name: 'Belagavi', lat: 15.8497, lng: 74.4977, radius: 0.2 }
  ];

  for (const district of districts) {
    const distance = Math.sqrt(
      Math.pow(lat - district.lat, 2) + Math.pow(lng - district.lng, 2)
    );
    if (distance < district.radius) {
      return district.name;
    }
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function getDistrictFromCoords(lat: number, lng: number): string {
  const districts = [
    { name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946, radius: 0.5 },
    { name: 'Mysuru', lat: 12.2958, lng: 76.6394, radius: 0.4 },
    { name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.1240, radius: 0.4 },
    { name: 'Mangaluru', lat: 12.9141, lng: 74.8560, radius: 0.3 },
    { name: 'Belagavi', lat: 15.8497, lng: 74.4977, radius: 0.4 },
    { name: 'Kalaburagi', lat: 17.3297, lng: 76.8343, radius: 0.4 },
    { name: 'Davanagere', lat: 14.4644, lng: 75.9218, radius: 0.3 }
  ];

  for (const district of districts) {
    const distance = Math.sqrt(
      Math.pow(lat - district.lat, 2) + Math.pow(lng - district.lng, 2)
    );
    if (distance < district.radius) {
      return district.name;
    }
  }

  return 'Other Areas';
}

function getSeverityLevel(avgSeverity: number): string {
  if (avgSeverity >= 4) return 'High';
  if (avgSeverity >= 2) return 'Medium';
  return 'Low';
}

function getSeverityLabel(severity: number): string {
  if (severity >= 4) return 'High';
  if (severity >= 2) return 'Medium';
  return 'Low';
}
