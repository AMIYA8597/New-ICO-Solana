import { getIcoDetails, buyTokens, distributeTokens, endIco, updateIcoParameters } from '../utils/solanaUtils.js';
import User from '../models/userModel.js';

export const getIcoInfo = async (req, res) => {
  try {
    const icoDetails = await getIcoDetails();
    res.json(icoDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ICO details', error: error.message });
  }
};

export const purchaseTokens = async (req, res) => {
  try {
    const { amount } = req.body;
    const walletAddress = req.user.walletAddress;
    const result = await buyTokens(amount, walletAddress);
    
    // Update user's purchase in the database
    await User.findOneAndUpdate(
      { walletAddress },
      { $inc: { tokensPurchased: amount } },
      { new: true }
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing tokens', error: error.message });
  }
};

export const distributeTokensToUsers = async (req, res) => {
  try {
    const result = await distributeTokens();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error distributing tokens', error: error.message });
  }
};

export const finishIco = async (req, res) => {
  try {
    const result = await endIco();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error ending ICO', error: error.message });
  }
};

export const updateIcoParams = async (req, res) => {
  try {
    const { totalSupply, tokenPrice, startTime, duration, roundType } = req.body;
    const result = await updateIcoParameters(totalSupply, tokenPrice, startTime, duration, roundType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating ICO parameters', error: error.message });
  }
};