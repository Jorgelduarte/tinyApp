var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "dlvyP6": "http://www.cbc.ca"
};



app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/hello", (req, res) => {
    res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    let templateVars = { 
      urls: urlDatabase, 
      username: req.cookies["username"]
    };
    res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});





app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:id/edit", (req, res) => {
  res.redirect("/urls/"+[req.params.id]);        
});

//<-Task 4-------The login Route ----------->
app.post("/login", (req, res) => {
  res.cookie("username",req.body.username)
  res.redirect("/urls");        
});



app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");         
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];  
  res.redirect("/urls");        
});



app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.url;
  res.redirect("/urls");        
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});