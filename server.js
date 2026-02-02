// server.js
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

const app = express();
const PORT = 8080;

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');

// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['gruelling'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Make res.locals.userId available to all routes
app.use((req, res, next) => {
  if (req.session.userId) {
    res.locals.userId = req.session.userId;
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  const userId = req.session.userId;

  if (userId) {
    return res.redirect('/urls');
  }
  
  res.redirect('/login');
});

// Mount route modules
app.use('/', authRoutes);
app.use('/urls', urlRoutes);

// Redirect route (short URL to long URL)
app.get('/u/:id', async (req, res) => {
  const shortCode = req.params.id;
  
  try {
    const Url = require('./models/Url');
    const Click = require('./models/Click');
    
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).render('404error', { message: 'Shortened URL not found' });
    }
    
    // Log the click (IP and user agent disabled for demo/privacy)
    // In production: await Click.create(url.id, req.ip, req.get('user-agent'));
    await Click.create(shortCode, null, null);
    
    res.redirect(url.long_url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
});

// 404 handler - must be AFTER all other routes
app.use((req, res) => {
  res.status(404).render('404error', { 
    message: '404 - Page Not Found',
    user: null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});