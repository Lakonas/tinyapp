const express = require("express");             //Imported 
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { getUserByEmail, getUserById } = require('./helpers/userHelpers');
const { urlsForUser, urlExists, userOwnsUrl } = require('./helpers/urlHelpers');
const { generateRandomString } = require('./helpers/utils');
const {requireAuth, redirectIfLoggedIn} = require('./middleware/auth');
const app = express();
const cookieSession = require('cookie-session')
const PORT = 8080; // default port 8080







//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['gruelling'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use((req, res, next) => {
  if (req.session.user_id) {
    res.locals.userId = req.session.user_id;  // Store the userId in res.locals for easier access
  }
  next();
});


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: bcrypt.hashSync('1', 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: bcrypt.hashSync('2', 10),
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.com",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if(userId){
    return res.redirect("/urls")

  }
  
  res.redirect("/login")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    
    const templateVars = {
      user: null,
      message: "You must be logged in to view your URLs. Please log in or register first." // If no user is logged in, render a message prompting them to log in or register
    };
    return res.render("urls_index", templateVars);
  }
  const user = users[userId];
  

  const userUrls = urlsForUser(userId, urlDatabase);

  const templateVars = {
    user: user,
    urls: userUrls, 
    message: null
    
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const user = getUserById(userId, users);

  const templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const urlId = req.params.id;

  
  if (!res.locals.userId) {
    return res.status(403).render("403error", { message: "You must be logged in to view this URL." }); // Check if user is logged in (by checking the cookies)
  }

  const url = urlDatabase[urlId];

 
  if (!url || url.userID !== res.locals.userId) {
    return res.status(403).render("403error", { message: "You do not have permission to view or edit this URL." }); // Check if the logged-in user is the owner of the URL
  }

  const user = getUserById(res.locals.userId, users);

  
  res.render("urls_show", {                                                 // If user owns the URL, render the page (template)
    id: urlId,
    longURL: url.longURL,
    user: user                                                              // Pass the user object to the view
  });

});


app.post("/urls/:id/delete", requireAuth, (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  
  // Check if URL exists and user owns it
  if (!urlDatabase[id] || urlDatabase[id].userID !== userId) {
    return res.status(403).render("403error", { 
      message: "You cannot delete this URL." 
    });
  }
  
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/urls/:id/edit", requireAuth, (req, res) => {
  const userId = req.session.user_id;
  const urlID = req.params.id;
  const url = urlDatabase[urlID];

  if (!url) {
    return res.status(404).render("403error", { message: "URL not found." });
  }

  if (url.userID !== userId) {
    return res.status(403).render("403error", { message: "You do not have permission to edit this URL." });
  }

  const templateVars = {
    user: getUserById(userId, users),
    shortURL: urlID,
    longURL: url.longURL
  };

  res.render("urls_show", templateVars);
});




app.post('/urls/:id', requireAuth, (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;
  const newLongURL = req.body.longURL;

  // Check if URL exists and user owns it
  if (!urlDatabase[shortURL] || urlDatabase[shortURL].userID !== userId) {
    return res.status(403).render("403error", { 
      message: "You cannot edit this URL." 
    });
  }

  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});


app.get("/login", redirectIfLoggedIn, (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const { email, password} = req.body;
  
  let userId = null;

  

  for (let user in users) {
    if (users[user].email === email) {
      // Compare the plain-text password with the hashed password
      if (bcrypt.compareSync(password, users[user].password)) {
        console.log("User Found:", users[user]);
        userId = users[user].id;
        break;
      }
    }
  }
  if (userId) {
    console.log("Logging in user with ID:", userId);
    //res.cookie('user_id', userId);
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    console.log("Invalid credentials.");
    res.send('Invalid email Or Password');
  }
  
  
  
});
  
app.post('/logout', (req, res) => {
  req.session = null;  // Clear the user_id cookie
  res.redirect('/login');
});

app.get('/register', redirectIfLoggedIn, (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
 
  const { email, password } = req.body;

  
  const foundEmail = getUserByEmail(email,users);// Check if email already exists
  
  if (foundEmail) {
    return res.status(400).send('Email already in use!');
  }
      
  if (!email || !password) {
    return res.status(400).send('Email and password fields cannot be empty');
  }

  const userId = generateRandomString();// Generate a unique user ID and create a new user

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const user = { // Create the user object
    id: userId,
    email: email,
    password: hash
  };

  users[userId] = user;
  
  req.session.user_id = userId;
  console.log(users);
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;

  if (!longURL) {
    return res.status(404).render("404error", {message: " shortened URL not found"});

  }
  console.log(`Redirecting short URL: ${shortURL} to long URL: ${longURL}`);
  res.redirect(longURL);
});
