const { Router } = require("express");
const registerRoute = Router();
const Tourist = require("../model/touristSchema");
registerRoute.post("/panic", async (req, res) => {
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
    console.error("Panic error:", error);
    res.status(500).json({ error: "Failed to send panic alert" });
  }
});
module.exports = registerRoute;
