import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Temporary fallback for environment variables (for testing)
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb+srv://keshavyadav1022006:Un4kYigWK7l2ttsF@cluster10.nnglkfm.mongodb.net/zippty";
  process.env.JWT_SECRET = "your_jwt_secret_key";
  process.env.PORT = "7070";
  process.env.RAZORPAY_KEY_ID = "rzp_test_iVetw1LEDRlYMN";
  process.env.RAZORPAY_KEY_SECRET = "NYafLuarQ3Z7QtGOjyaRePav";
  console.log("Using fallback environment variables");
}
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import serverless from "serverless-http";

import { errorHandler } from "./middleware/errorHandler.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRouter.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("zippty backend is running on port 8080");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

console.log("Starting server...");

// MongoDB Connection
const PORT = process.env.PORT || 7070;

// Start server first, then try to connect to MongoDB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Try to connect to MongoDB after server starts
  if (process.env.MONGO_URI) {
    mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      })
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        console.log("Server is running but MongoDB is not connected");
        console.log("Please check your MONGO_URI in .env file");
      });
  } else {
    console.error("MONGO_URI not found in environment variables");
    console.log("Please add MONGO_URI to your .env file");
  }
});

export default app;
export const handler = serverless(app);
