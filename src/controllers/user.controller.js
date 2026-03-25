const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const mappedUsers = rows.map(user => {
      const u = user.toJSON();
      return {
        ...u,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
        company: u.address || 'Unknown Company',
        role: u.role || 'user',
        isVerified: u.isVerified || false,
        status: u.status || 'active',
      };
    });

    res.json({
      users: mappedUsers,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER BY ID
exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const u = user.toJSON();
    res.json({
      ...u,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
      company: u.address || 'Unknown Company',
      role: u.role || 'user',
      isVerified: u.isVerified || false,
      status: u.status || 'active',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attempting to split incoming 'name' into firstName and lastName (basic parsing for mock sync)
    // The request body might contain 'name', 'email', 'role', 'status', etc.
    let firstName = user.firstName;
    let lastName = user.lastName;
    if (req.body.name) {
      const parts = req.body.name.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    let updatePayload = {
      ...req.body,
      firstName: firstName,
      lastName: lastName,
      address: req.body.company || req.body.address || user.address,
      role: req.body.role || user.role,
      status: req.body.status || user.status,
      isVerified: req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified
    };

    if (req.body.password) {
      updatePayload.password = await bcrypt.hash(req.body.password, 10);
    } else {
      delete updatePayload.password;
    }

    await user.update(updatePayload);

    const u = user.toJSON();
    res.json({
      ...u,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Unknown User',
      company: u.address || 'Unknown Company',
      role: u.role || 'user',
      isVerified: u.isVerified || false,
      status: u.status || 'active',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Prevent deleting one's own account
    if (req.user && req.user.id === userIdToDelete) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const user = await User.findByPk(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
