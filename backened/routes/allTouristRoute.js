const { Router } = require("express");
const locationRoute = Router();
const Tourist = require("../model/touristSchema");
const { provider, signer, contract } = require("../services/blockchain");

locationRoute.get("/tourists", async (req, res) => {
  try {
    const tourists = await Tourist.find(
      {},
      { name: 1, blockchainId: 1, currentLocation: 1, _id: 0 }
    );
    res.json(tourists);
  } catch (error) {
    console.error("Get tourists error:", error);
    res.status(500).json({ error: "Failed to fetch tourists" });
  }
});
module.exports = locationRoute;
