import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { withRouter } from "react-router-dom";
import { Launcher } from "../../components";
import classnames from "classnames";
import styles from "../../assets/scss/orbtag.module.scss";
import moment from "moment";

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

const IS_DEV = process.env.NODE_ENV !== "production";
const wsUrl = IS_DEV ? "localhost:5000" : undefined;

const Orbtag = ({ history }) => {
	const [players, setPlayers] = useState([]);
	const [gameState, setGameState] = useState({});
	const [gameConstants, setGameConstants] = useState({});
	const [gameJoined, setGameJoined] = useState(false);
	const [messages, setMessages] = useState([]);
	const [newMessagesCount, setNewMessagesCount] = useState(0);
	const [messageWindowOpen, setMessageWindowOpen] = useState(false);
	const [gameFeed, setGameFeed] = useState([]);
	const roundMessageRef = useRef();
	const socketRef = useRef();

	const logout = () => {
		fetch("/api/users", {
			method: "DELETE",
		}).then(() => {
			history.push("/");
		});
	};

	useEffect(() => {
		const socket = io.connect(wsUrl);
		socketRef.current = socket;
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
		socket.on("game_state_message", (msg) => {
			roundMessageRef.current.innerHTML = msg;
			roundMessageRef.current.classList.remove(styles.hidden);
			roundMessageRef.current.classList.add(styles.roundMessage);
			setTimeout(() => {
				if (!roundMessageRef.current) return;
				roundMessageRef.current.classList.remove(styles.roundMessage);
				roundMessageRef.current.classList.add(styles.hidden);
			}, 5000);
		});
		socket.on("user_message_receive", (msg) => {
			setNewMessagesCount((prev) => prev + 1);
			setMessages((prev) => [...prev, { ...msg, author: "them" }]);
		});
		socket.on("game_feed_message", (msg) => {
			setGameFeed((prev) => [msg, ...prev.slice(0, 19)]);
		});
		socket.emit("game_join", { gameId: 0 });

		const movementListener = (evt) => {
			if (messageWindowOpen) return;
			const { key } = evt;
			const direction = MOVEMENT_MAP[key];
			if (!direction) return;
			socket.emit("user_update_direction", direction);
		};
		const applyBoostListener = (evt) => {
			if (messageWindowOpen) return;
			const { key } = evt;
			if (!BOOST_MAP[key]) return;
			socket.emit("user_update_boosting", true);
		};
		const removeBoostListener = (evt) => {
			const { key } = evt;
			if (!BOOST_MAP[key]) return;
			socket.emit("user_update_boosting", false);
		};
		window.document.addEventListener("keydown", movementListener);
		window.document.addEventListener("keydown", applyBoostListener);
		window.document.addEventListener("keyup", removeBoostListener);
		return () => {
			logout();
			socket.disconnect();
			window.document.removeEventListener("keydown", movementListener);
			window.document.removeEventListener("keydown", applyBoostListener);
			window.document.removeEventListener("keyup", removeBoostListener);
		};
	}, []);

	if (!gameJoined) return <p>loading...</p>;

	const sendMessage = (msg) => {
		const { name, color } = history.location.state;
		const myMessage = { ...msg, name, style: { backgroundColor: color } };
		setMessages((prev) => [...prev, myMessage]);
		if (socketRef.current)
			socketRef.current.emit("user_message_send", myMessage);
	};
	const messageWindowClick = () => {
		setMessageWindowOpen((prev) => !prev);
		setNewMessagesCount(0);
	};

	const { name } = history.location.state;
	const { boost = 100 } = players.find(({ name: n }) => n === name) || {};
	const waitingForPlayers = gameState.NAME === "Waiting for players";

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
				<div
					style={{
						backgroundColor: "transparent",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						position: "absolute",
						height: "100%",
						width: "100%",
					}}
				>
					{waitingForPlayers && (
						<div
							style={{
								height: "100%",
								width: "100%",
								borderRadius: gameConstants.PLAYER_SIZE,
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<h2>Waiting for more players to join...</h2>
							<InviteLink />
						</div>
					)}
					<h2 ref={roundMessageRef}></h2>
				</div>
				{!waitingForPlayers && (
					<>
						<div style={{ position: "absolute", top: 0, left: -200 }}>
							<table className={styles.pointsTable}>
								<thead>
									<th></th>
									<th>points</th>
								</thead>
								<tbody>
									{players
										.sort((a, b) => b.points - a.points)
										.map(({ points, color, name }) => (
											<tr>
												<td>
													<span
														style={{
															backgroundColor: color,
															borderRadius:
																gameConstants.PLAYER_SIZE,
															padding: "5px 10px",
															color: "#222",
														}}
													>
														{name}
													</span>
												</td>
												<td>{points}</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
			<div style={{ position: "absolute", top: 100, right: 10, opacity: "0.9" }}>
				{gameFeed.map((f) => (
					<div dangerouslySetInnerHTML={{ __html: f }} />
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
			<div className="chat-window">
				<Launcher
					agentProfile={{
						teamName: "Chat",
					}}
					onMessageWasSent={sendMessage}
					messageList={messages}
					showEmoji
					newMessagesCount={newMessagesCount}
					isOpen={messageWindowOpen}
					handleClick={messageWindowClick}
					mute
				/>
			</div>
			<button onClick={logout}>Logout</button>
		</div>
	);
};

const subject = encodeURI("Come play orbtag with me!");
const baseUrl = encodeURI(
	process.env.BASE_URL || "https://orbiapp.herokuapp.com"
);
const body = encodeURI(
	`I need more players to join me in orbtag at ${baseUrl}\n\n<a href="${baseUrl}">${baseUrl}</a>`
);
const InviteLink = () => (
	<a href={`mailto:?subject=${subject}&body=${body}`}>Invite Friends</a>
);

const GameState = ({ DURATION_IN_MS, stateStartedAt, NAME }) => {
	let timeRemaining = null;
	if (stateStartedAt) {
		timeRemaining = moment(stateStartedAt)
			.add(DURATION_IN_MS, "ms")
			.diff(moment(), "seconds");
	}

	return (
		<div>
			<p>
				{NAME} {timeRemaining}
			</p>
		</div>
	);
};

export default withRouter(Orbtag);
