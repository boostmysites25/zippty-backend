import User from "../models/User.js";
import Order from "../models/Order.js";

// Get all users with pagination and search
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy, sortOrder } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date
    }

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
          currentPage: parseInt(page),
          hasNextPage: skip + users.length < total,
          hasPrevPage: parseInt(page) > 1,
        }
      }
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      status: false,
      message: "Failed to get users"
    });
  }
};

// Get user by ID with detailed information
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password')
      .populate('orders');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // Get user's order statistics
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('products.product', 'name images price');

    res.status(200).json({
      status: true,
      message: "User details retrieved successfully",
      data: {
        user,
        orderStats: orderStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0
        },
        recentOrders
      }
    });
  } catch (error) {
    console.error("Error getting user details:", error);
    res.status(500).json({
      status: false,
      message: "Failed to get user details"
    });
  }
};

// Update user status (block/unblock)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return res.status(400).json({
        status: false,
        message: "isBlocked must be a boolean value"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      status: true,
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: user
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update user status"
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    // Check if user has orders
    const userOrders = await Order.find({ user: userId });
    if (userOrders.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete user with existing orders"
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      status: false,
      message: "Failed to delete user"
    });
  }
};

// Get user statistics for admin dashboard
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get users with orders
    const usersWithOrders = await Order.distinct('user');
    const activeUsers = usersWithOrders.length;

    // Get top customers by total spent
    const topCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          name: "$user.name",
          email: "$user.email",
          totalSpent: 1,
          orderCount: 1
        }
      }
    ]);

    res.status(200).json({
      status: true,
      message: "User statistics retrieved successfully",
      data: {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        topCustomers
      }
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({
      status: false,
      message: "Failed to get user statistics"
    });
  }
};
