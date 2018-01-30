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


function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


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

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: 'test'
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "top-music"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "user4@example.com",
    password: "ferrari25"
  }
};

function urlsForUser(id) {
  var urlsForUser = {};
  for(var key in urlDatabase){
    if(urlDatabase[key].userID === id){
      var tempObject;
      tempObject = {
        shortURL: key,
        longURL: urlDatabase[key].longURL
      };
      urlsForUser[key] = tempObject;
    }
  }
  return urlsForUser;
}

function urlsForAll() {
  var urlsForAll = {};
  for(var key in urlDatabase){
    var tempObject;
    tempObject = {
      shortURL: key,
      longURL: "Private"
    };
    urlsForAll[key] = tempObject;
  }
  return urlsForAll;
}

function authenticateUser(email, pwd) {
  var flag = false;
  var temp = key;
 
  for(var key in users){
    if (users[key].email === email) {
      var passMatch = bcrypt.compareSync(pwd, users[key].password);
      if (pwd === users[key].password || passMatch){
        flag = true;
        temp = key;
        break;
      }
    }
  }
  if(flag){
    return users[key];
  } else {
    return false;
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

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
    let templateVars = {
      user: users[req.session["user_id"]],
      urls: urlsForAll()
    };
    res.render("urls_index", templateVars);
  }
});

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
    longURL: urlDatabase[req.params.id],
    user: users[req.session["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL.longURL);
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