/* VARIABLES */

/* ROOM */

const roomName = "Room Name";
const maxPlayers = 20;
const roomPublic = true;
const token = ""; // Insert token here

if (typeof token === "string" && token.length === 39) var room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, token: token, public: roomPublic, noPlayer: true });
else var room = HBInit({ roomName: roomName, maxPlayers: maxPlayers, public: roomPublic, noPlayer: true });

const scoreLimit = 3;
const timeLimit = 3;

room.setScoreLimit(scoreLimit);
room.setTimeLimit(timeLimit);
room.setTeamsLock(true);
room.setKickRateLimit(6, 0, 0);

var adminPassword = 1000 + getRandomInt(9000);

/* OPTIONS */

var drawTimeLimit = Infinity;
var maxAdmins = 2;

/* PLAYERS */

const Team = { SPECTATORS: 0, RED: 1, BLUE: 2 };
const State = { PLAY: 0, PAUSE: 1, STOP: 2 };
const Role = { PLAYER: 0, ADMIN: 1 };
const Notification = { NONE: 0, CHAT: 1, MENTION: 2 };
var gameState = State.STOP;
var players;
var teamR;
var teamB;
var teamS;

var commands = {
	"help": {
		"aliases": [],
		"roles": Role.PLAYER,
		"desc": `
	This command shows all the available commands. It also can show the description of a command in particular.
Exemple: \'!help bb\' will show the description of the \'bb\' command.`,
		"function": helpCommand,
	},
	"claim" : {
		"aliases": [],
		"roles": Role.PLAYER,
		"desc" : false,
		"function": adminCommand,
	},
	"bb": {
		"aliases": ["bye", "gn", "cya"],
		"roles": Role.PLAYER,
		"desc": `
	This command makes you leave instantly (use recommended)`,
		"function": leaveCommand,
	},
	"rr": {
		"aliases": [],
		"roles": Role.ADMIN,
		"desc": `
	Admin command.
This command makes the game restart.`,
		"function": restartCommand,
	},
};

/* GAME */

var lastPlayersTouched;
var lastTeamTouched;
var point = [{"x": 0, "y": 0}, {"x": 0, "y": 0}];
var speedCoefficient = 100 / (5 * (0.99 ** 60 + 1));
var ballSpeed;
var goldenGoal = false;
var activePlay = false;
var playerRadius = 15;
var ballRadius = 10;
var triggerDistance = playerRadius + ballRadius + 0.01;

/* COLORS */

var welcomeColor = 0xC4FF65;
var announcementColor = 0xFFEFD6;
var redColor = 0xFF4C4C;
var blueColor = 0x62CBFF;
var statsColor = 0xBEBEBE;
var defaultColor = null;

/* AUXILIARY */

var checkTimeVariable = false;
var checkDrawWarning = false;
var checkStadiumVariables = true;
var unpauseTimeout;

/* FUNCTIONS */

/* AUXILIARY FUNCTIONS */

function getRandomInt(max) { // returns a random number between 0 and max-1
	return Math.floor(Math.random() * Math.floor(max)); 
}

function getTime(scores) { // gives the time of the game formatted like in haxball but within brackets
	return `[${Math.floor(Math.floor(scores.time/60)/10)}${Math.floor(Math.floor(scores.time/60)%10)}:${Math.floor(Math.floor(scores.time-(Math.floor(scores.time/60)*60))/10)}${Math.floor(Math.floor(scores.time-(Math.floor(scores.time/60)*60))%10)}]`;
}

function pointDistance(p1, p2) {
	var d1 = p1.x - p2.x;
	var d2 = p1.y - p2.y;
	return Math.sqrt(d1 * d1 + d2 * d2);
}

function getCommand(commandStr) {
	if (commands.hasOwnProperty(commandStr)) return commandStr;
	for (const [key, value] of Object.entries(commands)) {
		for (let i = 0; i < value.aliases.length; i++) {
			if (value.aliases[i] === commandStr) return key;
		}
	}
	return false;
}
 
/* STADIUM FUNCTIONS */

function calculateStadiumVariables() {
	if (checkStadiumVariables && teamR.length + teamB.length !== 0) {
		checkStadiumVariables = false;
		setTimeout(() => {
			let ballDisc = room.getDiscProperties(0);
			let playerDisc = room.getPlayerDiscProperties(teamR.concat(teamB)[0].id);
			ballRadius = ballDisc.radius
			playerRadius = playerDisc.radius;
			speedCoefficient = 100 / (5 * ballDisc.invMass * (ballDisc.damping ** 60 + 1)); // To be improved
		}, 1);
	}
}

/* PLAYER FUNCTIONS */

function getRole(player) {
	return player.admin * 1;
}

/* COMMAND FUNCTIONS */

function restartCommand(player, message) {
	if (player.admin) instantRestart();
}

function leaveCommand(player, message) {
	room.kickPlayer(player.id, "Bye !", false);
}

function adminCommand(player, message) {
	msgArray = message.split(/ +/).slice(1);
	if (parseInt(msgArray[0]) === adminPassword) room.setPlayerAdmin(player.id, true);
}

function helpCommand(player, message) {
	msgArray = message.split(/ +/).slice(1);
	if (msgArray.length === 0) {
		var commandString = "[PV] Player commands :";
		for (const [key, value] of Object.entries(commands)) {
			if (value.desc && value.roles === Role.PLAYER) commandString += ` !${key},`;
		}
		commandString = commandString.substring(0, commandString.length - 1) + ".";
		if (getRole(player) === Role.ADMIN) {
			commandString += `\n        Admin commands :`;
			for (const [key, value] of Object.entries(commands)) {
				if (value.desc && value.roles === Role.ADMIN) commandString += ` !${key},`;
			}
		}
		commandString = commandString.substring(0, commandString.length - 1) + ".";
		commandString += "\n\n To get information on a specific command, type '\'!help <command name>\'.";
		room.sendAnnouncement(commandString, player.id, statsColor, "bold", Notification.CHAT);
	}
	else if (msgArray.length >= 1) {
		var commandName = getCommand(msgArray[0].toLowerCase());
		if (commandName && commands[commandName].desc) room.sendAnnouncement(`[PV] \'${commandName}\' command :\n${commands[commandName].desc}`, player.id, statsColor, "bold", Notification.CHAT);
		else room.sendAnnouncement(`[PV] The command you tried to get information on does not exist. To check all available commands, type \'!help\'`, player.id, statsColor, "bold", Notification.CHAT);
	}
}

/* GAME FUNCTIONS */

function checkTime() {
	const scores = room.getScores();
	if (Math.abs(scores.time - scores.timeLimit) <= 0.01 && scores.timeLimit !== 0 && activePlay) {
		if (scores.red !== scores.blue) {
			if (checkTimeVariable === false) {
				checkTimeVariable = true;
				setTimeout(() => { checkTimeVariable = false; }, 3000);
				scores.red > scores.blue ? endGame(Team.RED) : endGame(Team.BLUE);
				setTimeout(() => { room.stopGame(); }, 2000);
			}
			return;
		}
		goldenGoal = true;
		room.sendAnnouncement("⚽ First goal wins !", null, announcementColor, "bold", Notification.CHAT);
	}
	if (Math.abs(drawTimeLimit * 60 - scores.time - 60) <= 0.01 && players.length > 2) {
		if (checkTimeVariable === false) {
			checkTimeVariable = true;
			checkDrawWarning = true;
			setTimeout(() => { checkTimeVariable = false; }, 10);
			if (activePlay) room.sendAnnouncement("⌛ 60 seconds left until draw !", null, announcementColor, "bold", Notification.CHAT);
		}
	}
	if (Math.abs(scores.time - drawTimeLimit * 60) <= 0.01 && players.length > 2 && checkDrawWarning) {
		if (checkTimeVariable === false) {
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
    setTimeout(() => { room.startGame(); }, 10);
}

function endGame(winner) { // no stopGame function in it
	const scores = room.getScores();
	if (winner === Team.RED) {
		room.sendAnnouncement(`✨ Red Team won ${scores.red} - ${scores.blue} !`, null, redColor, "bold", Notification.CHAT);
	}
	else if (winner === Team.BLUE) {
		room.sendAnnouncement(`✨ Blue Team won ${scores.blue} - ${scores.red} !`, null, blueColor, "bold", Notification.CHAT);
	}
	else {
		room.sendAnnouncement("💤 Draw limit reached !", null, announcementColor, "bold", Notification.CHAT);
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
	if (players.length !== 0 && players.filter((p) => p.admin).length < maxAdmins) {
		let playerArray = players.filter((p) => p.id !== excludedPlayerID && p.admin === false);
		let arrayID = playerArray.map((player) => player.id);
		room.setPlayerAdmin(Math.min(...arrayID), true);
	}
}


/* STATS FUNCTIONS */

function getLastTouchOfTheBall() {
	const ballPosition = room.getBallPosition();
	updateTeams();
	let playerArray = [];
	for (var i = 0; i < players.length; i++) {
		if (players[i].position !== null) {
			var distanceToBall = pointDistance(players[i].position, ballPosition);
			if (distanceToBall < triggerDistance) {
				if (!activePlay) activePlay = true;
				playerArray.push([players[i], distanceToBall]);
			}
		}
	}
	if (playerArray.length !== 0) {
		let playerTouch = playerArray.sort((a, b) => a[1] - b[1])[0][0];
		if (lastTeamTouched === playerTouch.team || lastTeamTouched === Team.SPECTATORS) {
			if (lastPlayersTouched[0] === null || (lastPlayersTouched[0] !== null && lastPlayersTouched[0].id !== playerTouch.id)) {
				lastPlayersTouched[1] = lastPlayersTouched[0];
				lastPlayersTouched[0] = playerTouch;
			}
			lastTeamTouched = playerTouch.team // A single touch is not enough to "deny" a goal
		}
	}
}

function getStats() { // gives the speed of the ball
	const ballPosition = room.getBallPosition();
	point[1] = point[0];
	point[0] = ballPosition;
	ballSpeed = pointDistance(point[0], point[1]) * speedCoefficient;
}

/* EVENTS */

/* PLAYER MOVEMENT */

room.onPlayerJoin = function(player) {
	room.sendAnnouncement(`[PV] 👋 Welcome ${player.name} !`, player.id, welcomeColor, "bold", Notification.CHAT);
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
	if (ban && byPlayer.id === kickedPlayer.id) room.clearBan(kickedPlayer.id);
}

/* PLAYER ACTIVITY */

room.onPlayerChat = function(player, message) {
	let msgArray = message.split(/ +/);
	if (msgArray[0][0] === '!') {
		let command = getCommand(msgArray[0].slice(1).toLowerCase());
		if (command) commands[command].function(player, message);
		return false;
	}
}

room.onPlayerActivity = function(player) {
}

room.onPlayerBallKick = function(player) {
    if (lastPlayersTouched[0] === null || player.id !== lastPlayersTouched[0].id) {
		if (!activePlay) activePlay = true;
		lastTeamTouched = player.team;
        lastPlayersTouched[1] = lastPlayersTouched[0];
		lastPlayersTouched[0] = player;
    }
}

/* GAME MANAGEMENT */

room.onGameStart = function (byPlayer) {
	gameState = State.PLAY;
	goldenGoal = false;
	activePlay = false;
	lastPlayersTouched = [null, null];
	checkDrawWarning = false;
	calculateStadiumVariables();
}

room.onGameStop = function (byPlayer) {
	gameState = State.STOP;
}

room.onGamePause = function(byPlayer) {
	clearTimeout(unpauseTimeout);
	gameState = State.PAUSE;
}

room.onGameUnpause = function(byPlayer) {
	unpauseTimeout = setTimeout(() => { gameState = State.PLAY; }, 1000);
}

room.onTeamGoal = function(team) {
	const scores = room.getScores();
	activePlay = false;
	if (lastPlayersTouched[0] !== null) {
		if (lastPlayersTouched[0].team === team) {
			if (lastPlayersTouched[1] !== null && lastPlayersTouched[1].team === team) {
				room.sendAnnouncement(`⚽ ${getTime(scores)} Goal by ${lastPlayersTouched[0].name} ! Assist by ${lastPlayersTouched[1].name}. Goal speed : ${ballSpeed.toFixed(2)}km/h.`, null, (team === Team.RED ? redColor : blueColor), null, Notification.CHAT);
			}
			else {
				room.sendAnnouncement(`⚽ ${getTime(scores)} Goal by ${lastPlayersTouched[0].name} ! Goal speed : ${ballSpeed.toFixed(2)}km/h.`, null, (team === Team.RED ? redColor : blueColor), null, Notification.CHAT);
			}
		}
		else {
			room.sendAnnouncement(`😂 ${getTime(scores)} Own goal by ${lastPlayersTouched[0].name} ! Goal speed : ${ballSpeed.toFixed(2)}km/h.`, null, (team === Team.RED ? redColor : blueColor), null, Notification.CHAT);
		}
	}
	if (scores.scoreLimit !== 0 && (scores.red === scores.scoreLimit || scores.blue === scores.scoreLimit || goldenGoal === true)) {
		endGame(team);
		goldenGoal = false;
		setTimeout(() => { room.stopGame(); }, 1000);
	}
}

room.onPositionsReset = function() {
	lastPlayersTouched = [null, null];
	lastTeamTouched = Team.SPECTATORS;
}

/* MISCELLANEOUS */

room.onRoomLink = function (url) {
	console.log(`${url}\nadminPassword : ${adminPassword}`);
}

room.onPlayerAdminChange = function(changedPlayer, byPlayer) {
	updateTeams();
	updateAdmins(changedPlayer.admin === false && changedPlayer.id === byPlayer.id ? changedPlayer.id : 0);
}

room.onStadiumChange = function(newStadiumName, byPlayer) {
	checkStadiumVariables = true;
}

room.onGameTick = function() {
	checkTime();
	getStats();
	getLastTouchOfTheBall();
}
