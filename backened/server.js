const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const touristRoutes = require("./src/routes/tourist");
const geofenceRoutes = require("./src/routes/geofence");
const heatmapRoutes = require("./src/routes/heatmap");
const firRoutes = require("./src/routes/fir");

const { startAutoFirJob } = require("./src/cron/autoFir");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/sih-tourist";

mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error", err));

app.use("/api", touristRoutes);
app.use("/api/geofences", geofenceRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/fir", firRoutes);

// http + socket.io
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});

// start cron jobs AFTER app and DB ready
startAutoFirJob(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
