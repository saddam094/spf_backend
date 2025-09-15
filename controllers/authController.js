const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
    const { name, email, password, role, phone, address } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });

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
            address
        });

        await newUser.save();
        res.status(200).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
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

module.exports = { register, login };