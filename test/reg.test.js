'use strict'
let assert = require("assert");
let registration = require("../public/registration");
let pg = require("pg");
let Pool = pg.Pool;




const connectionString = process.env.DATABASE_URL || 'postgresql://trinesh:Trinesh1997@@localhost:5432/Registration';

const pool = new Pool({
    connectionString
});

describe("Registration Tests", async function() {
    it("should return the registration number", async function(){
        var reg = registration(pool);
        // await reg.addReg("CY 123");
        assert.equal(await reg.addReg("CY 123"), "CY 123");
   
    });
})
        
