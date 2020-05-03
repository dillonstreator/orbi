const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const rTracer = require("cls-rtracer");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const requestTimer = require("./middlewares/request-timer");
const pathLogger = require("./middlewares/path-logger");
const uuid = require("uuid");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const moment = require("moment");
const { cleanUserBy } = require("./utils/user-cleaner");

const app = express();

app.use(rTracer.expressMiddleware());
app.use(requestTimer);
app.use(pathLogger);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(helmet());

app.get("/health", (_, res) => res.status(200).send("Healthy"));

app.get("/api/me", (req, res) => {
	const { sessionId } = req.cookies;
	return res.json({ sessionId });
});

app.post("/api/users", (req, res) => {
	const { name, color } = req.body;
	if (!name) return res.status(400).json({ error: "name is required" });
	if (!validator.isAlphanumeric(name))
		return res.status(400).json({ error: "name must be alphanumeric" });
	if (Object.values(global.users).some(({ name: n }) => n === name))
		return res.status(400).json({ error: "That name is already in use" });

	const sessionId = uuid.v4();
	global.users[sessionId] = {
		sessionId,
		name,
		color,
		lastActive: moment(),
	};

	res.cookie("sessionId", sessionId);
	return res.json({ message: "Successfully registered" });
});

app.delete("/api/users", (req, res) => {
	const { sessionId } = req.cookies;
	if (!sessionId) return res.json({ message: "You do not have a session to log out of" });

	res.clearCookie("sessionId");
	const cleaned = cleanUserBy({ sessionId });
	if (!cleaned) return res.json({ message: "Successfully logged out" });

	return res.json({ message: "successfully logged out" });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "client", "build")));

	app.get("*", (_, res) => {
		res.sendFile(path.join(__dirname, "client", "build", "index.html"));
	});
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`listening on port ${PORT}`));
require("./socketio")(server);
