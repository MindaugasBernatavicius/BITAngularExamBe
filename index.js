const express = require("express");
const mysql = require("mysql");
var cors = require("cors");
const { check, validationResult } = require("express-validator");

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

app.post(
	"/cows",
	check("last_milking_time").isISO8601().toDate().withMessage({
		message: "Not an valid date",
		errorCode: 1,
	}),
	cors(corsOptions),
	(req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.json(errors);
		if (req.body.name === "xxx")
			return res.status(500).json({
				error_code: "XXX_NOT_ALLOWED",
				error_msg: "Please do not use XXX!",
			});
		connection.query(
			"INSERT INTO Cowss (`name`, `weight`, `total_milk`, `last_milking_time`) VALUES (?, ?, ?, ?)",
			[
				req.body.name,
				req.body.weight,
				req.body.total_milk,
				req.body.last_milking_time.slice(0, 19).replace("T", " "), // TODO :: sometimes this fails
			],

			// TODO :: check if this can be simplified
			// "INSERT INTO Cows VALUES (?)",
			// req.body,
			(err, rows, field) => {
				if (err) {
					return res.status(500).send({
						error_code: err.code,
						error_msg: err.sqlMessage,
					});
				}
				console.log("created: ", { id: rows.insertId, ...req.body });
				res.status(201).send({ id: rows.insertId, ...req.body });
			}
		);
	}
);

app.put("/cows/:id", cors(corsOptions), (req, res) => {
	console.log(req.body.last_milking_time.slice(0, 19).replace("T", " "));
	// input data validation

	connection.query(
		"UPDATE cows SET name = ?, weight = ?, total_milk = ?, last_milking_time = ? WHERE id = ?",
		[
			req.body.name,
			req.body.weight,
			req.body.total_milk,
			req.body.last_milking_time.slice(0, 19).replace("T", " "), // sanitization
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
