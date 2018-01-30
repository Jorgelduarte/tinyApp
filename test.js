const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
}

for (var x in users){
    var y = (users[x].id)
    console.log(y)
}

for (var x in urlDatabase){
  var userIdUrl = (urlDatabase[x].id)

// for (var x in users){
//     var y = (users[x].email)
//     console.log(y)
//     if (y === "user2@example.com"){
//         console.log("xupa")
//     }
// }

// var x = users["userRandomID"]["id"]
// console.log(x)

//var x = Object.values(users)
//console.log(x["email"])

  