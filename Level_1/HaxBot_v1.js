/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const maxPlayers = 12;
const roomPublic = false;
const token = ""; // Insert token here
if (typeof token === "string" && token.length === 39) var room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, token: token, public: roomPublic, noPlayer: true });
else var room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, noPlayer: true });

const scoreLimit = 3;
const timeLimit = 3;
room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);

var adminPassword = 1000 + getRandomInt(9000);
console.log(`adminPassword : ${adminPassword}`);

/* OPTIONS */

var drawTimeLimit = Infinity;

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
var players;
var teamR;
var teamB;
var teamS;

/* GAME */

var lastPlayersTouched;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var ballSpeed;
var goldenGoal = false;
var activePlay = false;

/* COLORS */

var welcomeColor = 0xC4FF65;
var announcementColor = 0xFFEFD6;
var redColor = 0xFF3F3F;
var blueColor = 0x62CBFF;
var defaultColor = null;

/* AUXILIARY */

var checkTimeVariable = false;
var checkDrawWarning = false;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // returns a random number between 0 and max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function arrayMin(arr) {
    var len = arr.length;
    var min = Infinity;
	while (len--) {
		if (arr[len] < min) min = arr[len];
	}
	return min;
}

function getTime(scores) { // gives the time of the game formatted just like haxball within brackets
	return `[${Math.floor(Math.floor(scores.time/60)/10)}${Math.floor(Math.floor(scores.time/60)%10)}:${Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))/10)}${Math.floor(Math.floor(scores.time - (Math.floor(scores.time/60) * 60))%10)}]`;
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01 && scores.timeLimit != 0 && activePlay) {
		if (scores.red != scores.blue) {
			if (checkTimeVariable == false) {
				checkTimeVariable = true;
				setTimeout(() => { checkTimeVariable = false; }, 3000);
				scores.red > scores.blue ? endGame(Team.RED) : endGame(Team.BLUE);
				setTimeout(() => { room.stopGame(); }, 2000);
			}
			return;
		}
		goldenGoal = true;
		room.sendAnnouncement("⚽ First goal wins !", null, announcementColor, "bold", null);
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			checkDrawWarning = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			if (activePlay) room.sendAnnouncement("⌛ 60 seconds left until draw !", null, announcementColor, "bold", null);
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2 && checkDrawWarning) {
		if (checkTimeVariable == false) {
			checkTimeVariable = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			endGame(Team.SPECTATORS);
			room.stopGame();
			goldenGoal = false;
		}
	}
}

function instantRestart() {
    room.stopGame();
    setTimeout(() => { room.startGame(); }, 20);
}

function endGame(winner) { // no stopGame function in it
	const scores = room.getScores();
	if (winner == Team.RED) {
		room.sendAnnouncement(`✨ Red Team won ${scores.red} - ${scores.blue} !`, null, redColor, "bold", null);
	}
	else if (winner == Team.BLUE) {
		room.sendAnnouncement(`✨ Blue Team won ${scores.blue} - ${scores.red} !`, null, blueColor, "bold", null);
	}
	else {
		room.sendAnnouncement("💤 Draw limit reached !", null, announcementColor, "bold", null);
	}
}

/* PLAYER FUNCTIONS */

function updateTeams() {
	players = room.getPlayerList();
	teamR = players.filter(p => p.team === Team.RED);
	teamB = players.filter(p => p.team === Team.BLUE);
	teamS = players.filter(p => p.team === Team.SPECTATORS);
}

function updateAdmins(excludedPlayerID = 0) {
	if (players.length != 0 && players.find((p) => p.admin) == null) {
		let playerArray = players.filter((p) => p.id != excludedPlayerID);
		let arrayID = playerArray.map((player) => player.id);
		room.setPlayerAdmin(arrayMin(arrayID), true);
	}
}


/* STATS FUNCTIONS */

function getLastTouchOfTheBall() {
	const ballPosition = room.getBallPosition();
	updateTeams();
	for (var i = 0; i < players.length; i++) {
		if (players[i].position != null) {
			var distanceToBall = pointDistance(players[i].position, ballPosition);
			if (distanceToBall < triggerDistance && !activePlay) activePlay = true;
		}
	}
}

function getStats() { // gives the speed of the ball
	const ballPosition = room.getBallPosition();
	point[1] = point[0];
	point[0] = ballPosition;
	ballSpeed = (pointDistance(point[0], point[1]) * 60 * 60 * 60) / 15000;
}

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
	room.sendAnnouncement(`[PV] 👋 Welcome ${player.name} !`, player.id, welcomeColor, "bold", null);
	updateTeams();
	updateAdmins();
}

room.onPlayerTeamChange = function(changedPlayer, byPlayer) {
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
	message = message.split(/ +/);
	if (["!claim"].includes(message[0].toLowerCase())) {
		if (message[1] == adminPassword && !player.admin) {
			room.setPlayerAdmin(player.id, true);
		}
	}
	else if (["!bb", "!bye", "!cya", "!gn"].includes(message[0].toLowerCase())) {
		room.kickPlayer(player.id, "Bye !", false);
	}
	else if (["!rr"].includes(message[0].toLowerCase())) {
		instantRestart();
	}
	if (message[0][0] == "!") {
		return false;
	}
}

room.onPlayerActivity = function(player) {
}

room.onPlayerBallKick = function(player) {
    if (lastPlayersTouched[0] == null || player.id != lastPlayersTouched[0].id) {
		if (!activePlay) activePlay = true;
        lastPlayersTouched[1] = lastPlayersTouched[0];
        lastPlayersTouched[0] = player;
    }
}

/* GAME MANAGEMENT */

room.onGameStart = function(byPlayer) {
	goldenGoal = false;
	activePlay = false;
	lastPlayersTouched = [null, null];
	checkDrawWarning = false;
}

room.onGameStop = function(byPlayer) {
}

room.onGamePause = function(byPlayer) {
}

room.onGameUnpause = function(byPlayer) {
}

room.onTeamGoal = function(team) {
	const scores = room.getScores();
	activePlay = false;
	if (lastPlayersTouched[0] != null && lastPlayersTouched[0].team == team) {
		if (lastPlayersTouched[1] != null && lastPlayersTouched[1].team == team) {
			room.sendAnnouncement(`⚽ ${getTime(scores)} Goal by ${lastPlayersTouched[0].name} ! Assist by ${lastPlayersTouched[1].name}. Goal speed : ${ballSpeed.toPrecision(4)}km/h.`, null, (team == Team.RED ? redColor : blueColor), null, null);
		}
		else {
			room.sendAnnouncement(`⚽ ${getTime(scores)} Goal by ${lastPlayersTouched[0].name} ! Goal speed : ${ballSpeed.toPrecision(4)}km/h.`, null, (team == Team.RED ? redColor : blueColor), null, null);
		}
	}
	else {
		room.sendAnnouncement(`😂 ${getTime(scores)} Own goal by ${lastPlayersTouched[0].name} ! Goal speed : ${ballSpeed.toPrecision(4)}km/h.`, null, (team == Team.RED ? redColor : blueColor), null, null);
	}
	if (scores.scoreLimit != 0 && (scores.red == scores.scoreLimit || scores.blue == scores.scoreLimit || goldenGoal == true)) {
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
	console.log(url);
	console.log(`adminPassword : ${adminPassword}`);
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
	updateAdmins(changedPlayer.admin == false && changedPlayer.id == byPlayer.id ? changedPlayer.id : 0);
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
}

room.onGameTick = function() {
	checkTime();
	getStats();
}
