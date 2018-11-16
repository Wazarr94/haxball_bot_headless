/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const botName = "HaxBot";
const maxPlayers = 12;
const roomPublic = true;
const geo = [{"code": "DE", "lat": 51.1, "lon": 10.4}, {"code": "FR", "lat": 46.2, "lon": 2.2}, {"code": "PL", "lat": 51.9, "lon": 19.1}, {"code": "GB", "lat": 55.3, "lon": -3.4}, {"code": "PT", "lat": 39.3, "lon": -8.2}];
const scoreLimit = 3;
const timeLimit = 3;
const Team = {
	SPECTATORS: 0,
	RED: 1,
	BLUE: 2
};
const adminPassword = 100 + getRandomInt(900);
console.log("adminPassword : " + adminPassword);

const room = HBInit({roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, playerName: botName, geo: geo[0]});

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

/* OPTIONS */

var drawTimeLimit = Infinity;

/* PLAYERS */

var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var lastPlayersTouched;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var goldenGoal = false;

/* AUXILIARY */

var checkTimeVariable = false;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // return random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
    var len = arr.length
    var min = Infinity;
	while (len--) {
		if (arr[len] < min) {
			min = arr[len];
	  	}
	}
	return min;
}

function getTime(scores) {
	return "[" + Math.floor(Math.floor(scores.time/60)/10).toString() + Math.floor(Math.floor(scores.time/60)%10).toString() + ":" + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))/10).toString() + Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))%10).toString() + "]"
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) {
		if (scores.red != scores.blue) {
			if (checkTimeVariable == false) {
				checkTimeVariable = true;
				setTimeout(() => { checkTimeVariable = false; }, 10);
				if (scores.red > scores.blue) {
					endGame(Team.RED);
					setTimeout(() => { room.stopGame(); }, 2000);
				}
				else {
					endGame(Team.BLUE);
					setTimeout(() => { room.stopGame(); }, 2000);
				}
			}
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			endGame(Team.SPECTATORS);
			room.stopGame();
			goldenGoal = false;
		}
	}
}

function endGame(winner) { // no stopGame() function in it
	if (winner == Team.RED) {
		room.sendChat("🔴 Red Team won " + game.scores.red + "-" + game.scores.blue + "!");
	}
	else if (winner == Team.BLUE) {
		room.sendChat("🔵 Blue Team won " + game.scores.blue + "-" + game.scores.red + "!");
	}
	else {
		room.sendChat("💤 Draw limit reached! 💤");
	}
}

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList().filter((player) => player.id != 0);
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

function updateAdmins() {
	if (players.length == 0 || players.find((player) => player.admin) != null) {
		return;
	}
	var copie = []; 
	players.forEach(function(element) { copie.push(element.id); });
	room.setPlayerAdmin(arrayMin(copie), true); // Give admin to the player who's played the longest on the room
}

/* STATS FUNCTIONS */

function getStats() {
	const ballPosition = room.getBallPosition();
	point[1] = point[0];
	point[0] = ballPosition;
	ballSpeed = (pointDistance(point[0], point[1])*60*60*60)/15000;
}

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
	room.sendChat("[PV] 👋 Welcome " + player.name + " !", player.id);
	updateTeams();
	updateAdmins();
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
	if (changedPlayer.id == 0) {
		room.setPlayerTeam(0, Team.SPECTATORS);
		return;
	}
	updateTeams();
}

room.onPlayerLeave = function(player) {
	updateTeams();
	updateAdmins();
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (message[0] == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
			adminPassword = 100 + getRandomInt(900);
			console.log("adminPassword : " + adminPassword);
		}
	}
	if (message[0][0] == "!") {
		return false;
	}
}

room.onPlayerActivity = function(player) {
}

room.onPlayerBallKick = function(player) {
    if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
        lastPlayersTouched[1] = lastPlayersTouched[0];
        lastPlayersTouched[0] = player;
    }
}

/* GAME MANAGEMENT */

room.onGameStart = function(byPlayer) {
	goldenGoal = false;
	lastPlayersTouched = [null, null];
}

room.onGameStop = function(byPlayer) {
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
	const scores = room.getScores();
	if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == team) {
		if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == team) {
			room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
		}
		else {
			room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
		}
	}
	else {
		room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h " + (team == Team.RED ? "🔴" : "🔵"));
	}
	if (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit || goldenGoal == true) {
		endGame(team);
		goldenGoal = false;
		setTimeout(() => { room.stopGame(); }, 1000);
	}
}

room.onPositionsReset = function() {
	lastPlayersTouched = [null, null];
}

/* MISCELLANEOUS */

room.onRoomLink = function(url) {
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getStats();
}
