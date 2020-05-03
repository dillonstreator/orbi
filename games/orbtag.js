// calculate game state for a game tick
const { math, rand, CONSTANTS: sharedConstants } = require("./shared");
const moment = require("moment");
const _ = require("lodash");
const logger = require("../utils/logger");

const constants = {
	...sharedConstants,
};

const addAttributesTo = (player) => {
	player.x = rand.int(
		constants.NEGATIVE_X_THRESHOLD,
		constants.POSITIVE_X_THRESHOLD
	);
	player.y = rand.int(
		constants.NEGATIVE_Y_THRESHOLD,
		constants.POSITIVE_Y_THRESHOLD
	);
	player.frozen = false;
	player.it = false;
	player.boosting = false;
	player.boost = constants.BOOST_CAP;
	player.direction =
		constants.DIRECTIONS[rand.int(0, constants.DIRECTIONS.length - 1)];
};

module.exports = (game) => {
	// CHECK FOR EARLY RETURN POTENTIAL
	const enoughPlayers =
		game.players.playing.length + game.players.waiting.length >=
		constants.MIN_PLAYERS;
	if (
		!enoughPlayers &&
		game.state === constants.GAME_STATES.WAITING_FOR_PLAYERS
	)
		return;
	else if (!enoughPlayers) {
		game.state = constants.GAME_STATES.WAITING_FOR_PLAYERS;
		game.stateStartedAt = null;
		game.players.playing.forEach((player) => {
			player.socket.emit("game_update_state", game.state);
			player.socket.emit("game_update_players", []);
		});
		return;
	}

	// UPDATE THE NEW GAME STATE
	const timeInState = moment().diff(game.stateStartedAt);
	const finishedWithState =
		!game.stateStartedAt || timeInState >= game.state.DURATION_IN_MS;
	if (finishedWithState) {
		game.stateStartedAt = moment();
		const newState =
			game.state !== constants.GAME_STATES.COOLDOWN
				? constants.GAME_STATES.COOLDOWN
				: constants.GAME_STATES.PLAYING;
		game.state = newState;
		if (newState === constants.GAME_STATES.COOLDOWN) {
			// JUST ENTERED COOLDOWN PHASE..

			// ADD PLAYERS FROM WAITING QUEUE
			if (
				game.players.waiting.length &&
				game.state === constants.GAME_STATES.COOLDOWN
			) {
				// move the waiting players into the game and give them the necessary attributes
				// TODO: check for game mode max players to see if we can add all of the queued players
				game.players.waiting.forEach((player) => {
					addAttributesTo(player);
					game.players.playing.push(player);
				});
				game.players.waiting = [];
			}

			// SELECT NEW PLAYER TO BE "IT"
			try {
				game.players.itPlayer.it = false;
			} catch (e) {}
			game.players.itPlayer =
				game.players.playing[rand.int(0, game.players.playing.length - 1)];
			game.players.itPlayer.it = true;

			// UNFREEZE ANYONE THAT'S FROZEN
			game.players.playing.forEach((player) => (player.frozen = false));
		}
		game.players.playing.forEach((player) =>
			player.socket.emit("game_update_state", newState)
		);
	}

	const freezable = game.state === constants.GAME_STATES.PLAYING;

	// UPDATE PLAYER POSITIONING IF NOT FROZEN
	game.players.playing.forEach((player) => {
		const newBoost = player.boost + constants.BOOST_REGEN;
		player.boost =
			newBoost > constants.BOOST_CAP ? constants.BOOST_CAP : newBoost;
		if (player.frozen) return;

		if (
			freezable &&
			player.sessionId !== game.players.itPlayer.sessionId &&
			math.collision({
				p1: player,
				p2: game.players.itPlayer,
				playerHeight: constants.PLAYER_SIZE,
				playerWidth: constants.PLAYER_SIZE,
			})
		) {
			logger.info(`${game.players.itPlayer.name} froze ${player.name}`);
			player.frozen = true;
			return; // exit as we will not be updating this players position
		}

		const canBoost = player.boost >= constants.BOOST_DRAIN;
		const applyBoost = canBoost && player.boosting;
		if (applyBoost) player.boost -= constants.BOOST_DRAIN;
		const speed = applyBoost
			? constants.PLAYER_SPEED_BOOSTED
			: constants.PLAYER_SPEED;
		switch (player.direction) {
			case "x+":
				player.x += speed;
				if (player.x > constants.POSITIVE_X_THRESHOLD) {
					player.x = constants.POSITIVE_X_THRESHOLD;
				}
				break;
			case "x-":
				player.x -= speed;
				if (player.x < constants.NEGATIVE_X_THRESHOLD) {
					player.x = constants.NEGATIVE_X_THRESHOLD;
				}
				break;
			case "y+":
				player.y += speed;
				if (player.y > constants.POSITIVE_Y_THRESHOLD) {
					player.y = constants.POSITIVE_Y_THRESHOLD;
				}
				break;
			case "y-":
				player.y -= speed;
				if (player.y < constants.NEGATIVE_Y_THRESHOLD) {
					player.y = constants.NEGATIVE_Y_THRESHOLD;
				}
				break;
		}
	});

	// SEND UPDATED POSITION INFORMATION TO PLAYING SOCKETS
	const updatedPlayers = game.players.playing.map(
		({ frozen, it, x, y, name, color, boosting, boost, direction }) => ({
			frozen,
			it,
			x,
			y,
			name,
			color,
			boosting,
			boost,
			direction,
		})
	);
	game.players.playing.forEach((player) =>
		player.socket.emit("game_update_players", updatedPlayers)
	);
};
