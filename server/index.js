const config = require("./config");
const mysql = require("./models/mysql");
const express = require("express");
const passport = require("passport");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const auth = require("./models/auth")(config.jwt.secret, mysql, passport, argon2);
const permission = require("./models/permissions");
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
			return res.status(500).json({ error: err.message });

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

app.post("/tickets/new", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!permission.check(user.scope, "canCreateTicket"))
			return res.status(403).json({ error: "You do not have permission to create a ticket!" });

		if (!(req.body && req.body.data))
			return res.status(500).json({ error: "Invalid parameters" });

		if (!(!isNaN(req.body.data.phase) && req.body.data.title && req.body.data.description && !isNaN(req.body.data.priority)))
			return res.status(500).json({ error: "Invalid parameters" });

		if (req.body.data.title.length < 4 || req.body.data.title.length > 125)
			return res.status(200).json({ error: "The title must be between 4 and 125 characters long" });

		if (req.body.data.description.length < 50 || req.body.data.description.length > 2000)
			return res.status(200).json({ error: "The description must be between 50 and 2000 characters long" });
		
		if (req.body.data.priority < 0 || req.body.data.priority > 2)
			return res.status(200).json({ error: "The priority level was invalid" });

		if (req.body.data.phase < 0 || req.body.data.phase > 2)
			return res.status(200).json({ error: "The discovery phase was invalid" });

		if (!permission.check(user.scope, "useDevelopmentPhase") && req.body.data.phase == 0)
			return res.status(200).json({ error: "You don't have permission to use the development discovery phase" });

		if (!permission.check(user.scope, "useTestingPhase") && req.body.data.phase == 1)
			return res.status(200).json({ error: "You don't have permission to use the testing discovery phase" });

		mysql.query(mysql.queries.getTicketAssignee, [user.id]).then((result) => {
			if (typeof result[0] === "undefined")
				res.status(500).json({ error: "Unable to assign ticket to an active team member" });
			else
				mysql.query(mysql.queries.createTicket, [user.id, result[0].id, req.body.data.title, req.body.data.phase, req.body.data.priority]).then((ticket) => {
					mysql.query(mysql.queries.createComment, [ticket.insertId, user.id, req.body.data.description]).then((comment) => {
						res.status(200).json({ id: ticket.insertId });
					}).catch((error) => {
						res.status(500).json({ error: "Something went wrong" });
					});
				}).catch((error) => {
					res.status(500).json({ error: "Something went wrong" });
				});
		}).catch((error) => {
			res.status(500).json({ error: "Unable to assign ticket to an active team member" })
		});		
	})(req, res);
});

app.get("/tickets/view/:id", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!permission.check(user.scope, "canCreateTicket"))
			return res.status(403).json({ error: "You do not have permission to view a ticket!" });

		if (!req.params.id) { //check if param exists
			return res.status(404).json({ error: "Invalid ticket id" });
		} else if (isNaN(req.params.id)) { //check if param is not a number
			return res.status(404).json({ error: "Invalid ticket id" });
		}

		mysql.query(mysql.queries.getTicketById, [req.params.id]).then((ticket) => {
			if (typeof ticket[0] === "undefined")
				res.status(404).json({ error: "This ticket no longer exists" });
			else if (ticket[0].creator_id == user.id || ticket[0].assigned_id == user.id || permission.check(user.scope, "canViewTicket"))
				mysql.query(mysql.queries.getTicketComments, [req.params.id]).then((comments) => {
					ticket[0].comments = comments;
					res.status(200).json(ticket[0]);
				}).catch((error) => {
					res.status(500).json({ error: "Something went wrong" });
				});
			else
				res.status(403).json({ error: "You do not have permission to view this ticket!" });
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);
});

app.post("/tickets/comment/:id", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!permission.check(user.scope, "canCreateTicket"))
			return res.status(403).json({ error: "You do not have permission to create a comment!" });

		if (!(req.body && req.body.data && req.body.data.comment))
			return res.status(500).json({ error: "Invalid parameters" });

		if (req.body.data.comment.length < 20 || req.body.data.comment.length > 2000)
			return res.status(200).json({ error: "The comment must be between 20 and 2000 characters long" });

		if (!req.params.id) { //check if param exists
			return res.status(404).json({ error: "Invalid ticket id" });
		} else if (isNaN(req.params.id)) { //check if param is not a number
			return res.status(404).json({ error: "Invalid ticket id" });
		}

		mysql.query(mysql.queries.getTicketById, [req.params.id]).then((ticket) => {
			if (typeof ticket[0] === "undefined")
				res.status(404).json({ error: "This ticket no longer exists" });
			else if (ticket[0].status == 2)
				res.status(200).json({ error: "You cannot comment on a closed ticket" });
			else if (ticket[0].creator_id == user.id || ticket[0].assigned_id == user.id || permission.check(user.scope, "canViewTicket"))
				mysql.query(mysql.queries.createComment, [req.params.id, user.id, req.body.data.comment]).then((comment) => {
					res.status(200).json({ id: req.params.id });
				}).catch((error) => {
					res.status(500).json({ error: "Something went wrong" });
				});
			else
				res.status(403).json({ error: "You do not have permission to comment on this ticket!" });
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);	
});

app.post("/tickets/close/:id", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!req.params.id) { //check if param exists
			return res.status(404).json({ error: "Invalid ticket id" });
		} else if (isNaN(req.params.id)) { //check if param is not a number
			return res.status(404).json({ error: "Invalid ticket id" });
		}

		mysql.query(mysql.queries.getTicketById, [req.params.id]).then((ticket) => {
			if (typeof ticket[0] === "undefined")
				res.status(404).json({ error: "This ticket no longer exists" });
			else if (ticket[0].status == 2)
				res.status(200).json({ error: "This ticket is already closed" });
			else if (ticket[0].assigned_id == user.id || permission.check(user.scope, "canCloseTicket"))
				mysql.query(mysql.queries.closeTicket, [req.params.id]).then((ticket) => {
					mysql.query(mysql.queries.createComment, [req.params.id, user.id, config.ticketActions.messages.close]).then((comment) => {
						res.status(200).json({ id: req.params.id });
					}).catch((error) => {
						res.status(500).json({ error: "Something went wrong" });
					});
				}).catch((error) => {
					res.status(500).json({ error: "Something went wrong" });
				});			
			else
				return res.status(403).json({ error: "You do not have permission to close a ticket!" });
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);	
});

app.post("/tickets/solve/:id", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!req.params.id) { //check if param exists
			return res.status(404).json({ error: "Invalid ticket id" });
		} else if (isNaN(req.params.id)) { //check if param is not a number
			return res.status(404).json({ error: "Invalid ticket id" });
		}

		mysql.query(mysql.queries.getTicketById, [req.params.id]).then((ticket) => {
			if (typeof ticket[0] === "undefined")
				res.status(404).json({ error: "This ticket no longer exists" });
			else if (ticket[0].status == 2)
				res.status(200).json({ error: "This ticket cannot be solved as its closed" });
			else if (ticket[0].status == 1)
				res.status(200).json({ error: "This ticket is already solved" });
			else if (ticket[0].assigned_id == user.id || permission.check(user.scope, "canCloseTicket"))
				mysql.query(mysql.queries.solveTicket, [req.params.id]).then((ticket) => {
					mysql.query(mysql.queries.createComment, [req.params.id, user.id, config.ticketActions.messages.solve]).then((comment) => {
						res.status(200).json({ id: req.params.id });
					}).catch((error) => {
						res.status(500).json({ error: "Something went wrong" });
					});
				}).catch((error) => {
					res.status(500).json({ error: "Something went wrong" });
				});			
			else
				return res.status(403).json({ error: "You do not have permission to close a ticket!" });
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);	
});

app.get("/tickets/view", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err.message });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!permission.check(user.scope, "canViewTicket"))
			return res.status(403).json({ error: "You do not have permission to view tickets!" });

		mysql.query(mysql.queries.getTickets, []).then((tickets) => {
			res.status(200).json(tickets);
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);
});

app.get("/tickets/me", function(req, res) {
	passport.authenticate("jwt", { session: false }, (err, user, info) => {
		if (err) //if there is an error then
			return res.status(500).json({ error: err });

		if (!user)
			return res.status(403).json({ error: info.message });

		if (!permission.check(user.scope, "canCreateTicket"))
			return res.status(403).json({ error: "You do not have permission to view tickets!" });

		mysql.query(mysql.queries.getUserTickets, [user.id]).then((tickets) => {
			res.status(200).json(tickets);
		}).catch((error) => {
			res.status(500).json({ error: "Something went wrong" });
		});
	})(req, res);
});
module.exports = {
	path: "/api",
	handler: app
};