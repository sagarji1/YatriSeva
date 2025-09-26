const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// --------------------
// Tourist Mongoose Schema
// --------------------
const touristSchema = new mongoose.Schema({
  name: String,
  passportOrAadhaar: String,
  tripItinerary: String,
  emergencyContact: String,
  blockchainId: String,
  currentLocation: { lat: Number, lng: Number },
});

const Tourist = mongoose.model("Tourist", touristSchema);

// --------------------
// Blockchain Setup
// --------------------
const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const { abi: TouristID_ABI } = require("./TouristID_ABI.json");
const contract = new ethers.Contract(
  process.env.TOURISTID_CONTRACT_ADDRESS,
  TouristID_ABI,
  signer
);

// --------------------
// Connect to MongoDB
// --------------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// --------------------
// API Endpoints
// --------------------

// Register Tourist
app.post("/register", async (req, res) => {
  const { name, passportOrAadhaar, tripItinerary, emergencyContact, tripStart, tripEnd, initialLocation } = req.body;

  try {
    const tx = await contract.registerTourist(
      passportOrAadhaar,
      tripStart,
      tripEnd,
      emergencyContact
    );

    console.log("⏳ Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("✅ Transaction mined:", receipt.transactionHash);

    let blockchainId = null;
    if (receipt.events) {
      const event = receipt.events.find(e => e.event === 'TouristRegistered');
      if (event && event.args) {
        [blockchainId] = event.args;
      }
    }

    if (!blockchainId) {
      blockchainId = tx.hash; // fallback if event not found
    }

    const newTourist = new Tourist({
      name,
      passportOrAadhaar,
      tripItinerary,
      emergencyContact,
      blockchainId: blockchainId.toString(),
      currentLocation: initialLocation || { lat: 0, lng: 0 }
    });

    await newTourist.save();

    res.status(201).json({ message: "Tourist registered", blockchainId: blockchainId.toString() });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. " + error.message });
  }
});

// Panic Alert
app.post("/panic", async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    const updated = await Tourist.findOneAndUpdate(
      { blockchainId },
      { currentLocation: location },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Tourist not found" });

    res.json({ message: "Panic alert sent to authorities", tourist: updated });
  } catch (error) {
    console.error("❌ Panic error:", error);
    res.status(500).json({ error: "Failed to send panic alert" });
  }
});

// Update Location
app.post("/location", async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    const updated = await Tourist.findOneAndUpdate(
      { blockchainId },
      { currentLocation: location },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Tourist not found" });

    res.json({ message: "Location updated", tourist: updated });
  } catch (error) {
    console.error("❌ Location update error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Get All Tourists
app.get("/tourists", async (req, res) => {
  try {
    const tourists = await Tourist.find({}, { name: 1, blockchainId: 1, currentLocation: 1, _id: 0 });
    res.json(tourists);
  } catch (error) {
    console.error("❌ Get tourists error:", error);
    res.status(500).json({ error: "Failed to fetch tourists" });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));


/*// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// --------------------
// Tourist Mongoose Schema
// --------------------
const touristSchema = new mongoose.Schema({
  name: String,
  passportOrAadhaar: String,
  tripItinerary: String,
  emergencyContact: String,
  blockchainId: String,
  currentLocation: { lat: Number, lng: Number },
});
const Tourist = mongoose.model("Tourist", touristSchema);

// --------------------
// Blockchain Setup
// --------------------
const provider = new ethers.JsonRpcProvider(process.env.MUMBAI_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const { abi: TouristID_ABI } = require("./TouristID_ABI.json");
const contract = new ethers.Contract(process.env.TOURISTID_CONTRACT_ADDRESS, TouristID_ABI, signer);

// --------------------
// Connect to MongoDB
// --------------------
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// --------------------
// API Endpoints
// --------------------

// Register Tourist
app.post("/register", async (req, res) => {
  const { name, passportOrAadhaar, tripItinerary, emergencyContact, blockchainId, initialLocation } = req.body;

  try {
    const newTourist = new Tourist({
      name,
      passportOrAadhaar,
      tripItinerary,
      emergencyContact,
      blockchainId,
      currentLocation: initialLocation || { lat: 0, lng: 0 },
    });

    await newTourist.save();
    res.status(201).json({ message: "Tourist saved in DB", blockchainId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "DB save failed. " + error.message });
  }
});


// Panic Alert
app.post("/panic", async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    const updated = await Tourist.findOneAndUpdate(
      { blockchainId },
      { currentLocation: location },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Tourist not found" });
    res.json({ message: "Panic alert sent to authorities", tourist: updated });
  } catch (error) {
    console.error("❌ Panic error:", error);
    res.status(500).json({ error: "Failed to send panic alert" });
  }
});

// Update Location
app.post("/location", async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    const updated = await Tourist.findOneAndUpdate(
      { blockchainId },
      { currentLocation: location },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Tourist not found" });
    res.json({ message: "Location updated", tourist: updated });
  } catch (error) {
    console.error("❌ Location update error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});

// Get All Tourists
app.get("/tourists", async (req, res) => {
  try {
    const tourists = await Tourist.find({}, { name: 1, blockchainId: 1, currentLocation: 1, _id: 0 });
    res.json(tourists);
  } catch (error) {
    console.error("❌ Get tourists error:", error);
    res.status(500).json({ error: "Failed to fetch tourists" });
  }
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
*/
