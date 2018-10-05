/* ROOM */

const roomName = "Room Name";
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
const adminPassword = 1000 + getRandomInt(9000);
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

var checkTimeVariable = 0;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // return random number from 0 to max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
	var len = arr.length, min = Infinity;
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

/* BUTTONS */

function topBtn() {
	if (teamS.length == 0) {
		return;
	}
	else {
		if (teamR.length == teamB.length) {
			if (teamS.length > 1) {
				room.setPlayerTeam(teamS[0].id,Team.RED);
				room.setPlayerTeam(teamS[1].id,Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[0].id,Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[0].id,Team.BLUE);
		}
	}
}

function randomBtn() {
	if (teamS.length == 0) {
		return;
	}
	else {
		if (teamR.length == teamB.length) {
			if (teamS.length > 1) {
				var r = getRandomInt(teamS.length);
				room.setPlayerTeam(teamS[r].id,Team.RED);
				teamS = teamS.filter((spec) => spec.id != teamS[r].id);
				room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.BLUE);
			}
			return;
		}
		else if (teamR.length < teamB.length) {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.RED);
		}
		else {
			room.setPlayerTeam(teamS[getRandomInt(teamS.length)].id,Team.BLUE);
		}
	}
}

function blueToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamB.length; i++) {
		room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
	}
}

function redToSpecBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	for (var i = 0; i < teamR.length; i++) {
		room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
	}
}

function resetBtn() {
	resettingTeams = true;
	setTimeout(function() { resettingTeams = false; }, 100);
	if (teamR.length <= teamB.length) {
		for (var i = 0; i < teamR.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamR.length; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
		}
	}
	else {
		for (var i = 0; i < teamB.length; i++) {
			room.setPlayerTeam(teamB[teamB.length - 1 - i].id, Team.SPECTATORS);
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
		for (var i = teamB.length; i < teamR.length; i++) {
			room.setPlayerTeam(teamR[teamR.length - 1 - i].id, Team.SPECTATORS);
		}
	}
}

/* GAME FUNCTIONS */

function quickPause() {
	room.pauseGame(true);
	setTimeout(function() { room.pauseGame(false); }, 1000);
}

function quickRestart() {
	room.stopGame();
	setTimeout(function() { room.startGame(); }, 2000);
}

function resumeGame() {
	setTimeout(function() { room.startGame(); }, 2000);
	setTimeout(function() { room.pauseGame(false); }, 1000);
}

function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01) {
		if (scores.red != scores.blue) {
			checkTimeVariable += 1;
			if (checkTimeVariable == 1) {
				if (scores.red > scores.blue) {
					endGame(Team.RED);
					room.stopGame();
				}
				else {
					endGame(Team.BLUE);
					room.stopGame();
				}
			}
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
		}
		goldenGoal = true;
		room.sendChat("⚽ First goal wins! ⚽");
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			room.sendChat("⌛ 60 seconds left until draw! ⌛");
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2) {
		checkTimeVariable += 1;
		if (checkTimeVariable == 1) {
			endGame(Team.SPECTATORS);
			room.stopGame();
			setTimeout(function() { checkTimeVariable = 0; }, 10); 
			return;
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
	players.forEach(function(element){ copie.push(element.id); });
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

room.onPlayerJoin = function(player) {
	room.sendChat("Welcome " + player.name + " !");
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
	room.sendChat("Goodbye " + player.name + " !");
	updateTeams();
	updateAdmins();
}

room.onPlayerKicked = function(kickedPlayer, reason, ban, byPlayer) {
}

room.onPlayerChat = function(player, message) {
	message = message.split(" ");
	if (message[0] == '!claim') {
		if (message[1] == adminPassword) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	if (message[0][0] == "!") {
		return false;
	}
}

room.onPlayerActivity = function(player) {
}

room.onGameStart = function(byPlayer) {
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
	if (team == Team.RED) {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.RED) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.RED) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
		}
		if (scores.red == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.RED);
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
	else {
		if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == Team.BLUE) {
			if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == Team.BLUE) {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Assist by " + lastPlayersTouched[1].name + ". Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
			else {
				room.sendChat("⚽ " + getTime(scores) + " Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
			}
		}
		else {
			room.sendChat("😂 " + getTime(scores) + " Own Goal by " + lastPlayersTouched[0].name + " ! Goal speed : " + ballSpeed.toPrecision(4).toString() + "km/h 🔴");
		}
		if (scores.blue == scores.scoreLimit || goldenGoal == true) {
			endGame(Team.BLUE);
			setTimeout(function(){ room.stopGame(); }, 1000);
		}
	}
}

room.onPositionsReset = function() {
	lastPlayersTouched = [null, null];
}

room.onPlayerBallKick = function(player) {
	if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
		lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
	}
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getStats();
}
