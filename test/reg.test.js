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
    beforeEach(async function(){
		await pool.query("DELETE FROM registration_numbers;");
		await pool.query("ALTER SEQUENCE registration_numbers_id_seq RESTART 1;");
    });

    it("should reset", async function() {
        var reg = registration(pool);

        await reg.addReg("CY 1324");
        assert.deepEqual(await reg.reset(), {result: [], resetIDs: []});
    });


    it("should count how many reg-nums are in register", async function(){
        var reg = registration(pool);
        await reg.addReg('CA 123');
        await reg.addReg('CA 12');

        assert.equal(await reg.countReg(), 2);   
    });
    it("should return an object literal for the corresponding town", async function(){
        var reg = registration(pool);

        await reg.addReg('CA 123');
        await reg.addReg('CA 12');
        await reg.addReg('CY 123');

        assert.deepEqual(await reg.getTown("Bellville"), [{reg_number: 'CY 123', town_id: 2, regprefix: 'CY', town: 'Bellville'}]);
     
        
    });

    it("should return the registration number for the respective town", async function() {
        var reg = registration(pool);

        await reg.addReg("CY 123");
        await reg.addReg("CY 213");

        assert.deepEqual(await reg.checkReg("Bellville"), ["CY 123", "CY 213"])
    })


    it('should filter towns based on its prefix', async function() {
        var reg = registration(pool);

        await reg.addReg("CJ 1234");
        await reg.addReg("CJ 123");
        await reg.addReg("CL 1234");
        await reg.addReg("CY 1234");
        await reg.addReg("CA 1234");

        assert.deepEqual(await reg.filtering("CA"), ["CapeTown"])
    });

    it("should add towns", async function() {
        var reg = registration(pool);

        await reg.addTown("Cravenby", "CAW");

        assert.deepEqual(await reg.checkTown(), [])
    })

    after(function () {
        pool.end();
    })    
})



        
