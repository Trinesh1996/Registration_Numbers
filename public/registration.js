module.exports = function (pool) {
    async function addReg (reg) {
		reg = reg.toUpperCase();

    	if (reg === undefined || reg === "") {
    		let reg_number = await pool.query("SELECT * from registration_numbers where reg_number = $1", [reg]);
		}
		if (reg_number.rowsCount === 0) {
			let CitiesID = await pool.query("select from cities where id = $1", [reg])
			
			await pool.query("INSERT into registration_numbers(reg_number) values ($1)", [reg]);
		}
		else {

		}
		
			if (reg.startsWith("CY") || reg.startsWith("CA") || reg.startsWith("CJ") || reg.startsWith("CL")) {
				
    		}
		}
	async function reset() {
    	let results = await pool.query("delete from cities;");
    	let resetID = await pool.query("ALTER SEQUENCE registration_id_seq RESTART 1;");
    	
        return {
    		result: results.rows,
    		resetIDs: resetID.rows
    	}
	}

    return {
        addReg,reset
    }
}
	



