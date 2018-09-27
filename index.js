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
  PORT = process.env.PORT || 3015;


// SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
  useSSL = true
}

// connect to db
const connectionString = process.env.DATABASE_URL || 'postgresql://trinesh:Trinesh1997@@localhost:5432/Registration';
const pool = new Pool({
  connectionString,
  ssl: useSSL
})
// pool init
const regNums = registrationPool(pool);

// middle ware use
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.set("view engine", "handlebars");
app.engine('handlebars', exphbs({ defaultLayout: 'main' }))

app.use(session({
  secret: 'this is a string used for session in http',
  resave: false,
  saveUninitialized: true
}))

app.use(flash());

app.get("/", async function (req, res, next) {
  try {
    // Keep town selection on screen
    var filterTowns = await regNums.getAllTowns();
    res.render('home', {filterTowns});
  }
  catch (err) {
    console.log("error" + "" + err)
    next(err)
  }
});


app.post("/AddRegistration", async function (req, res, next) {
  try {
    // Registration number add function 
    let RegNumber = req.body.regNum;
    let reg_plate = await regNums.addReg(RegNumber); 
    
    // Shows all registration numbers once add button is pressed
    let reg_rows = await regNums.checkAllReg();

    // Keep town selection on screen
    var filterTowns = await regNums.getAllTowns();

    if(reg_plate == true) {
      req.flash('msgTwo', 'added registration number succesfully!')
    }

    else if (reg_plate == false){
      req.flash('msg', `Please enter a registration number with a valid format`);
      req.flash('msg-three', `Eg: CY 123, CA 123, CL 123, CJ 123`)      
    }

    if (reg_plate == undefined) {
      req.flash("msg", "Registration number already exits")
    } 

    console.log(reg_plate);
    
    res.render('home', {reg_rows, filterTowns})
  }

  catch (err) {
    console.log("error" + "" + err)
    next(err)
  }
});

app.get('/showAllReg', async function (req, res) {
  let reg_rows = await regNums.checkAllReg();
  var filterTowns = await regNums.getAllTowns();


  res.render('home', {reg_rows, filterTowns});
});

app.get('/filter/:town', async function (req ,res, next) {
  try {
    let towns =  req.params.town;
    
    var filterTowns = await regNums.getAllTowns(towns); 
    var reg_row = await regNums.getTown(towns); 


    let town = await pool.query("select * from cities");
    let town_rows = town.rows;
	

res.render('home', {town_rows, filterTowns, reg_row});

  }
  catch (err) {
    console.log("error" + "" + err)
    next(err)
  }

});

// Add Town


// app.post("/AddTown", async function (req, res) {
//   let towns = req.body.town;
//   let tag = req.body.tag;

//   let addTown = await regNums.addTown(town, tag);

//   console.log(towns, tag)

//   // keep towns on screen
//   let town = await pool.query("select * from cities");
//   let town_rows = town.rows;

//   let city = await pool.query("select reg_number, town_id from registration_numbers");
//   let cities = city.rows;

//   res.render("home", {town_rows})
// });


app.get("/reset", async function (req, res, next) {
  let reset = await regNums.reset();
  res.redirect("/");
})

app.listen(PORT, function () {
  console.log('App starting on port', PORT)
});