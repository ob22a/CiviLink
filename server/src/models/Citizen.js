import mongoose from 'mongoose';
import User from './User.js';

// Citizen discriminator to allow citizen-specific fields (e.g., profileCompletePct)
const Citizen = User.discriminator(
  'citizen',
  new mongoose.Schema(
    {
      profileCompletePct: {
        type: Number,
        default: 0,
      },
    },
    { timestamps: true }
  )
);

export default Citizen;
