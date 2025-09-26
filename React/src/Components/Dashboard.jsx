import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Configure default Leaflet icon
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

export default function Dashboard() {
  const [tourists, setTourists] = useState([]);
  const [mapCenter, setMapCenter] = useState([28.7041, 77.1025]);
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
    const interval = setInterval(fetchTourists, 10000);
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
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {tourists.map((t) =>
            t.currentLocation ? (
              <Marker
                key={t.blockchainId}
                position={[t.currentLocation.lat, t.currentLocation.lng]}
              >
                <Popup>
                  <strong>{t.name}</strong>
                  <br />
                  ID: {t.blockchainId}
                  <br />
                  Lat: {t.currentLocation.lat.toFixed(5)}, Lng:{" "}
                  {t.currentLocation.lng.toFixed(5)}
                </Popup>
              </Marker>
            ) : null
          )}
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

