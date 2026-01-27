// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('../helpers/userHelpers');
const { generateRandomString } = require('../helpers/utils');
const { redirectIfLoggedIn } = require('../middleware/auth');

// GET /login - Show login form
router.get('/login', redirectIfLoggedIn, (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('login', templateVars);
});

// POST /login - Handle login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  let userId = null;

  for (let user in req.app.locals.users) {
    if (req.app.locals.users[user].email === email) {
      if (bcrypt.compareSync(password, req.app.locals.users[user].password)) {
        userId = req.app.locals.users[user].id;
        break;
      }
    }
  }
  
  if (userId) {
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.send('Invalid email or password');
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
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  const foundEmail = getUserByEmail(email, req.app.locals.users);
  
  if (foundEmail) {
    return res.status(400).send('Email already in use!');
  }
      
  if (!email || !password) {
    return res.status(400).send('Email and password fields cannot be empty');
  }

  const userId = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = {
    id: userId,
    email: email,
    password: hash
  };

  req.app.locals.users[userId] = user;
  req.session.user_id = userId;
  
  res.redirect('/urls');
});

// POST /logout - Handle logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

module.exports = router;