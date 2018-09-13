'use strict'
let assert = require("assert");
let registration = require("../public/registration");
let pg = require("pg");
let Pool = pg.Pool;

let reg = registration();



const connectionString = process.env.DATABASE_URL || 'postgresql://trinesh:Trinesh1997@@localhost:5432/Registration';

const pool = new Pool({
    connectionString
});

describe("Registration Tests", function(){
    it("should return the registration number and corresponding prefix", function(){
    	let reg = registration();

    })

})