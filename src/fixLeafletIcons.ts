import L from "leaflet";
import marker from "leaflet/dist/images/marker-icon.png";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

export function fixLeafletIcons() {
  const DefaultIcon = L.icon({
    iconUrl: marker,
    iconRetinaUrl: marker2x,
    shadowUrl: shadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  L.Marker.prototype.options.icon = DefaultIcon;
}
