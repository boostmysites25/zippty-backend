import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Current directory:", __dirname);
console.log("Loading .env file...");

// Try different approaches to load .env
const result1 = dotenv.config();
console.log("dotenv.config() result:", result1);

const result2 = dotenv.config({ path: path.join(__dirname, '.env') });
console.log("dotenv.config({ path: '.env' }) result:", result2);

console.log("Environment variables:");
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("PORT:", process.env.PORT);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
