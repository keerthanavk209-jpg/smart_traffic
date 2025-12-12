import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrafficIncident } from '../types/traffic';

interface TrafficMapProps {
  incidents: TrafficIncident[];
}

export default function TrafficMap({ incidents }: TrafficMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([15.3173, 75.7139], 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    incidents.forEach(incident => {
      const color = getSeverityColor(incident.severity);
      const html = `
        <div style="
          width: 24px;
          height: 24px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        "></div>
      `;

      const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], {
        icon: L.divIcon({
          html,
          iconSize: [24, 24],
          className: 'traffic-marker-icon',
        }),
      })
        .bindPopup(`
          <div style="font-size: 13px;">
            <strong>${incident.type}</strong><br/>
            <small>${incident.location}</small>
          </div>
        `)
        .addTo(mapInstanceRef.current!);

      markersRef.current.push(marker);
    });
  }, [incidents]);

  return <div ref={mapRef} className="w-full h-full" />;
}

function getSeverityColor(severity: number): string {
  if (severity >= 4) return '#dc2626';
  if (severity >= 3) return '#ea580c';
  if (severity >= 2) return '#f59e0b';
  return '#10b981';
}
