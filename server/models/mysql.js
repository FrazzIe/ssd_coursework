const mysql = require("mysql");
const config = require("../config"); //import dependencies

var pool = mysql.createPool(config.mysql); //create connection pool
var queries = { //list of mysql queries
	getUser: "SELECT users.id, users.username, users.password, users.group FROM users WHERE users.username = ?",
	getUserById: "SELECT users.id, users.username, users.group FROM users WHERE users.id = ?",
	getTicketAssignee: "SELECT users.id FROM users WHERE users.group = 'developer' AND users.id != ? ORDER BY RAND() LIMIT 1",
	getTicketById: "SELECT tickets.id, tickets.creator_id, tickets.assigned_id, UNIX_TIMESTAMP(tickets.created_at) AS 'created_at', tickets.title, tickets.status, tickets.discover_phase, tickets.priority, creator.username AS 'creator', assignee.username AS 'assignee' FROM tickets JOIN users creator ON (tickets.creator_id = creator.id) JOIN users assignee ON (tickets.assigned_id = assignee.id) WHERE tickets.id = ?",
	getTicketComments: "SELECT ticket_comments.id, UNIX_TIMESTAMP(ticket_comments.created_at) AS 'created_at', ticket_comments.comment, users.username, users.group FROM ticket_comments JOIN users ON (ticket_comments.creator_id = users.id) WHERE ticket_comments.ticket_id = ? ORDER BY ticket_comments.id",
	createUser: "INSERT INTO users (`username`, `password`) VALUES (?, ?)",
	createTicket: "INSERT INTO tickets (`creator_id`, `assigned_id`, `title`, `discover_phase`, `priority`) VALUES (?, ?, ?, ?, ?)",
	createComment: "INSERT INTO ticket_comments (`ticket_id`, `creator_id`, `comment`) VALUES (?, ?, ?)",
	closeTicket: "UPDATE tickets SET tickets.status = 2 WHERE tickets.id = ?",
	solveTicket: "UPDATE tickets SET tickets.status = 1 WHERE tickets.id = ?",
}

function execute(sql, params) { //asynchronous sql execute function
	return new Promise((resolve, reject) => { //create a new promise
		pool.query(sql, params, (error, result, fields) => { //query the server
		 if (error) reject(error); //if error then display error
			resolve(result); //return result
		});
	});
};

execute("SELECT VERSION()", {}).then((result) => { //Check if connection was successful
	console.log("Database: connection established!");
}).catch((error) => {
	console.log("Database: " + error.message);
});

module.exports = {
	queries: queries,
	query: execute
};