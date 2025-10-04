import User from '../models/User.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const generateTemporaryPassword = () => {
  return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ company: req.companyId })
      .populate('manager', 'name email')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error fetching users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, role, managerId, currency } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const temporaryPassword = generateTemporaryPassword();

    const user = await User.create({
      name,
      email,
      password: temporaryPassword,
      role,
      company: req.companyId,
      manager: managerId || null,
      currency: currency || req.user.company.baseCurrency
    });

    await sendPasswordResetEmail(email, temporaryPassword);

    const populatedUser = await User.findById(user._id)
      .populate('manager', 'name email')
      .select('-password');

    res.status(201).json({ user: populatedUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, role, managerId, currency } = req.body;

    const user = await User.findOne({ _id: userId, company: req.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (managerId !== undefined) user.manager = managerId || null;
    if (currency) user.currency = currency;

    await user.save();

    const updatedUser = await User.findById(userId)
      .populate('manager', 'name email')
      .select('-password');

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error updating user' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ _id: userId, company: req.companyId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    await user.save();

    const emailSent = await sendPasswordResetEmail(user.email, temporaryPassword);

    if (emailSent) {
      res.json({ message: 'Password reset email sent' });
    } else {
      res.status(500).json({ error: 'Error sending email' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({
      company: req.companyId,
      role: { $in: ['Manager', 'Admin'] }
    }).select('_id name email role');

    res.json({ managers });
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Error fetching managers' });
  }
};