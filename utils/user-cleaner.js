exports.cleanUserBy = function ({ name, sessionId }) {
	const user = sessionId
		? global.users[sessionId]
        : Object.values(global.users).find(({ name: n }) => n === name);
    if (!user) return false;

	delete global.users[user.sessionId];

	if (user.gameIdx === null) return true;
	const game = global.games[user.gameIdx];
	if (!game) return true;

	const waitingIdx = game.players.waiting.findIndex((value) => value.sessionId === sessionId);
	if (waitingIdx != -1) {
		game.players.waiting.splice(waitingIdx, 1);
	}

	const playingIdx = game.players.playing.findIndex((value) => value.sessionId === sessionId);
	if (playingIdx != -1) {
		game.players.playing.splice(playingIdx, 1);
    }
    return true;
};
