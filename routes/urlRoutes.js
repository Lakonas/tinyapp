// routes/urlRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Url = require('../models/Url');
const { generateRandomString } = require('../helpers/utils');
const { requireAuth } = require('../middleware/auth');
const QRCode = require('qrcode');

// GET /urls - Show all URLs for logged-in user
router.get('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  
  try {
    const user = await User.findById(userId);
    const urlsFromDb = await Url.findByUserId(userId);
    
    // Transform database format to template format
    const urls = {};
    urlsFromDb.forEach(url => {
      urls[url.short_code] = {
        longURL: url.long_url,
        userId: url.user_id
      };
    });
    
    const templateVars = {
      user: user,
      urls: urls,
      message: null
    };
    
    res.render('urls_index', templateVars);
  } catch (err) {
    console.error('Error loading URLs:', err);
    res.status(500).send('Server error');
  }
});

// GET /urls/new - Show form to create new URL
router.get('/new', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  
  try {
    const user = await User.findById(userId);
    
    const templateVars = {
      user: user,
    };
    
    res.render('urls_new', templateVars);
  } catch (err) {
    console.error('Error loading new URL form:', err);
    res.status(500).send('Server error');
  }
});

// POST /urls - Create new short URL
router.post('/', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  let longUrl = req.body.longURL;
  
  // Validation
  if (!longUrl) {
    return res.status(400).send('URL is required');
  }
  
  // Auto-fix: add https:// if missing protocol
  if (!longUrl.startsWith('http://') && !longUrl.startsWith('https://')) {
    longUrl = 'https://' + longUrl;
  }
  
  try {
    const shortCode = generateRandomString();
    await Url.create(shortCode, longUrl, userId);
    res.redirect(`/urls/${shortCode}`);
  } catch (err) {
    console.error('Error creating URL:', err);
    res.status(500).send('Server error');
  }
});

// GET /urls/:id - Show single URL details
router.get('/:id', requireAuth, async (req, res) => {
  const shortCode = req.params.id;
  const userId = req.session.userId;
  
  try {
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).render('403error', { message: 'URL not found.' });
    }
    
    if (url.user_id !== userId) {
      return res.status(403).render('403error', { 
        message: 'You do not have permission to view or edit this URL.' 
      });
    }
    
    const user = await User.findById(userId);
    
    res.render('urls_show', {
      id: shortCode,
      longURL: url.long_url,
      user: user
    });
  } catch (err) {
    console.error('Error loading URL details:', err);
    res.status(500).send('Server error');
  }
});

// POST /urls/:id - Update URL
router.post('/:id', requireAuth, async (req, res) => {
  const shortCode = req.params.id;
  const userId = req.session.userId;
  let newLongUrl = req.body.longURL;
  
  // Validation
  if (!newLongUrl) {
    return res.status(400).send('URL is required');
  }
  
  // Auto-fix: add https:// if missing protocol
  if (!newLongUrl.startsWith('http://') && !newLongUrl.startsWith('https://')) {
    newLongUrl = 'https://' + newLongUrl;
  }
  
  try {
    const url = await Url.findByShortCode(shortCode);
    
    if (!url || url.user_id !== userId) {
      return res.status(403).send('Not authorized');
    }
    
    await Url.update(shortCode, newLongUrl);
    res.redirect('/urls');
  } catch (err) {
    console.error('Error updating URL:', err);
    res.status(500).send('Server error');
  }
});

// POST /urls/:id/delete - Delete URL
router.post('/:id/delete', requireAuth, async (req, res) => {
  const shortCode = req.params.id;
  const userId = req.session.userId;
  
  try {
    const url = await Url.findByShortCode(shortCode);
    
    if (!url || url.user_id !== userId) {
      return res.status(403).render('403error', { 
        message: 'You cannot delete this URL.' 
      });
    }
    
    await Url.deleteByShortCode(shortCode);
    res.redirect('/urls');
  } catch (err) {
    console.error('Error deleting URL:', err);
    res.status(500).send('Server error');
  }
});

// GET /urls/:id/edit - Show edit form (redirect to show page)
router.get('/:id/edit', requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const shortCode = req.params.id;
  ''
  try {
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).render('403error', { message: 'URL not found.' });
    }
    
    if (url.user_id !== userId) {
      return res.status(403).render('403error', { 
        message: 'You do not have permission to edit this URL.' 
      });
    }
    
    const user = await User.findById(userId);
    
    const templateVars = {
      user: user,
      shortURL: shortCode,
      longURL: url.long_url
    };
    
    res.render('urls_show', templateVars);
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Server error');
  }
});

// GET /urls/:id/qr - Generate QR code for short URL
router.get('/:id/qr', async (req, res) => {
  const shortCode = req.params.id;
  
  try {
    // Find URL in database
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).send('URL not found');
    }
    
    // Build the full short URL
    const shortURL = `http://localhost:8080/u/${shortCode}`;
    
    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(shortURL, {
      width: 300,
      margin: 2
    });
    
    // Set content type and send image
    res.type('image/png');
    res.send(qrCodeBuffer);
    
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).send('Error generating QR code');
  }
});

module.exports = router;

module.exports = router;