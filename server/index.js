const config = require("./config");
const mysql = require("./models/mysql");
const express = require("express");
const passport = require("passport");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const auth = require("./models/auth")(config.jwt.secret, mysql, passport, argon2);

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.post("/auth/login", (req, res) => { //When /login is requested by a user
	passport.authenticate("local", { session: false }, (err, user, info) => { // models/auth.js -> use strategy to validate user login credentials
		if (err) //if there is an error then
			return res.status(500).json({ error: err });

		if (!user) //if the profile does not exist then
			return res.status(403).json({ error: info.message }); //refuse login

		const token = jwt.sign(user.id, config.jwt.secret);
		return res.status(200).json({ token: token });
	})(req, res);
});

app.get("/auth/user", (req, res) => {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
		return res.status(500).json({ error: err });

		if (!user)
			return res.status(403).json({ error: info.message });

		res.status(200).json({ user: user });
	})(req, res);
});

app.post("/auth/register", function(req, res) {
	if (req.body && req.body.data && req.body.data.username && req.body.data.password && req.body.data.username != "" && req.body.data.password != "") {
		mysql.query(mysql.queries.getUser, [req.body.data.username]).then((result) => { //finds any rows with the username
			if (typeof result[0] === "undefined") { //checks if a user does not exist
				argon2.hash(req.body.data.password).then((hashedPassword) => { //scrambles the password using argon2
					mysql.query(mysql.queries.createUser, [req.body.data.username, hashedPassword]).then((result) => { //creates user account in database
						res.status(200).json({});
					}).catch((error) => {
						res.status(500).json({ error: error.message });
						console.log(error.message);
					});
				}).catch((error) => {
					res.status(500).json({ error: error.message });
				});
			} else { //prevents registration as user already exists
				res.status(403).json({ error: "A user already exists with this username" });
			}
		}).catch((error) => {
			console.log(error.message);
			res.status(500).json({ error: error.message });
		});
	} else {
		res.status(200).json({ error: "You must include a username and a password" });
	}
});

app.post("/auth/logout", function(req, res) {
	req.logout();
	res.status(200).json({});
});

module.exports = {
	path: "/api",
	handler: app
};