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

// for (var x in users){
//     var y = (users[x].email)
//     if (y === "user2@example.com"){
//         console.log("xupa")
//     }
// }


console.log(Object.values(users))

  