import express from "express";
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { adminAuth } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes (for admin access)
router.get("/", adminAuth, getAllOrders);

// User routes (require user authentication)
router.post("/create", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.get("/user-orders", verifyToken, getUserOrders);
router.get("/:orderId", verifyToken, getOrderById);
router.delete("/:orderId/cancel", verifyToken, cancelOrder);

// Admin routes (require admin authentication)
router.patch("/:orderId/status", adminAuth, updateOrderStatus);

export default router;
