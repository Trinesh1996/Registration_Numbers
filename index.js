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



    if(reg_plate) {
      req.flash('msg', 'added registration number succesfully')
    }
    else {
      req.flash('msg', 'Please enter a registration number that is available')
    }

    res.render('home', {reg_rows, filterTowns})
  }

  catch (err) {
    console.log("error" + "" + err)
    next(err)
  }
});


    // var regprefix = RegNumber.substring(0, 2).trim();
    // var TAGS_USED = ['All', 'CA', 'CJ', 'CY', 'CL'];

 


    // let reg_numbers = await pool.query("SELECT * from registration_numbers");
    // let reg_rows = reg_numbers.rows;

    // select towns
    // let town = await pool.query("select * from cities");
    // let town_rows = town.rows;


    // errro messages
    // if (RegNumber == undefined || !TAGS_USED.includes(regprefix)) {
    //   req.flash("error", "Please enter a valid registration number");
    // }

 



// app.post('/selectTown', async function (req, res, next) {
//   try {
//     let towns = req.body.display_town;

//     let reg_number = await regNums.selectTown(towns);


//    
//     console.log(reg_number);

   

//     let town = await pool.query("select * from cities");
//     let town_rows = town.rows;
    

//     res.render('home', { town_rows, popReg});
//   }
//   catch (err) {
//     console.log("error" + "" + err)
//     next(err)
//   }
// });



app.get('/filter/:town', async function (req ,res, next) {
  try {
    let towns =  req.params.town;
    
    var filterTowns = await regNums.getAllTowns(towns); 
    // var reg_rows = await regNums.filterTown(towns) 


    let town = await pool.query("select * from cities");
    let town_rows = town.rows;  

    let reg_number = await pool.query("SELECT * from registration_numbers");
    let reg_numbers = reg_number.rows;

    console.log(reg_numbers)  

    let city_id = await pool.query("select id from cities where regprefix = 'CA'");


    let current = [];

    for (var i = 0; i<reg_numbers.length; i++) {
      if (reg_numbers[i].town_id == city_id.rows[0].id) {
        current.push(reg_numbers[i])
      }
    }
console.log(current);	

res.render('home', {town_rows, filterTowns});

  }
  catch (err) {
    console.log("error" + "" + err)
    next(err)
  }

});

app.post("/AddTown", async function (req, res) {
  let towns = req.body.town;

  let tag = req.body.tag;
  console.log(towns, tag)

  // keep towns on screen
  let town = await pool.query("select * from cities");
  let town_rows = town.rows;

  let city = await pool.query("select reg_number, town_id from registration_numbers");
  let cities = city.rows;

  res.render("home", {town_rows})
});


app.get("/reset", async function (req, res, next) {
  let reset = await regNums.reset();
  res.redirect("/");
})

app.listen(PORT, function () {
  console.log('App starting on port', PORT)
});