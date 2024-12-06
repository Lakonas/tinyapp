const express = require("express");
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


app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { id: req.params.id, longURL: fullURL/* What goes here? */ };
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
    shortURL: shortURL,  
    longURL: longURL,   
  };

  res.render('urls_show',templateVars);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id; 
  const newLongURL = req.body.longURL; 

  
  urlDatabase[shortURL] = newLongURL;

  
  res.redirect(`/urls/${shortURL}`);
});