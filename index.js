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
    PORT = process.env.PORT || 3011;


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

app.get("/", async function (req, res) {
  res.render("home");
})



app.post("/registration", async function (req, res) {
  let RegNumber = req.body.regNum;
  console.log(RegNumber);
  res.render("home")

});

app.get("/reset", async function (req, res, next) {
  try { 
    await regNums.reset();
  }
  catch(err) {
    console.log(err)
  }
  finally {
    res.redirect("/");
  }
});
  

app.listen(PORT, function(){
  console.log('App starting on port', PORT)
})