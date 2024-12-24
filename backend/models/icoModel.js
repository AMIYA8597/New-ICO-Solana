import mongoose from 'mongoose';

const icoSchema = mongoose.Schema({
  totalSupply: {
    type: Number,
    required: true,
  },
  tokenPrice: {
    type: Number,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  roundType: {
    type: String,
    enum: ['SeedRound', 'PreICO', 'PublicICO'],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tokensSold: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const ICO = mongoose.model('ICO', icoSchema);

export default ICO;