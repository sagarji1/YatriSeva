const { Router } = require("express");
const locationRoute = Router();
const Tourist = require("../model/touristSchema");

locationRoute.post("/location", async (req, res) => {
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
    console.error("Location update error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
});
module.exports = locationRoute;
