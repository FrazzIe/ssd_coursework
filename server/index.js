const express = require("express");

const app = express();

app.use(express.json());

module.exports = {
	path: "/api",
	handler: app
};