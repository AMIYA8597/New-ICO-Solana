import User from '../models/userModel.js';
import { generateToken } from '../utils/jwtUtils.js';

export const registerUser = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    let user = await User.findOne({ walletAddress });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ walletAddress });
    await user.save();

    res.status(201).json({
      _id: user._id,
      walletAddress: user.walletAddress,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(401).json({ message: 'Invalid wallet address' });
    }

    res.json({
      _id: user._id,
      walletAddress: user.walletAddress,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        walletAddress: user.walletAddress,
        tokensPurchased: user.tokensPurchased,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};
