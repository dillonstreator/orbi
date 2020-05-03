const PLAYER_SIZE = 25; // size in pixels
const SPEED_FACTOR = .3;
const SPEED_BOOST_FACTOR = 2;
const PLAYER_SPEED = PLAYER_SIZE * SPEED_FACTOR; // movement speed in pixels per frame
const PLAYER_SPEED_BOOSTED = PLAYER_SPEED * SPEED_BOOST_FACTOR; // pixels per frame while boosting
const BOOST_CAP = 100;
const BOOST_DRAIN = 5;
const BOOST_REGEN = 2.5;
const MAP_HEIGHT = 500;
const MAP_WIDTH = 500;
const POSITIVE_X_THRESHOLD = MAP_WIDTH - PLAYER_SIZE;
const NEGATIVE_X_THRESHOLD = 0;
const POSITIVE_Y_THRESHOLD = MAP_HEIGHT - PLAYER_SIZE;
const NEGATIVE_Y_THRESHOLD = 0;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const FRAME_RATE_IN_MS = 50;
const DIRECTIONS = ['x+','x-','y+','y-'];
const DIRECTIONS_MAP = DIRECTIONS.reduce((acc,dir) => ({ ...acc, [dir]: true }), {});

module.exports = {
	CONSTANTS: {
		PLAYER_SIZE,
		PLAYER_SPEED,
		PLAYER_SPEED_BOOSTED,
		BOOST_CAP,
		BOOST_DRAIN,
		BOOST_REGEN,
		MAP_HEIGHT,
		MAP_WIDTH,
		MIN_PLAYERS,
		MAX_PLAYERS,
		FRAME_RATE_IN_MS,
		POSITIVE_X_THRESHOLD,
		NEGATIVE_X_THRESHOLD,
		POSITIVE_Y_THRESHOLD,
		NEGATIVE_Y_THRESHOLD,
		DIRECTIONS,
		DIRECTIONS_MAP,
		GAME_STATES: {
			PLAYING: {
				NAME: "Playing",
				DURATION_IN_MS: 20 * 1000,
			},
			COOLDOWN: {
				NAME: "Cooldown",
				DURATION_IN_MS: 5 * 1000,
			},
			WAITING_FOR_PLAYERS: {
				NAME: "Waiting for players",
			},
		},
	},
	math: {
		collision: ({p1, p2, playerHeight, playerWidth}) => {
			const x1 = p1.x;
			const y1 = p1.y;
			const h1 = playerHeight;
			const w1 = playerWidth;
			const b1 = y1 + h1;
			const r1 = x1 + w1;
			const x2 = p2.x;
			const y2 = p2.y;
			const h2 = playerHeight;
			const w2 = playerWidth;
			const b2 = y2 + h2;
			const r2 = x2 + w2;

			if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
			return true;
		},
	},
	rand: {
		int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
	},
};
