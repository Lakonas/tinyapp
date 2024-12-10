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


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.set("view engine", "ejs")


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
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase 
    
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],  // Retrieve username from cookies
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
  console.log(req.params,"req.params")
  const urlID = req.params.id;
  console.log(urlID, "urlID");
  const fullURL = urlDatabase[urlID];
  console.log(fullURL, "fullURL")
  const templateVars = { 
    username: req.cookies["username"],
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
  res.clearCookie('username'); // Remove the username cookie
  res.redirect('/urls'); // Redirect to the URLs page
});

app.get('/register', (req, res) => {
  res.render('register'); 
});