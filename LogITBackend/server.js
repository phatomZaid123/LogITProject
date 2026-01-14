import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/configDB.js";
import deanRoutes from "./routes/deanRoutes..js";
import authRoutes from "./routes/authRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from your frontend origin
  credentials: true, // Allow sending of cookies, authorization headers, etc.
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Specify allowed methods
  allowedHeaders: "Content-Type,Authorization", // Specify allowed headers
};

// Middleware
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use("/api/user", authRoutes);

//Dean Routes
app.use("/api/dean", deanRoutes);

// Connect to the database then Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
