import express from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductStats,
  bulkDeleteProducts,
  updateProductStock,
} from "../controllers/productController.js";
import { adminAuth } from "../middleware/adminMiddleware.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin routes (require admin authentication)
router.post("/", adminAuth, upload.array("images", 9), addProduct);
router.put("/:id", adminAuth, upload.array("images", 9), updateProduct);
router.delete("/:id", adminAuth, deleteProduct);
router.delete("/bulk", adminAuth, bulkDeleteProducts);
router.patch("/:id/stock", adminAuth, updateProductStock);
router.get("/admin/stats", adminAuth, getProductStats);

export default router;
