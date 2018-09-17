create table registration_numbers(
	id serial not null primary key,
	reg_number text not null,
	town_id int,
	FOREIGN key(town_id) REFERENCES cities(id)
);

create table cities(
	id serial not null primary key,
	town text not null,
	regprefix text not null
);


insert into cities(id,town,regprefix) values (1,'Cape Town','CA');
insert into cities(id,town,regprefix) values (2,'Bellville','CY');
insert into cities(id,town,regprefix) values (3,'Paarl','CJ');
insert into cities(id,town,regprefix) values (4,'Stellenbosch','CL');