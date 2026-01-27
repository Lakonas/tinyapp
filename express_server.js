const express = require("express");             //Imported 
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { getUserByEmail, getUserById } = require('./helpers/userHelpers');
const { urlsForUser, urlExists, userOwnsUrl } = require('./helpers/urlHelpers');
const { generateRandomString } = require('./helpers/utils');
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


app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {

    return res.redirect("/login");
  }
  const user = users[userId]; // Lookup user object using user_id cookie

  const templateVars = {
    user: user,  //
  };
  res.render("urls_new", templateVars);  // Pass it to the view
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (!userId) {
    return res.send("<html><body>You must be logged in to create a new url. Please log in first.</body></html>");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

 
  urlDatabase[shortURL] = {
    longURL: longURL,                // Save the new URL with the associated user ID
    userID: userId, // Associate the URL with the logged-in user
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


app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params,"req.params");
  const  id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/urls/:id/edit", (req, res) => {
  const userId =  req.session.user_id;// Get user ID from cookie
  
  
  if (!userId) {
    return res.status(403).render("403error", { message: "You must be logged in to edit a URL." });// Check if the user is logged in
  }

  const urlID = req.params.id; // Get the short URL ID from the request
  const url = urlDatabase[urlID]; // Find the URL in the database

 
  if (!url) {
    return res.status(404).render("403error", { message: "URL not found." });  // Check if the URL exists
  }

  
  if (url.userID !== userId) {
    return res.status(403).render("403error", { message: "You do not have permission to edit this URL." }); // Check if the logged-in user owns the URL
  }

  
  const templateVars = {
    user: users[userId],
    shortURL: urlID,                                     // If the user is logged in and owns the URL, render the edit page
    longURL: url.longURL
  };

  res.render("urls_show", templateVars); // Render the page to edit the URL
});




app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = newLongURL;// Update the URL in the database

  res.redirect('/urls'); // Redirect to the list of URLs
});


app.get("/login", (req, res) => {

  const userId = req.session.userId;
  if (userId) {
    // Redirect logged-in users to /urls
    return res.redirect("/urls");
  }
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

app.get('/register', (req, res) => {
  const userId = req.session.user_id
  if (userId) {
    
    return res.redirect("/urls"); // Redirect logged-in users to /urls
  }
  
  
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
