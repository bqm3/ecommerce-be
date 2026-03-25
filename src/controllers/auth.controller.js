const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { 
      email, password, firstName, lastName, name, 
      phoneNumber, address, avatarUrl, role 
    } = req.body;

    // Check existing email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Support "name" as alias: split into firstName/lastName if provided
    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      lName = parts.pop();
      fName = parts.join(' ') || lName;
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hash,
      firstName: fName,
      lastName: lName,
      phoneNumber: phoneNumber || '',
      address: address || '',
      avatarUrl: avatarUrl || '',
      role: role || 'user',
    });

    const accessToken = generateToken(user);

    const { password: _, ...userData } = user.toJSON();

    res.json({
      accessToken,
      user: {
        ...userData,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const accessToken = generateToken(user);

    res.json({
      accessToken,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY ACCOUNT (FE gọi)
exports.getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};

// CREATE ACCOUNT (admin)
exports.createAccount = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      name,
      avatarUrl,
      phoneNumber,
      address,
      isVerified,
      status,
      role,
    } = req.body;

    // Support "name" as alias: split into firstName/lastName if provided
    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      lName = parts.pop();
      fName = parts.join(' ') || lName;
    }

    const rawPassword = password || Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(rawPassword, 10);

    const user = await User.create({
      email,
      password: hash,
      firstName: fName,
      lastName: lName,
      avatarUrl: avatarUrl || '',
      phoneNumber: phoneNumber || '',
      address: address || '',
      isVerified: isVerified ?? false,
      status: status || 'active',
      role: role || 'user',
    });

    const { password: _, ...userData } = user.toJSON();

    res.status(201).json({
      user: {
        id: userData.id,
        avatarUrl: userData.avatarUrl,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        isVerified: userData.isVerified,
        status: userData.status,
        role: userData.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET LIST USERS with pagination
exports.getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const users = rows.map((u) => ({
      id: u.id,
      avatarUrl: u.avatarUrl,
      name: `${u.firstName} ${u.lastName}`.trim(),
      email: u.email,
      phoneNumber: u.phoneNumber,
      address: u.address,
      isVerified: u.isVerified,
      status: u.status,
      role: u.role,
    }));

    res.json({
      users,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};