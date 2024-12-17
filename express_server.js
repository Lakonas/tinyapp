const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function urlsForUser(id) {
  const userUrls = {};  // Initialize an empty object to store the user's URLs
  
  // Iterate over the urlDatabase
  for (let shortURL in urlDatabase) {
    // If the userID matches the given id, include the URL
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;  // Return the filtered URLs
}

function getUserById(userId) {
  return users[userId]; // Retrieve the user object by userId
}


//Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use((req, res, next) => {
  if (req.cookies["user_id"]) {
    res.locals.userId = req.cookies["user_id"];  // Store the userId in res.locals for easier access
  }
  next();
});


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "2",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
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
  const userId = req.cookies["user_id"];//change

  if (!userId) {
    // If no user is logged in, render a message prompting them to log in or register
    const templateVars = {
      user: null,
      message: "You must be logged in to view your URLs. Please log in or register first."
    };
    return res.render("urls_index", templateVars);
  }
  const user = users[userId];
  

  const userUrls = urlsForUser(userId);

  const templateVars = {
    user: user,
    urls: urlDatabase, //change
    message: null
    
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];

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
  const userId = req.cookies["user_id"];

  if (!userId) {
    return res.send("<html><body>You must be logged in to create a new url. Please log in first.</body></html>");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;

  // Save the new URL with the associated user ID
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: userId, // Associate the URL with the logged-in user
  };

  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const urlId = req.params.id;

  // Check if user is logged in (by checking the cookies)
  if (!res.locals.userId) {
    return res.status(403).render("403error", { message: "You must be logged in to view this URL." });
  }

  const url = urlDatabase[urlId];

  // Check if the logged-in user is the owner of the URL
  if (!url || url.userID !== res.locals.userId) {
    return res.status(403).render("403error", { message: "You do not have permission to view or edit this URL." });
  }

  const user = getUserById(res.locals.userId);

  // If user owns the URL, render the page (template)
  res.render("urls_show", {
    id: urlId,
    longURL: url.longURL,
    user: user // Pass the user object to the view
   });

});


app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params,"req.params");
  const  id = req.params.id;
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.get("/urls/:id/edit", (req, res) => {
  const userId = req.cookies["user_id"]; // Get user ID from cookie
  
  // Check if the user is logged in
  if (!userId) {
    return res.status(403).render("403error", { message: "You must be logged in to edit a URL." });
  }

  const urlID = req.params.id; // Get the short URL ID from the request
  const url = urlDatabase[urlID]; // Find the URL in the database

  // Check if the URL exists
  if (!url) {
    return res.status(404).render("403error", { message: "URL not found." });
  }

  // Check if the logged-in user owns the URL
  if (url.userID !== userId) {
    return res.status(403).render("403error", { message: "You do not have permission to edit this URL." });
  }

  // If the user is logged in and owns the URL, render the edit page
  const templateVars = {
    user: users[userId],
    shortURL: urlID,
    longURL: url.longURL
  };

  res.render("urls_edit", templateVars); // Render the page to edit the URL
});




app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;

  urlDatabase[shortURL].longURL = newLongURL;// Update the URL in the database

  res.redirect('/urls'); // Redirect to the list of URLs
});


app.get("/login", (req, res) => {

  const userId = req.cookies["user_id"];
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
    if (users[user].email   === email && users[user].password === password) {

      console.log("User Found:", users[user]);
      userId = users[user].id;
      break;
    }
  }
  if (userId) {
    console.log("Logging in user with ID:", userId);
    res.cookie('user_id', userId);
    res.redirect('/urls');
  } else {
    console.log("Invalid credentials.");
    res.send('Invalid email Or Password');
  }
  
  
  
});
  
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');  // Clear the user_id cookie
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    // Redirect logged-in users to /urls
    return res.redirect("/urls");
  }
  
  
  const templateVars = {
    user: null,
  };
  res.render('register', templateVars);
  
});

app.post('/register', (req, res) => {
 
  const { email, password } = req.body;

  // Check if email already exists
  for (let userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send('Email already in use!');
    }

  }


  if (!email || !password) {
    return res.status(400).send('Email and password fields cannot be empty');
  }

  // Generate a unique user ID and create a new user
  const userId = generateRandomString();
  
  // Create the user object
  const user = {
    id: userId,
    email: email,
    password: password
  };

  users[userId] = user;
  res.cookie("user_id", userId);
  console.log(users);
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;

  if (!longURL) {
    return res.status(404).render("404error", {message: " shortened URL not found"});

  }
  res.redirect(longURL);
});
