const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const touristSchema = new mongoose.Schema({
  name: String,
  passportOrAadhaar: String,
  tripItinerary: String,
  emergencyContact: String,
  blockchainId: String,
  currentLocation: { lat: Number, lng: Number },
});

const Tourist = mongoose.model("Tourist", touristSchema);
module.exports=Tourist;
