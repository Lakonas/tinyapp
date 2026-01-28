// server.js
const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8080;

// Import routes
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['gruelling'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Make res.locals.userId available to all routes
app.use((req, res, next) => {
  if (req.session.user_id) {
    res.locals.userId = req.session.user_id;
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    return res.redirect('/urls');
  }
  
  res.redirect('/login');
});

// Mount route modules
app.use('/', authRoutes);
app.use('/urls', urlRoutes);

// Redirect route (short URL to long URL)
// Redirect route (short URL to long URL)
app.get('/u/:id', async (req, res) => {
  const shortCode = req.params.id;
  
  try {
    const Url = require('./models/Url');
    const url = await Url.findByShortCode(shortCode);
    
    if (!url) {
      return res.status(404).render('404error', { message: 'Shortened URL not found' });
    }
    
    res.redirect(url.long_url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
});
// Start server
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});