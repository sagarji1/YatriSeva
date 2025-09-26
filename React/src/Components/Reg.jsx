import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function TouristRegistration() {
  const [name, setName] = useState("");
  const [passport, setPassport] = useState("");
  const [tripStart, setTripStart] = useState("");
  const [tripEnd, setTripEnd] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [message, setMessage] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      // Get browser location
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported by browser"));
        } else {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      const response = await axios.post(`${API_URL}/register`, {
        name,
        passportOrAadhaar: passport,
        tripItinerary: itinerary,
        emergencyContact,
        tripStart: Date.parse(tripStart) / 1000,
        tripEnd: Date.parse(tripEnd) / 1000,
        initialLocation: location, // Send initial location to backend
      });

      setMessage(
        `✅ Success! Registered with Blockchain ID: ${response.data.blockchainId}`
      );

      // Clear form
      setName("");
      setPassport("");
      setTripStart("");
      setTripEnd("");
      setEmergencyContact("");
      setItinerary("");
    } catch (error) {
      console.error(error);
      setMessage(`❌ Error: Registration failed. ${error.message}`);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Tourist Registration</h2>
      <form onSubmit={handleRegistration} style={formStyle}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Passport/Aadhaar"
          value={passport}
          onChange={(e) => setPassport(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Trip Itinerary"
          value={itinerary}
          onChange={(e) => setItinerary(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Emergency Contact"
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          required
          style={inputStyle}
        />
        <label style={labelStyle}>Trip Start Date:</label>
        <input
          type="date"
          value={tripStart}
          onChange={(e) => setTripStart(e.target.value)}
          required
          style={inputStyle}
        />
        <label style={labelStyle}>Trip End Date:</label>
        <input
          type="date"
          value={tripEnd}
          onChange={(e) => setTripEnd(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Register Tourist
        </button>
      </form>
      {message && (
        <p
          style={{
            ...messageStyle,
            color: message.includes("Error") ? "#e74c3c" : "#27ae60",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

// ======= STYLES =======
const containerStyle = {
  padding: "30px",
  maxWidth: "600px",
  margin: "50px auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  borderRadius: "12px",
  backgroundColor: "#fff",
  fontFamily: "'Poppins', sans-serif",
};
const titleStyle = {
  textAlign: "center",
  marginBottom: "25px",
  color: "#1a73e8",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "16px",
};
const labelStyle = {
  fontWeight: "500",
  marginTop: "10px",
  color: "#333",
};
const buttonStyle = {
  padding: "12px",
  backgroundColor: "#1a73e8",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
  transition: "0.3s",
};
const messageStyle = {
  marginTop: "20px",
  fontWeight: "500",
  textAlign: "center",
};
