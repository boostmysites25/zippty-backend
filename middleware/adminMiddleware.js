import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

// Verify admin token and check if user is admin
export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token contains admin info
    if (!decoded.isAdmin || !decoded.adminId) {
      return res.status(403).json({
        status: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // Verify admin exists in database
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid token. Admin not found.",
      });
    }

    // Add admin info to request
    req.admin = {
      adminId: decoded.adminId,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
    };

    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: false,
        message: "Invalid token.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

// Optional admin auth - doesn't fail if no token, but adds admin info if valid
export const optionalAdminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token contains admin info
    if (decoded.isAdmin && decoded.adminId) {
      // Verify admin exists in database
      const admin = await Admin.findById(decoded.adminId);
      if (admin) {
        // Add admin info to request
        req.admin = {
          adminId: decoded.adminId,
          email: decoded.email,
          isAdmin: decoded.isAdmin,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without admin info
    next();
  }
};
