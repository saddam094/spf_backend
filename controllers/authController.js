import cloudinary from './config/cloudinary.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
    const { name, email, password, role, phone, address, profileImage } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ statusCode: 400, message: 'User already exists' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate custom ID: "user" + YYYYMMDDHHmmss + 3-digit random number
        const now = new Date();
        const userId = 'user' +
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0') +
            Math.floor(Math.random() * 900 + 100); // random 100-999

        const newUser = new User({
            _id: userId,
            name,
            email,
            password: hashedPassword,
            role,
            phone,
            address,
            image: profileImage
        });

        await newUser.save();
        res.status(200).json({ statusCode: 200, message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};


// Login user
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid email' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role, 
                phone: user.phone, 
                address: user.address 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/// Get Profile Presigned URL
const getProfilePresignedUrl = async (req, res) => {
  try {
    const { fileName, folder = "profile" } = req.body;
    if (!fileName) {
      return res.status(400).json({ statusCode: 400, message: "fileName is required" });
    }
    // Clean file name
    const cleanFileName = fileName.trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");
    // Create unique key / public_id
    const timestamp = Math.floor(Date.now() / 1000);
    const key = `${folder}/${cleanFileName}_${timestamp}`;
    // Params to sign
    const paramsToSign = {
      timestamp,
      public_id: key,
      folder
    };
    // Generate signature
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    // Signed URL for direct upload (Cloudinary expects POST with multipart/form-data)
    const signedUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload?timestamp=${timestamp}&public_id=${encodeURIComponent(key)}&folder=${folder}&signature=${signature}&api_key=${process.env.CLOUDINARY_API_KEY}`;
    const uploadDetails = [
      {
        fileName,
        signedUrl,
        contentType: "image/jpeg"
      }
    ];
    res.status(200).json({
      statusCode: 200,
      body: { uploadDetails }
    });
  } catch (err) {
    console.error("Error generating Cloudinary presigned URL:", err);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

export { register, login, getProfilePresignedUrl };