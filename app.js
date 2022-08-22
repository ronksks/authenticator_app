require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
// set up the express-session

app.use(
  session({
    secret: "my name is ronKSKS",
    resave: false,
    saveUninitialized: true,
  })
);
// initialize passport and combine it with session
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB"); //create secret Database
//create User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});
//set up the passportLocalMongoose
UserSchema.plugin(passportLocalMongoose);
//configure passportLocalMongoose
const User = new mongoose.model("User", UserSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//encryption
//var secret = "hello do you even know me";
//mongoose-encryption no more needed
//secretSchema.plugin(encrypt, { secret: process.env.SECRET_KEY,encryptedFields: ['password']  });
// secret collection

app.get("/", (req, res) => {
  res.render("home");
});
//logout route
app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return err;
    }
    res.redirect("/");
  });
});

app.get("/secrets", (req, res) => {
  res.render("secrets");
});
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("/secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(3000, function (req, res) {
  console.log("server is listening to port 3000");
});
