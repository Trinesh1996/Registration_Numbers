module.exports = function (pool) {
	
	var TAGS_USED = ["all", "CA", "CY", "CL", "CJ"];


    async function addReg (reg) {
		reg = reg.toUpperCase();
		var regprefix = reg.substring(0, 2).trim();

    	if (reg == undefined || reg == "" || !TAGS_USED.includes(regprefix)) {
			return false;
		}

		let reg_number = await pool.query("SELECT * from registration_numbers where reg_number = $1", [reg]);	
		if (reg_number.rowCount === 0) {
			let city_id = await pool.query("select id from cities where regprefix = $1", [regprefix]);
			await pool.query("INSERT into registration_numbers (reg_number, town_id) values ($1, $2)", [reg, city_id.rows[0].id]);
			
			return true;
		}
	}

	async function checkReg(){
		let result = await pool.query("SELECT reg_number from registration_numbers");
		return result.rows;
	}
	// error validate foreign key constraint

	async function filterReg(town) {

		if (!TAGS_USED.includes(town)) {
			return false;
		};

		let town = await pool.query("select town from cities where town = $1", [town]);
	}		



	async function reset() {
    	let results = await pool.query("delete from registration_numbers;");
		let resetIDreg = await pool.query("ALTER SEQUENCE registration_id_seq RESTART 1;");
    	
        return {
    		result: results.rows,
			resetIDs: resetIDreg.rows,
    	}
	}


    return {
        addReg,reset,checkReg, filterReg
    }
}
