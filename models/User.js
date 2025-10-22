const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
});

const userSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'vendor', 'seller'], default: 'user' },
  phone: { type: String , required: true},
  address: { type: addressSchema },
  image: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
