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

//<-Task 3-------Create a users Object  ----------->
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
}


// user defined functions 
//=======================

  function authenticateUser(email, pwd){
    var flag = false;
    var temp = key;
    for(var key in users){
      if ((users[key].email === email) && (users[key].password===pwd)){
        flag = true;
        temp = key;
        break;
      }
    }
    if(flag)
      return users[key];
    else {
      return false;
    }
  }
///

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
      user: users[req.cookies["user_id"]]
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
    user: users[req.cookies["user_id"]]
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

//<-Task 4-------The login Route -----9 Update the Login Handler------>
app.post("/login", (req, res) => {
  var result = authenticateUser(req.body.email, req.body.password);
  console.log(result)
  if(result){ //user was authenticated with id and password
    res.cookie("user_id",result.id);
    console.log("OK")
    res.redirect("/");    
  } else { //user was not authenticated
    res.status(403);
    res.send("username and password were not right");
  }  
});

//<-Task 7-------Implement Logout  ----------->
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");        
});

//<-Task 2-------Create a Registration ----------->
app.get("/register", (req, res) => {
  res.render("register_index");       
});

app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");         
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];  
  res.redirect("/urls");        
});


//<-Task 4-------Create a Registration Handler ----------->
app.post("/register", (req, res) => {

 var foundemail = false;
 for (var userId in users) {
 if (users[userId].email == req.body.email) {
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
    userRandom = generateRandomString() 
    users[userRandom] = {
      id: userRandom,
      email: [req.body.email],
      password: [req.body.password]
    }
    res.cookie("user_id", userRandom)
  res.redirect("/urls");
  }
});

//<-Task 7-------Create a Login Page ----------->
app.get("/login", (req, res) => {
  res.cookie("user_id",req.body.email)
  res.render("loginPage");        
});




app.post("/urls/:id", (req, res) => {
    urlDatabase[req.params.id] = req.body.url;
  res.redirect("/urls");        
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});