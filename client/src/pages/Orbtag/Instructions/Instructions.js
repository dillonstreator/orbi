import React from "react";
import { Link } from "react-router-dom";

const Instructions = () => (
	<div
		style={{
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			margin: "0 auto",
			maxWidth: 764,
            textAlign: "center",
            padding: "15px 0 100px 0"
		}}
	>
		<h1>orbtag</h1>
		<h2>Movement</h2>
		<p>
			<strong>Up</strong> with up arrowkey or "w"
		</p>
		<p>
			<strong>Right</strong> with right arrowkey or "d"
		</p>
		<p>
			<strong>Down</strong> with down arrowkey or "s"
		</p>
		<p>
			<strong>Left</strong> with left arrowkey or "a"
		</p>
		<p>
			<strong>Boost</strong> with spacebar
		</p>
		<h2>Stages</h2>
		<h4>Waiting for players (duration until enough players...)</h4>
		<p>This is the time to invite friends to the site.</p>
		<p>
			This stage exists as there is no need for the server to perform game
			calculations while there are not enough players ( only 1 player) in
			game.
		</p>
		<h4>Cooldown (duration 5s)</h4>
		<p>
			During cooldown, a couple of different things take place. First, all
			players that were previously frozen will be unfrozen. Second, a player
			will be randomly selected to be <strong>"it"</strong> for the next round. This stage
			acts as a period for players to run away from the selected <strong>"it"</strong> player.
			Players cannot be frozen during this stage. Additionally, if someone
			attempted to enter the game during the <strong>Playing</strong> stage, they will be put
			into a queue. The queue is emptied during this stage and players are
			added to the game.
		</p>
		<h4>Playing (duration 20s)</h4>
		<p>
			This is where the magic happens. As you've probably guessed, the <strong>"it"</strong> 
			player is now attempting to tag (collide) with other players on the map
			in order to freeze them. The other players have the opposite task.
		</p>
		<h2>Points</h2>
		<p>The <strong>"it"</strong> player will receive 2 points for every player that they freeze during the <strong>Playing</strong> stage.</p>
		<p>The <strong>non "it"</strong> players will receive 1 point for every <strong>non "it"</strong> player in the game if they avoid getting frozen the entire <strong>Playing</strong> stage.</p>
		<Link to="/" style={{ color: "#ddd", fontSize: 24 }}>
			Sounds good - I want to play
		</Link>
	</div>
);

export default Instructions;
