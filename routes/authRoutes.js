// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios'); // ← ADD THIS for analytics tracking
const User = require('../models/User');
const { generateRandomString } = require('../helpers/utils');
const { redirectIfLoggedIn } = require('../middleware/auth');

// Analytics Service URL - where we send tracking events
const ANALYTICS_URL = 'https://analytics-service-production-37cd.up.railway.app/api/events';

// GET /login - Show login form
router.get('/login', redirectIfLoggedIn, (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('login', templateVars);
});

// POST /login - Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user in database
    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(400).send('Invalid email or password');
    }
    
    // Check password
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(400).send('Invalid email or password');
    }
    
    // Login successful
    req.session.userId = user.id;

    // ← ANALYTICS: Track successful login
    axios.post(ANALYTICS_URL, {
      source: 'shortstop',
      event_type: 'user_login',
      occurred_at: new Date().toISOString(),
      metadata: { email: user.email }
    }).catch(err => console.error('Analytics error:', err.message));
    // ↑ .catch() so analytics failure never breaks login

    res.redirect('/urls');
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// GET /register - Show registration form
router.get('/register', redirectIfLoggedIn, (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('register', templateVars);
});

// POST /register - Handle registration
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).send('Email and password fields cannot be empty');
  }
  
  try {
    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.status(400).send('Email already in use!');
    }
    
    // Create new user
    const userId = generateRandomString();
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const newUser = await User.create(userId, email, passwordHash);
    
    // Login the new user
    req.session.userId = newUser.id;

    // ← ANALYTICS: Track new user registration
    axios.post(ANALYTICS_URL, {
      source: 'shortstop',
      event_type: 'user_registered',
      occurred_at: new Date().toISOString(),
      metadata: { email: newUser.email }
    }).catch(err => console.error('Analytics error:', err.message));
    // ↑ .catch() so analytics failure never breaks registration

    res.redirect('/urls');
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Server error');
  }
});

// POST /logout - Handle logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

module.exports = router;