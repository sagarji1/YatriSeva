import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Configure default Leaflet icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = "http://localhost:5000";

// 🔥 Heatmap Layer Component
function HeatmapLayer({ tourists }) {
  const map = useMap();

  useEffect(() => {
    if (!tourists || tourists.length === 0) return;

    // Prepare points for heatmap: [lat, lng, intensity]
    const heatPoints = tourists
      .filter((t) => t.currentLocation)
      .map((t) => [t.currentLocation.lat, t.currentLocation.lng, 0.5]);

    const heatLayer = L.heatLayer(heatPoints, { radius: 25 }).addTo(map);

    return () => {
      map.removeLayer(heatLayer); // cleanup
    };
  }, [tourists, map]);

  return null;
}

export default function Dashboard() {
  const [tourists, setTourists] = useState([]);
  const [mapCenter] = useState([28.7041, 77.1025]);
  const [loading, setLoading] = useState(true);

  const fetchTourists = async () => {
    try {
      const response = await axios.get(`${API_URL}/tourists`);
      setTourists(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tourist data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourists();
    const interval = setInterval(fetchTourists, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Tourist Dashboard</h2>

      {loading && <p style={messageStyle}>Loading tourist data...</p>}

      {/* Map */}
      <div style={mapWrapperStyle}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Tourist Markers */}
          {tourists.map((t) =>
            t.currentLocation ? (
              <Marker
                key={t.blockchainId}
                position={[t.currentLocation.lat, t.currentLocation.lng]}
              >
                <Popup>
                  <strong>{t.name}</strong>
                  <br />
                  {t.blockchainId}
                </Popup>
              </Marker>
            ) : null
          )}

          {/* Heatmap Layer */}
          <HeatmapLayer tourists={tourists} />
        </MapContainer>
      </div>

      {/* Tourist Table */}
      <h3 style={tableTitleStyle}>Tourist List</h3>
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Blockchain ID</th>
              <th>Last Known Location</th>
            </tr>
          </thead>
          <tbody>
            {tourists.map((t) => (
              <tr key={t.blockchainId}>
                <td>{t.name}</td>
                <td>{t.blockchainId}</td>
                <td>
                  {t.currentLocation
                    ? `${t.currentLocation.lat.toFixed(
                        5
                      )}, ${t.currentLocation.lng.toFixed(5)}`
                    : "Not available"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====== STYLES ======
const containerStyle = {
  padding: "30px",
  maxWidth: "1000px",
  margin: "auto",
  fontFamily: "'Poppins', sans-serif",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#1a73e8",
};

const messageStyle = {
  textAlign: "center",
  color: "#555",
};

const mapWrapperStyle = {
  marginBottom: "30px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

const tableWrapperStyle = {
  overflowX: "auto",
};

const tableTitleStyle = {
  marginBottom: "10px",
  color: "#333",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};

tableStyle.thead = {
  backgroundColor: "#1a73e8",
  color: "#fff",
};

tableStyle.thtd = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};
