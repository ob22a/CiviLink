import mongoose from 'mongoose';
import User from './User.js';

// Minimal Admin discriminator - registers the 'admin' discriminator on User
const Admin = User.discriminator(
  'admin',
  new mongoose.Schema(
    {
      // future admin-specific fields will go here
    },
    { timestamps: true }
  )
);

export default Admin;
