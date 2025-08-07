import express from "express";
import {
  adminLogin,
  getDashboardStats,
  getRecentOrders,
  getSalesAnalytics,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from "../controllers/adminController.js";
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getUserStats,
} from "../controllers/userManagementController.js";
import { adminAuth } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes (require admin authentication)
router.get("/dashboard/stats", adminAuth, getDashboardStats);
router.get("/dashboard/recent-orders", adminAuth, getRecentOrders);
router.get("/dashboard/sales-analytics", adminAuth, getSalesAnalytics);

// Admin profile routes
router.get("/profile", adminAuth, getAdminProfile);
router.put("/profile", adminAuth, updateAdminProfile);
router.put("/change-password", adminAuth, changeAdminPassword);

// User management routes
router.get("/users", adminAuth, getAllUsers);
router.get("/users/stats", adminAuth, getUserStats);
router.get("/users/:userId", adminAuth, getUserById);
router.patch("/users/:userId/status", adminAuth, updateUserStatus);
router.delete("/users/:userId", adminAuth, deleteUser);

export default router;
