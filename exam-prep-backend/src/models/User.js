
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ROLES = require('../utils/roles');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
  subscription: {
    plan: { type: String, enum: ['Demo', 'Monthly', '6-Month', 'Yearly'], default: 'Demo' },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: false },
  },
  // Other user details from registration form
  dob: { type: Date },
  gender: { type: String },
  province: { type: String },
  city: { type: String },
  educationBoard: { type: String },
  mobileNumber: { type: String },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

UserSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
