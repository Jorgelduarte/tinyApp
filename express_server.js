var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

// URL database
var urlDatabase = {
  b2xVn2: {
    userID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
  s9m5xK: {
    userID: "userRandomID",
    longURL: "http://www.google.com"
  },
  dlvyP6: {
    userID: "user2RandomID",
    longURL: "http://www.cbc.ca"
  }
};

// user database with bcrypt password and real password as comment. 
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: '$2a$10$1p3n5GRt8xvm0.QfkXPQnuOGLrOuUPV6Xki/fAYGWnwEzyB8MrOp.'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$pzO8h45b7DV/pvQzzttmF.JW2tL8GEi.KcJq9ptfoeiTzI85E7jfi"
    //"dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "$2a$10$KBE35tZv5nnnhC0pcTILEuLF53pN9/eXfTsJmf1Y4sdw2/zJPLYvS"
    //"top-music"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "$2a$10$X9IqRXXMq50ljTlw/ov37OroESOk6oYXnH1ACiJFzV5zuCkxIgnV2"
    //"ferrari25"
  }
};

// Generate a aleatory string
function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Return only URLs that belongs to the user
function urlsForUser(id) {
  var urlsForUser = {};
  for(var key in urlDatabase){
    if(urlDatabase[key].userID === id){
      var newUrlObject = {
        shortURL: key,
        longURL: urlDatabase[key].longURL
      };
      urlsForUser[key] = newUrlObject;
    }
  }
  return urlsForUser;
}

// Authenticate the user with bcrypt password
function authenticateUser(email, pwd) {
  for(var key in users){
    if (users[key].email === email) {
      var passMatch = bcrypt.compareSync(pwd, users[key].password);
      if (passMatch){
        return users[key];
      }
      break;
    }
  }
  return false;
}

// main page. If logged in redirect to URLS. If not, to login
app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("urls");
  } else {
    res.redirect("/login");
  }
});

// change urlsDatabe to string with json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//If the user is logged in rende to urls_index. Otherwise show a error message.
app.get("/urls", (req, res) => {
  if(req.session.user_id) {
    var userId = req.session.user_id;
    var user = users[userId];
    var result = urlsForUser(userId);
    let templateVars = {
      user: user,
      urls: result
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("Error! You are not logged in !!");
  }
});

// Allow the user input new URL only if the user is logged in. Otherwise, redirect to login page.
app.get("/urls/new", (req, res) => {
  if (users[req.session["user_id"]]) {
    res.render("urls_new");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL.longURL);
});

//Create new short urls
app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = {
    userID: users[req.session["user_id"]].id,
    longURL: req.body.longURL
  }
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  var userId = users[req.session["user_id"]].id;
  var shortURL = req.params.id;

  if (userId === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.url;
    res.redirect("/urls");
  } else {
    res.send("This URL does not belong to you !!");
  }
});

app.post("/login", (req, res) => {
  
  var result = authenticateUser(req.body.email, req.body.password);
  
  if(result) {
    req.session.user_id = result.id;
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("username and password were not right");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register_index");
});

app.post("/urls", (req, res) => {
  res.send("Ok");
});

// Allow delete URLs only if this belongs to the user
app.post("/urls/:id/delete", (req, res) => {
  var userId = users[req.session.user_id].id;
  var shortURL = req.params.id;
  if (userId === urlDatabase[shortURL].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send("You don't have permission to do that !!");
  }
});

// To register a new user. Before, It is checked if there is a the same email. The new password is hashing by bcrypt.
app.post("/register", (req, res) => {
  var foundemail = false;
  for (var userId in users) {
    if (users[userId].email === req.body.email) {
      foundemail = true;
      break;
    }
  }

  if (!req.body.password || !req.body.email) {
    res.status(400);
    res.send('Password or email can be empty');
  } else if (foundemail){
    res.status(400);
    res.send('Email already exist');
  } else {

    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    userRandom = generateRandomString();
    users[userRandom] = {
      id: userRandom,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userRandom;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  res.render("loginPage");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});