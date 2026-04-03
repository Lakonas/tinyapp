// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateRandomString } = require('../helpers/utils');
const { redirectIfLoggedIn } = require('../middleware/auth');

const ANALYTICS_URL = 'https://analytics-service-production-37cd.up.railway.app/api/events';

// Reusable fire-and-forget analytics helper
const trackEvent = (event_type, metadata = {}) => {
  fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'shortstop',
      event_type,
      occurred_at: new Date().toISOString(),
      metadata
    })
  }).catch(err => console.error('Analytics error:', err.message));
};

// GET /login
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { user: null });
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findByEmail(email);
    
    if (!user) return res.status(400).send('Invalid email or password');
    
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    
    if (!passwordMatch) return res.status(400).send('Invalid email or password');
    
    req.session.userId = user.id;
    trackEvent('user_login', { email: user.email });
    res.redirect('/urls');
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// GET /register
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { user: null });
});

// POST /register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).send('Email and password fields cannot be empty');
  
  try {
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) return res.status(400).send('Email already in use!');
    
    const userId = generateRandomString();
    const passwordHash = bcrypt.hashSync(password, 10);
    const newUser = await User.create(userId, email, passwordHash);
    
    req.session.userId = newUser.id;
    trackEvent('user_registered', { email: newUser.email });
    res.redirect('/urls');
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Server error');
  }
});

// POST /logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

module.exports = router;