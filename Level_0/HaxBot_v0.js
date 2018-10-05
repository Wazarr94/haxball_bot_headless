/* ROOM */

const roomName = "Room name";
const botName = "BOT";
const maxPlayers = 12;
const roomPublic = false;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}];
const scoreLimit = 3;
const timeLimit = 3;
const Team = {
	SPECTATORS: 0,
	RED: 1,
	BLUE: 2
};

const room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[0] });

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

/* EVENTS */

room.onPlayerJoin = function(player) {
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
}

room.onPlayerLeave = function(player) {
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

room.onPlayerChat = function(player, message) {
}

room.onPlayerActivity = function(player) {
}

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

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
}
