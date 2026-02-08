import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import connectDB from "./config/configDB.js";
import deanRoutes from "./routes/deanRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Auth Routes
app.use("/api/auth/users", authRoutes);

//Dean Routes
app.use("/api/dean", deanRoutes);

//Student Routes
app.use("/api/student", studentRoutes);
//Company Routes
app.use("/api/company", companyRoutes);
// Complaint Routes
app.use("/api/complaints", complaintRoutes);
// Connect to the database then Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
