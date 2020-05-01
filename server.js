const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const rTracer = require("cls-rtracer");
const helmet = require("helmet");
const requestTimer = require("./middlewares/request-timer");
const pathLogger = require("./middlewares/path-logger");

const app = express();

app.use(rTracer.expressMiddleware());
app.use(requestTimer);
app.use(pathLogger);
app.use(helmet());

app.get("/health", (_, res) => res.status(200).send("Healthy"));

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "client", "build")));

	app.get("*", (_, res) => {
		res.sendFile(path.join(__dirname, "client", "build", "index.html"));
	});
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
