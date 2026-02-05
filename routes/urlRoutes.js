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
    const Click = require('../models/Click');
    
    // Transform database format to template format and add click counts
    const urls = {};
    for (const url of urlsFromDb) {
      const clickCount = await Click.countByShortCode(url.short_code);
      urls[url.short_code] = {
        longURL: url.long_url,
        userId: url.user_id,
        clicks: clickCount
      };
    }
    
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
router.get('/:id/analytics', requireAuth, async (req, res) => {
  const shortCode = req.params.id;
  const userId = req.session.userId;
  
  try {
    const Click = require('../models/Click');
    
    // Get URL details
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).send('URL not found');
    }
    
    if (url.user_id !== userId) {
      return res.status(403).send('Not authorized');
    }
    
    // Get analytics data
    const totalClicks = await Click.countByShortCode(shortCode);
    const uniqueVisitors = await Click.countUniqueVisitors(shortCode);
    const recentClicks = await Click.getRecentClicks(shortCode, 10);
    const clicksByDate = await Click.getClicksByDate(shortCode, 7);
    
    // Prepare chart data (last 7 days)
    const chartLabels = clicksByDate.map(c => {
      const date = new Date(c.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const chartData = clicksByDate.map(c => parseInt(c.count));
    
    // Get user info
    const user = await User.findById(userId);
    
    res.render('urls_analytics', {
      user: user,
      shortCode: shortCode,
      longURL: url.long_url,
      totalClicks: totalClicks,
      uniqueVisitors: uniqueVisitors,
      recentClicks: recentClicks,
      chartLabels: JSON.stringify(chartLabels),
      chartData: JSON.stringify(chartData)
    });
  } catch (err) {
    console.error('Error loading analytics:', err);
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
router.put('/:id', requireAuth, async (req, res) => {
  console.log('PUT route hit! shortCode:', req.params.id);  
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
router.delete('/:id', requireAuth, async (req, res) => {
  console.log('DELETE route hit! shortCode:', req.params.id);  
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
    const baseURL = process.env.BASE_URL || 'http://localhost:8080';
    const shortURL = `${baseURL}/u/${shortCode}`;
    
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

// GET /urls/:id/analytics - Show analytics for a URL


module.exports = router;
module.exports = router;

