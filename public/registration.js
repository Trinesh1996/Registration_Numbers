module.exports = function (pool) {	
	var reg_pre = ["All", "CA", "CY", "CL", "CJ"];

    async function addReg (reg) {

		reg = reg.replace(/(\w{2})/, '$1 ');
		
		reg = reg.toUpperCase();
		var regprefix = reg.substring(0, 2).trim();

    	if (reg == undefined || reg == "" || !reg_pre.includes(regprefix)) {
			return false;
		}
		let reg_number = await pool.query("SELECT * from registration_numbers where reg_number = $1", [reg]);	
		if (reg_number.rowCount === 0) {
			let city_id = await pool.query("select id from cities where regprefix = $1", [regprefix]);
			await pool.query("INSERT into registration_numbers (reg_number, town_id) values ($1, $2)", [reg, city_id.rows[0].id]);
			
			return true;
		}
	}

	async function addTown(town, regprefix) {

		if(town == undefined || town == "") {
			return false;
		}
		let towns = await pool.query("SELECT * from cities where regprefix = $1", [regprefix]);
		if (towns.rowCount === 0) {
			let city_id = await pool.query("select id from cities where regprefix = $1", [regprefix]);
			await pool.query("INSERT into cities (town, regprefix) values ($1, $2)", [town, regprefix]);
		}
		return true
	}

	async function checkRegistration(){
		let result = await pool.query("SELECT reg_number from registration_numbers");
		return result.rows;

	}



	async function filtering(tag) {
		let result = await pool.query(`SELECT registration_numbers.reg_number, registration_numbers.town_id, cities.regprefix, cities.town
										FROM registration_numbers
										INNER JOIN cities
										ON cities.id = registration_numbers.town_id where regprefix = $1`, [tag]);

		let all = result.rows;

		let regprefix = all.map(function(regpre) { 
			return regpre.town;
		})

		return regprefix
	}

	// async function exFilterTown(town) {

	// 	var current = []	

	// 	let reg_number = await pool.query("SELECT * from registration_numbers");
	// 	let reg_numbers = reg_number.rows;
		
	// 		let city_id = await pool.query("select id from cities where regprefix = $1", [town]);

	// 		for (var i = 0; i<reg_numbers.length; i++) {
	// 			if (reg_numbers[i].town_id == city_id.rows[0].id) {
	// 				current.push(reg_numbers[i])
	// 			}
	// 		}
	// 		return current;
	// 	}
		

	  
	async function checkReg(town) {
		let result = await pool.query(`SELECT registration_numbers.reg_number, registration_numbers.town_id, cities.regprefix, cities.town
										FROM registration_numbers
										INNER JOIN cities
										ON cities.id = registration_numbers.town_id where town = $1`, [town]);
		let all = result.rows;

		let reg_nums = all.map(function(reg) {
			return reg.reg_number;
		})

		return reg_nums;
	}

	async function checkTown() {
		let result = await pool.query("select * from cities");
		return result.rows;
	}

	async function getTown(town) {

		if(town != "All") {
			let result = await pool.query(`SELECT registration_numbers.reg_number, registration_numbers.town_id, cities.regprefix, cities.town
										FROM registration_numbers
										INNER JOIN cities
										ON cities.id = registration_numbers.town_id where town = $1`, [town]);

		return result.rows;
		}
	}

	async function getAllTowns(town) {
		let towns = await pool.query('select town, regprefix from cities');

		for (var i=0; i< towns.rowCount; i++) {
			let selectedTown = towns.rows[i];
			if (selectedTown.town === town) {
				selectedTown.selected = true
			}
		}
		return towns.rows
	}


	async function checkAllReg(){
		let reg = await pool.query('select * from registration_numbers');
		return reg.rows;
	}


	async function countReg(){
		let result = await pool.query("select * from registration_numbers");
		return result.rowCount;
	}
		
	async function reset() {
		let results = await pool.query("delete from registration_numbers;");
		let resetIDreg = await pool.query("ALTER SEQUENCE registration_numbers_id_seq RESTART 1;");
    	
        return {
    		result: results.rows,
			resetIDs: resetIDreg.rows,
    	}
	}

    return {
		addReg,
		addTown,
		reset,
		checkRegistration,
		countReg,
		getTown,
		checkReg,
		filtering,
		getAllTowns,
		checkAllReg,
		checkTown
		
	}
}
