import Admin from "../models/Admin.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/productSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required",
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        adminId: admin._id, 
        email: admin.email, 
        isAdmin: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove password from response
    admin.password = undefined;

    res.status(200).json({
      status: true,
      message: "Admin login successful",
      data: {
        admin,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

// Get Dashboard Statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get current date and date 30 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get previous period dates
    const previousPeriodStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = thirtyDaysAgo;

    // Current period stats
    const currentOrders = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const currentRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const currentProducts = await Product.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const currentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Previous period stats
    const previousOrders = await Order.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    const previousRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const previousProducts = await Product.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    const previousUsers = await User.countDocuments({
      createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
    });

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats = {
      orders: {
        current: currentOrders,
        previous: previousOrders,
        percentageChange: calculatePercentageChange(currentOrders, previousOrders)
      },
      revenue: {
        current: currentRevenue[0]?.total || 0,
        previous: previousRevenue[0]?.total || 0,
        percentageChange: calculatePercentageChange(
          currentRevenue[0]?.total || 0,
          previousRevenue[0]?.total || 0
        )
      },
      products: {
        current: currentProducts,
        previous: previousProducts,
        percentageChange: calculatePercentageChange(currentProducts, previousProducts)
      },
      users: {
        current: currentUsers,
        previous: previousUsers,
        percentageChange: calculatePercentageChange(currentUsers, previousUsers)
      }
    };

    res.status(200).json({
      status: true,
      message: "Dashboard stats retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
};

// Get Recent Orders for Dashboard
export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name images price")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      status: true,
      message: "Recent orders retrieved successfully",
      data: recentOrders,
    });
  } catch (error) {
    console.error("Recent orders error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch recent orders",
    });
  }
};

// Get Sales Analytics (Monthly data for charts)
export const getSalesAnalytics = async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - parseInt(months), 1);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "paid"
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format data for charts
    const formattedData = salesData.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      sales: item.totalSales,
      orders: item.orderCount
    }));

    res.status(200).json({
      status: true,
      message: "Sales analytics retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch sales analytics",
    });
  }
};

// Get Admin Profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");
    
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Admin profile retrieved successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch admin profile",
    });
  }
};

// Update Admin Profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const adminId = req.admin.adminId;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const admin = await Admin.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update admin profile",
    });
  }
};

// Change Admin Password
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.adminId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const admin = await Admin.findById(adminId).select("+password");
    if (!admin) {
      return res.status(404).json({
        status: false,
        message: "Admin not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({
      status: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change admin password error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to change password",
    });
  }
};
