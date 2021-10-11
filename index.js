const express = require("express");
const mysql = require("mysql");
var cors = require("cors");

const dbConfig = {
	host: "localhost",
	user: "root",
	password: "mysql",
	database: "cow_farm",
};

const connection = mysql.createConnection({
	host: dbConfig.host,
	user: dbConfig.user,
	password: dbConfig.password,
	database: dbConfig.database,
});

connection.connect((error) => {
	if (error) throw error;
	console.log("Successfully connected to the database.");
});

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

var corsOptions = {
	origin: "http://localhost:4200",
};

app.get("/test-conn", cors(corsOptions), (req, res) => {
	connection.query("SELECT 1 + 1 AS solution", (err, rows, fields) => {
		if (err) throw err;
		console.log("The solution is: ", rows[0].solution);
		res.status(200).send({ solution: rows[0].solution });
	});
});

app.get("/cows", cors(corsOptions), (req, res) => {
	connection.query("SELECT * FROM Cows", (err, rows, fields) => {
		if (err) throw err;
		res.status(200).send(rows);
	});
});

app.get("/cows/:id", cors(corsOptions), (req, res) => {
	connection.query(
		"SELECT * FROM Cows WHERE id = ?",
		req.params.id,
		(err, rows, fields) => {
			if (err) throw err;
			res.status(200).send(rows);
		}
	);
});

app.post("/cows", cors(corsOptions), (req, res) => {
	connection.query(
		"INSERT INTO Cows (`name`, `weight`, `total_milk`, `last_milking_time`) VALUES (?, ?, ?, ?)",
		[
			req.body.name,
			req.body.weight,
			req.body.total_milk,
			req.body.last_milking_time,
		],
		// TODO :: check if this can be simplified
		// "INSERT INTO Cows VALUES (?)",
		// req.body,
		(err, rows, field) => {
			if (err) throw err;
			console.log("created: ", { id: rows.insertId, ...req.body });
			res.status(201).send({ id: rows.insertId, ...req.body });
		}
	);
});

app.put("/cows/:id", cors(corsOptions), (req, res) => {
	connection.query(
		"UPDATE cows SET name = ?, weight = ?, total_milk = ?, last_milking_time = ? WHERE id = ?",
		[
			req.body.name,
			req.body.weight,
			req.body.total_milk,
			req.body.last_milking_time,
			req.params.id,
		],
		(err, rows, field) => {
			if (err) throw err;
			console.log("updated: ", { rows });
			res.status(204).send();
		}
	);
});

app.delete("/cows/:id", cors(corsOptions), (req, res) => {
	console.log(req.params.id);
	connection.query(
		"DELETE FROM Cows WHERE id=?",
		req.params.id,
		(err, rows, field) => {
			if (err) throw err;
			console.log("deleted: ", rows);
			// TODO :: should we return 204 when there affectedRows:0
			res.status(204).send();
		}
	);
});

app.listen(port, () =>
	console.log(`Hello world app listening on port ${port}!`)
);
