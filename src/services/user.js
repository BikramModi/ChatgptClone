import User from "../models/user.js";
import NotFoundError from "../errors/not-found-error.js";


import AuditLog from "../models/auditLog.js";


const createUser = async (userData, req = null) => {
  // 1️⃣ Create the user
  const user = await User.create(userData);

  // 2️⃣ Create audit log for this action
  try {
    await AuditLog.create({
      actorId: null, // self-registration
      action: "USER_REGISTERED",
      entity: "User",
      entityId: user._id,
      metadata: {
        email: user.email,
        name: user.name,
        ip: req?.ip, // optional, pass req if available
        userAgent: req?.headers["user-agent"], // optional
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
    // Do not throw, user creation should succeed even if logging fails
  }

  // 3️⃣ Return user object without password
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};


const getAllUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
    order = "desc",
  } = query;

  let where = {};

  if (search) {
    where.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const total = await User.countDocuments(where);
  const totalPages = Math.ceil(total / limit);

  const users = await User.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ [sort]: order });

  return {
    users,
    total,
    limit: +limit,
    totalPages,
  };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const updateUser = async (userId, userData) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(userData.name && { name: userData.name }),
      ...(userData.email && { email: userData.email }),
      ...(userData.password && { password: userData.password }),
      ...(userData.role && { role: userData.role }), // ✅ ADD THIS
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) {
    throw new NotFoundError("User not found");
  }
  const { password, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

const deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { message: "User deleted successfully" };
};

export { createUser, getAllUsers, getUserById, updateUser, deleteUser };
