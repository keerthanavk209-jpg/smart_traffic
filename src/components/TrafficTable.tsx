import { TrafficIncident } from '../types/traffic';

interface TrafficTableProps {
  incidents: TrafficIncident[];
  hasIncidents: boolean;
}

export default function TrafficTable({ incidents, hasIncidents }: TrafficTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Severity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!hasIncidents ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No incidents found — zoom map or move.
                  <br />
                  <span className="text-sm text-blue-600 mt-2 inline-block">
                    Zoom into Bengaluru, Mysuru, Hubballi or highways for more detailed signals.
                  </span>
                </td>
              </tr>
            ) : (
              incidents.slice(0, 10).map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{incident.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadgeClass(incident.severityLabel)}`}>
                      {incident.severityLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{incident.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getSeverityBadgeClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-orange-100 text-orange-800';
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
