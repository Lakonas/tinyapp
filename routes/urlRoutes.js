// routes/urlRoutes.js
const express = require('express');
const router = express.Router();
const { getUserById } = require('../helpers/userHelpers');
const { urlsForUser } = require('../helpers/urlHelpers');
const { generateRandomString } = require('../helpers/utils');
const { requireAuth } = require('../middleware/auth');

// GET /urls - Show all URLs for logged-in user
router.get('/', requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const user = getUserById(userId, req.app.locals.users);
  const userUrls = urlsForUser(userId, req.app.locals.urlDatabase);

  const templateVars = {
    user: user,
    urls: userUrls,
    message: null
  };
  
  res.render('urls_index', templateVars);
});

// GET /urls/new - Show form to create new URL
router.get('/new', requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const user = getUserById(userId, req.app.locals.users);

  const templateVars = {
    user: user,
  };
  
  res.render('urls_new', templateVars);
});

// POST /urls - Create new short URL
router.post('/', requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  req.app.locals.urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };

  res.redirect(`/urls/${shortURL}`);
});

// GET /urls/:id - Show single URL details
router.get('/:id', requireAuth, (req, res) => {
  const urlId = req.params.id;
  const userId = req.session.user_id;

  if (!req.app.locals.urlDatabase[urlId]) {
    return res.status(404).render('403error', { message: 'URL not found.' });
  }

  const url = req.app.locals.urlDatabase[urlId];

  if (url.userID !== userId) {
    return res.status(403).render('403error', { 
      message: 'You do not have permission to view or edit this URL.' 
    });
  }

  const user = getUserById(userId, req.app.locals.users);

  res.render('urls_show', {
    id: urlId,
    longURL: url.longURL,
    user: user
  });
});

// POST /urls/:id - Update URL
router.post('/:id', requireAuth, (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;
  const newLongURL = req.body.longURL;

  if (!req.app.locals.urlDatabase[shortURL] || 
      req.app.locals.urlDatabase[shortURL].userID !== userId) {
    return res.status(403).render('403error', { 
      message: 'You cannot edit this URL.' 
    });
  }

  req.app.locals.urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

// POST /urls/:id/delete - Delete URL
router.post('/:id/delete', requireAuth, (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  
  if (!req.app.locals.urlDatabase[id] || 
      req.app.locals.urlDatabase[id].userID !== userId) {
    return res.status(403).render('403error', { 
      message: 'You cannot delete this URL.' 
    });
  }
  
  delete req.app.locals.urlDatabase[id];
  res.redirect('/urls');
});

// GET /urls/:id/edit - Show edit form (redirect to show page)
router.get('/:id/edit', requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const urlID = req.params.id;
  const url = req.app.locals.urlDatabase[urlID];

  if (!url) {
    return res.status(404).render('403error', { message: 'URL not found.' });
  }

  if (url.userID !== userId) {
    return res.status(403).render('403error', { 
      message: 'You do not have permission to edit this URL.' 
    });
  }

  const templateVars = {
    user: getUserById(userId, req.app.locals.users),
    shortURL: urlID,
    longURL: url.longURL
  };

  res.render('urls_show', templateVars);
});

module.exports = router;