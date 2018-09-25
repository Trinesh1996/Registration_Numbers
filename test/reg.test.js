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
		await pool.query("DELETE FROM registration_numbers");
		await pool.query("ALTER SEQUENCE registration_numbers_id_seq RESTART 1");
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

        await pool.query("DELETE FROM registration_numbers");
        await pool.query("ALTER SEQUENCE registration_numbers_id_seq RESTART 1");

        assert.equal(await reg.countReg(), 0);          

    });
    it("should return an object literal for the corresponding town", async function(){
        var reg = registration(pool);

        await reg.addReg('CA 123');
        await reg.addReg('CJ 12');
        await reg.addReg('CY 123');
        await reg.addReg('CL 123');

        assert.deepEqual(await reg.getTown("Bellville"), [{reg_number: 'CY 123', town_id: 2, regprefix: 'CY', town: 'Bellville'}]);
        
        assert.deepEqual(await reg.getTown("CapeTown"), [{reg_number: 'CA 123', town_id: 1, regprefix: 'CA', town: 'CapeTown'}]);
        assert.deepEqual(await reg.getTown("Paarl"), [{reg_number: 'CJ 12', town_id: 3, regprefix: 'CJ', town: 'Paarl'}]);
        assert.deepEqual(await reg.getTown("Stellenbosch"), [{reg_number: 'CL 123', town_id: 4, regprefix: 'CL', town: 'Stellenbosch'}]);
        
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
        assert.deepEqual(await reg.filtering("CJ"), ["Paarl", "Paarl"])
        assert.deepEqual(await reg.filtering("CY"), ["Bellville"])
        assert.deepEqual(await reg.filtering("CL"), ["Stellenbosch"])
    });

    it('Should return the selected town', async function(){
        var reg = registration(pool);

        await reg.addReg("CJ 1234");
       
        await reg.addReg("CL 1234");

        assert.deepEqual(await reg.getAllTowns("Paarl"),  [{ town: 'CapeTown', regprefix: 'CA' },
                                                            { town: 'Bellville', regprefix: 'CY' },
                                                            { town: 'Paarl', regprefix: 'CJ', selected: true},
                                                            {town: "Stellenbosh", regprefix: "CL"}
                                                            ]);

        

    })
    after(function () {
        pool.end();
    })    
})



        
