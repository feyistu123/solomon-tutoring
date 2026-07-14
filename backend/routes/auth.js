const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST /api/auth/login
// @desc    Login user and get JWT token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide username and password' 
      });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Send response with token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

// @route   POST /api/auth/register (Optional - for initial setup)
// @desc    Register a new user
// @access  Private (should be removed after first use)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide username and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ 
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
});

module.exports = router;