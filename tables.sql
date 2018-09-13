create table registration_numbers(
	id serial not null primary key,
    registrationNumber text not null,	
	town_id int,
);