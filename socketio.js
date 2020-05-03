const socketio = require("socket.io");
const validator = require("validator");
const cookie = require("cookie");
const logger = require("./utils/logger");
const { cleanUserBy } = require("./utils/user-cleaner");
const { CONSTANTS } = require("./games/shared");
// const orball = require("./games/orball");
const orbtag = require("./games/orbtag");
// const ORBALL = {
// 	name: "Orball",
// 	runner: orball,
// };
const ORBTAG = {
	name: "Orbtag",
	runner: orbtag,
};
global.users = {};
global.games = [
	{
		...ORBTAG,
		state: CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS,
		stateStartedAt: null,
		players: {
			playing: [],
			waiting: [],
			itPlayer: null,
		},
		initializationConstants: {
			...CONSTANTS,
		},
	},
	// {
	// 	...ORBALL,
	//     state: CONSTANTS.GAME_STATES.WAITING_FOR_PLAYERS,
	//     stateStartedAt: null,
	//     players: {
	//         playing: [],
	//         waiting: [],
	//     }
	// },
];

module.exports = (app) => {
	const io = socketio(app);

	io.on("connection", (socket) => {
		logger.info("connection in progress");
		const { sessionId } = cookie.parse(socket.handshake.headers.cookie);
		if (!sessionId) {
			socket.disconnect();
			return;
		}

		const user = global.users[sessionId];
		if (!user) {
			socket.disconnect();
			return;
		}

		user.attributes = {};
		user.socket = socket;
		user.gameIdx = null;

		socket.on("game_join", ({ gameId }) => {
			if (user.gameIdx !== null) {
				socket.emit("errors", {
					title: "Join Game Error",
					errors: [
						"You are already in a game. Please leave before you join another game.",
					],
				});
				return;
			}

			const game = global.games[gameId];
			if (!game) {
				socket.emit("errors", {
					title: "Join Game Error",
					errors: ["There was an issue joining that game."],
				});
				return;
			}
			user.gameIdx = gameId;
			game.players.waiting.push(user);
			socket.emit("game_join_success", {
				constants: game.initializationConstants,
				state: game.state,
				stateStartedAt: game.stateStartedAt,
			});
		});
		socket.on("user_update_direction", (dir) => {
			if (!CONSTANTS.DIRECTIONS_MAP[dir]) {
				logger.info("invalid direction:", dir);
				return;
			}
			user.direction = dir;
		});
		socket.on("user_update_boosting", (isBoosting) => {
			user.boosting = isBoosting;
		});

		socket.on("game_leave", () => {
			cleanUserBy({ sessionId });
		});
		socket.on("disconnect", () => {
			logger.info(`disconnect from ${user.name}`);
			cleanUserBy({ sessionId });
		});
	});

	// MAIN GAME LOOP
	setInterval(() => {
		global.games.forEach((game) => {
			game.runner(game);
		});
	}, CONSTANTS.FRAME_RATE_IN_MS);
};
