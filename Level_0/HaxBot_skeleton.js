/* VARIABLES */

/* ROOM */

const roomName = "Hello World";
const botName = "HaxBot";
const maxPlayers = 12;
const roomPublic = true;
const scoreLimit = 3;
const timeLimit = 3;
const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };

const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName });

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
}

room.onPlayerLeave = function(player) {
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function(player, message) {
}

room.onPlayerActivity = function(player) {
}

room.onPlayerBallKick = function(player) {
}

/* GAME MANAGEMENT */

room.onGameStart = function(byPlayer) {
}

room.onGameStop = function(byPlayer) {
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
}

room.onPositionsReset = function() {
}

/* MISCELLANEOUS */

room.onRoomLink = function(url) {
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
}
