import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { withRouter } from "react-router-dom";
import classnames from "classnames";

const DOWN = "y+";
const UP = "y-";
const LEFT = "x-";
const RIGHT = "x+";

const MOVEMENT_MAP = {
	ArrowRight: RIGHT,
	d: RIGHT,
	ArrowLeft: LEFT,
	a: LEFT,
	ArrowDown: DOWN,
	s: DOWN,
	ArrowUp: UP,
	w: UP,
};

const BOOST_MAP = {
	" ": true,
};

const Orbtag = ({ history }) => {
	const [players, setPlayers] = useState([]);
	const [gameState, setGameState] = useState({});
	const [gameConstants, setGameConstants] = useState({});
	const [gameJoined, setGameJoined] = useState(false);

	const logout = () => {
		fetch("/api/users", {
			method: "DELETE",
		}).then(() => {
			history.push("/");
		});
	};

	useEffect(() => {
		const socket = io.connect();
		socket.on("disconnect", logout);
		socket.on("game_update_state", (state) => {
			setGameState((prev) => ({
				...prev,
				...state,
			}));
		});
		socket.on("game_update_players", setPlayers);
		socket.on("game_join_success", ({ constants, state, stateStartedAt }) => {
			setGameConstants(constants);
			setGameState({
				...state,
				stateStartedAt,
			});
			setGameJoined(true);
		});
		socket.emit("game_join", { gameId: 0 });

		const movemetListener = (evt) => {
			const { key } = evt;
			const direction = MOVEMENT_MAP[key];
			if (!direction) return;
			socket.emit("user_update_direction", direction);
		};
		const applyBoostListener = (evt) => {
			const { key } = evt;
			if (!BOOST_MAP[key]) return;
			socket.emit("user_update_boosting", true);
		};
		const removeBoostListener = (evt) => {
			const { key } = evt;
			if (!BOOST_MAP[key]) return;
			socket.emit("user_update_boosting", false);
		};
		window.document.addEventListener("keydown", movemetListener);
		window.document.addEventListener("keydown", applyBoostListener);
		window.document.addEventListener("keyup", removeBoostListener);
		return () => {
			socket.disconnect();
			window.document.removeEventListener("keydown", movemetListener);
			window.document.removeEventListener("keydown", applyBoostListener);
			window.document.removeEventListener("keyup", removeBoostListener);
		};
	}, []);

	if (!gameJoined) return <p>loading...</p>;

	const { name } = history.location.state;
	const { boost = 100 } = players.find(({ name: n }) => n === name) || {};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<h1 style={{ margin: 0 }}>orbtag</h1>
			<GameState {...gameState} />
			<div
				style={{
					backgroundColor: "#111",
					position: "relative",
					height: gameConstants.MAP_HEIGHT,
					width: gameConstants.MAP_WIDTH,
					borderRadius: gameConstants.PLAYER_SIZE,
				}}
			>
				{players.map((player) => (
					<div
						key={player.name}
						className={classnames({
							pulse: player.it,
							"fa-snowflake": player.frozen,
							far: player.frozen,
						})}
						style={{
							backgroundColor: player.color,
							position: "absolute",
							top: player.y,
							left: player.x,
							height: gameConstants.PLAYER_SIZE,
							width: gameConstants.PLAYER_SIZE,
							borderRadius: gameConstants.PLAYER_SIZE,
							color: "#333",
						}}
					></div>
				))}
			</div>
			<div
				style={{
					margin: "10px 0px",
					width: gameConstants.MAP_WIDTH,
					height: gameConstants.PLAYER_SIZE,
					borderRadius: gameConstants.PLAYER_SIZE,
					backgroundColor: "#111",
					padding: 3,
					position: "relative",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${boost}%`,
						backgroundColor: "#222",
						borderRadius: 25,
					}}
				/>
				<span style={{ position: "absolute", top: 8, left: 184 }}>
					BOOST (spacebar)
				</span>
			</div>
			<button onClick={logout}>Logout</button>
		</div>
	);
};

const GameState = ({ NAME }) => {
	return (
		<div>
			<p>{NAME}</p>
		</div>
	);
};

export default withRouter(Orbtag);
