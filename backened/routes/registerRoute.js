const { Router } = require("express");
const registerRoute = Router();
const Tourist = require("../model/touristSchema");
const { provider, signer, contract } = require("../services/blockchain");

registerRoute.post("/register", async (req, res) => {
  const {
    name,
    passportOrAadhaar,
    tripItinerary,
    emergencyContact,
    tripStart,
    tripEnd,
    initialLocation,
  } = req.body;

  try {
    const tx = await contract.registerTourist(
      passportOrAadhaar,
      tripStart,
      tripEnd,
      emergencyContact
    );

    console.log("Transaction sent:", tx.hash);

    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt.transactionHash);

    let blockchainId = null;
    if (receipt.events) {
      const event = receipt.events.find((e) => e.event === "TouristRegistered");
      if (event && event.args) {
        [blockchainId] = event.args;
      }
    }

    if (!blockchainId) {
      blockchainId = tx.hash; 
    }

    const newTourist = new Tourist({
      name,
      passportOrAadhaar,
      tripItinerary,
      emergencyContact,
      blockchainId: blockchainId.toString(),
      currentLocation: initialLocation || { lat: 0, lng: 0 },
    });

    await newTourist.save();

    res
      .status(201)
      .json({
        message: "Tourist registered",
        blockchainId: blockchainId.toString(),
      });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. " + error.message });
  }
});
module.exports = registerRoute;
