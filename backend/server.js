require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const habitationRoutes = require("./routes/habitations");
const sosRoutes = require("./routes/sos");
const facilityRoutes = require("./routes/facilities");
const dashboardRoutes = require("./routes/dashboard");
const rescueUnitRoutes = require("./routes/rescueUnits");
const reliefDepotRoutes = require("./routes/reliefDepots");

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "ABHAYA Backend API - SIH26191", status: "running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/habitations", habitationRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rescue-units", rescueUnitRoutes);
app.use("/api/relief-depots", reliefDepotRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Server error", details: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 ABHAYA backend running on http://localhost:${PORT}`);
  });
});