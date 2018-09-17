// Dependencies and Modules
const express = require("express"),
      bodyParser = require("body-parser"),
      session = require("express-session"),
      flash = require("express-flash"),
      exphbs = require('express-handlebars'),
      pg = require("pg"),
      Pool = pg.Pool,
      registrationPool = require("./public/registration");

// init modules, env , port
let app = express(),
    PORT = process.env.PORT || 3010;


// SSL connection
let useSSL = false;
let local 	= process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local){
	useSSL = true
}

// connect to db
const connectionString = process.env.DATABASE_URL || 'postgresql://trinesh:Trinesh1997@@localhost:5432/Registration';
const pool = new Pool ({
  connectionString,
  ssl: useSSL
})
// pool init
const regNums = registrationPool(pool);

// middle ware use
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());
app.use(express.static('public'));

app.set("view engine", "handlebars");
app.engine('handlebars', exphbs({defaultLayout: 'main'}))

app.use(session({
  secret: 'this is a string used for session in http',
  resave: false,
  saveUninitialized: true
}))

app.use(flash());   

app.get("/", async function (req, res, next) {
  let town = await pool.query("select * from cities");
  let town_rows = town.rows;

  res.render('home', {town_rows});
});


app.post("/registration", async function (req, res, next) {  
  try {

    // Registration numbers
  
  let RegNumber = req.body.regNum;
  var regprefix = RegNumber.substring(0, 2).trim();
  var TAGS_USED = ['all', 'CA', 'CJ', 'CY', 'CF'];
  let reg_plate = await regNums.addReg(RegNumber)
  let reg_numbers = await pool.query("SELECT * from registration_numbers");   
  let reg_rows = reg_numbers.rows;

  // select towns

  let town = await pool.query("select * from cities");
  let town_rows = town.rows;

  // errro messages

  if(RegNumber == undefined || !TAGS_USED.includes(regprefix)) {
    req.flash("error", "Please enter a valid registration number");
  }
  
  res.render("home", {reg_rows, town_rows});
  }
  catch(err) {
    console.log("error" + "" + err)
    next(err)
  }  
});  




app.get("/reset", async function (req, res, next) {
  let reset = await regNums.reset();
  res.redirect("/");
})

app.listen(PORT, function(){
  console.log('App starting on port', PORT)
})