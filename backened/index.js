const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const allTouristRoute=require("./routes/allTouristRoute")
const locationRoute=require("./routes/locationRoute")
const panicRoute=require("./routes/panicRoute")
const registerRoute=require("./routes/registerRoute")

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

  app.use("/",registerRoute)
  app.use("/",locationRoute)
  app.use("/",panicRoute)
  app.use("/",allTouristRoute)




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));