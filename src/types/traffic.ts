export interface TrafficIncident {
  id: string;
  type: string;
  severity: number;
  severityLabel: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  district?: string;
}

export interface DistrictTraffic {
  district: string;
  incidentCount: number;
  severity: string;
}
