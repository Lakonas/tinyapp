const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require('morgan')
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

//Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set("view engine", "ejs")

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
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  
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
  const user = users[userId];

  const templateVars = {
    user: user,
    urls: urlDatabase //change
    
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId]; // Lookup user object using user_id cookie

  const templateVars = {
    user: user,  // 
  };
  res.render("urls_new", templateVars);  // Pass it to the view
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL //Main obejective to save short URL and NEW url to our URLS object
                                 //Grab longURL with req.body.longurl. Generate short URL
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];

  console.log(req.params,"req.params")
  const urlID = req.params.id;
  console.log(urlID, "urlID");
  const fullURL = urlDatabase[urlID];
  console.log(fullURL, "fullURL")


  const templateVars = { 
    user: user,
    id: req.params.id, 
    longURL: fullURL };


  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
   console.log(req.params,"req.params");
   const  id = req.params.id;
   delete urlDatabase[id];
   res.redirect('/urls');
});

app.get("/urls/:id/edit", (req,res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  urlDatabase[shortURL] = longURL;
  const templateVars = {
    username: req.cookies["username"],
    shortURL: shortURL,  
    longURL: longURL,   
  };

  res.render('urls_show',templateVars);
});



app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id; 
  const newLongURL = req.body.longURL; 

  urlDatabase[shortURL] = newLongURL; // Update the URL in the database

  res.redirect('/urls'); // Redirect to the list of URLs
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  
  res.cookie('username', username)
  
  // Redirect to /urls after login
  res.redirect('/urls');
});
  
app.post('/logout', (req, res) => {
  res.clearCookie('user_id') // Remove the username cookie
  res.redirect('/urls'); // Redirect to the URLs page
});

app.get('/register', (req, res) => {
  res.render('register'); 
});

app.post('/register', (req, res) => {
 
  const { email, password } = req.body;

  // Check if email already exists
  for (let userId in users) {
    if (users[userId].email === email) {
      return res.send('Email already in use!');
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

  // Add the new user object to the 'users' global object
  users[userId] = user;

  // Set the user_id cookie
  res.cookie("user_id", userId);

  // Log the users object to verify the new user is added
  console.log(users);

  // Redirect to the /urls page after successful registration
  res.redirect('/urls')
});

