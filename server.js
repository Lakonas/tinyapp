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

// Database (in-memory for now)
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'a@a.com',
    password: bcrypt.hashSync('1', 10),
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'b@b.com',
    password: bcrypt.hashSync('2', 10),
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: 'http://www.lighthouselabs.com',
    userId: 'userRandomID',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userId: 'userRandomID',
  },
};

// Make databases available to routes via app.locals
app.locals.users = users;
app.locals.urlDatabase = urlDatabase;

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
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;

  if (!longURL) {
    return res.status(404).render('404error', { message: 'Shortened URL not found' });
  }
  
  res.redirect(longURL);
});

// Start server
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});