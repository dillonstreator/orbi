# Orbi
> A collection of orb based web socket games to play with others

This application was built while thinking through ideas to build for the [devchat hackathon](https://devhacks.deta.dev/challenge)

### Technologies Utilized
- [Node](https://nodejs.org)
- [Express](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Socket.IO](https://socket.io/)


## Games

### Orbtag
Basically freeze tag...
**Objective** There are two main phases to the game. The "cooldown" phase, which lasts 5 seconds, is a phase in which a player is randomly selected to be "it". This phase allows other players to identify the "it" player (this player will pulsate) and run away. After 5 seconds we enter the "playing" phase during which the "it" player will attempt to collide with other players in order to freeze them (as indicated by a snowflake icon). After 20 seconds of the "playing" phase, we re-enter the "cooldown" phase at which point everyone is unfrozen and a new random player will be selected as "it".
**\# Number of players** at least 2 players are required to start a game. A game immediately ends if less than 2 people are in the game and enters the "waiting for players" state.


### Orball
TDB